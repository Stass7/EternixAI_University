import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import connectToDatabase from '@/lib/db/mongodb'
import User from '@/models/User'
import Course from '@/models/Course'
import Order from '@/models/Order'

export async function GET() {
  try {
    // Проверяем авторизацию и права администратора
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Проверяем роль пользователя
    await connectToDatabase()
    const user = await User.findOne({ email: session.user.email })
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    // Получаем статистику
    const [
      totalUsers,
      totalCourses,
      totalOrders,
      completedOrders,
      recentUsers,
      recentOrders
    ] = await Promise.all([
      // Общее количество пользователей
      User.countDocuments(),
      
      // Общее количество курсов
      Course.countDocuments({ published: true }),
      
      // Общее количество заказов
      Order.countDocuments(),
      
      // Завершенные заказы для подсчета дохода
      Order.find({ status: 'completed' }),
      
      // Последние 5 зарегистрированных пользователей
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email role createdAt'),
      
      // Последние 5 заказов
      Order.find()
        .populate('userId', 'name email')
        .populate('courseId', 'title')
        .sort({ createdAt: -1 })
        .limit(5)
    ])

    // Подсчитываем общий доход
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.amount, 0)

    // Форматируем данные для клиента
    const dashboardStats = {
      totalUsers,
      totalCourses,
      totalOrders,
      totalRevenue: Math.round(totalRevenue / 100), // конвертируем из копеек в рубли
      recentUsers: recentUsers.map(user => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt.toISOString()
      })),
      recentOrders: recentOrders.map(order => ({
        id: order._id.toString(),
        userName: order.userId?.name || 'Unknown User',
        courseName: order.courseId?.title?.ru || order.courseId?.title?.en || 'Unknown Course',
        amount: Math.round(order.amount / 100), // конвертируем из копеек в рубли
        status: order.status,
        createdAt: order.createdAt.toISOString()
      }))
    }

    return NextResponse.json(dashboardStats)
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 