import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/config';
import connectToDatabase from '@/lib/db/mongodb';
import User from '@/models/User';
import Course from '@/models/Course';
import Order from '@/models/Order';

export async function POST(req: NextRequest) {
  try {
    const { courseId } = await req.json();
    
    if (!courseId) {
      return NextResponse.json({ error: 'Course ID required' }, { status: 400 });
    }

    // Получаем сессию пользователя
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await connectToDatabase();

    // Находим пользователя и курс
    const [user, course] = await Promise.all([
      User.findOne({ email: session.user.email }),
      Course.findById(courseId)
    ]);

    if (!user || !course) {
      return NextResponse.json({ error: 'User or course not found' }, { status: 404 });
    }

    // Проверяем что курс еще не куплен
    if (user.coursesOwned.includes(course._id)) {
      return NextResponse.json({ error: 'Course already owned' }, { status: 400 });
    }

    // Создаем тестовый заказ
    const order = new Order({
      userId: user._id,
      courseId: course._id,
      stripeSessionId: `test_session_${Date.now()}`,
      stripePaymentIntentId: `test_pi_${Date.now()}`,
      amount: course.price * 100, // в центах
      currency: 'usd',
      status: 'completed',
      completedAt: new Date()
    });

    await order.save();

    // Добавляем курс пользователю
    user.coursesOwned.push(course._id);
    await user.save();

    console.log('🧪 TEST: Course added to user:', {
      userId: user._id,
      courseId: course._id,
      userEmail: user.email,
      courseTitle: course.title
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Course added successfully (TEST MODE)',
      orderId: order._id
    });

  } catch (error) {
    console.error('Test webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 