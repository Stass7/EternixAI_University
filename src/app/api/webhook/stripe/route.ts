import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import connectToDatabase from '@/lib/db/mongodb';
import User from '@/models/User';
import Course from '@/models/Course';
import Order from '@/models/Order';
import PromoCode from '@/models/PromoCode';

// Проверяем наличие переменных окружения
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecretKey) {
  console.warn('STRIPE_SECRET_KEY environment variable is not set');
}

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  // apiVersion: использую версию по умолчанию
}) : null;

export async function POST(req: NextRequest) {
  // Проверяем, что Stripe инициализирован
  if (!stripe || !stripeWebhookSecret) {
    console.error('Stripe is not properly configured');
    return NextResponse.json({ error: 'Stripe configuration missing' }, { status: 500 });
  }

  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      stripeWebhookSecret
    );
  } catch (err) {
    console.error(`Webhook signature verification failed.`, err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Обработка события
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    try {
      console.log('Processing payment for session:', session.id);
      
      await connectToDatabase();
      
      // Извлекаем данные из метаданных сессии
      const metadata = session.metadata;
      const courseId = metadata?.courseId;
      const userId = metadata?.userId;
      
      if (!courseId || !userId) {
        console.error('Missing required metadata in session:', session.id);
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
      }

      // Находим пользователя и курс
      const [user, course] = await Promise.all([
        User.findById(userId),
        Course.findById(courseId)
      ]);

      if (!user || !course) {
        console.error('User or course not found:', { userId, courseId });
        return NextResponse.json({ error: 'User or course not found' }, { status: 404 });
      }

      // Создаем запись заказа
      const order = new Order({
        userId: user._id,
        courseId: course._id,
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent,
        amount: session.amount_total || 0,
        currency: session.currency || 'rub',
        status: 'completed',
        completedAt: new Date()
      });

      // Если был использован промокод
      if (metadata?.promoCodeId) {
        order.promoCodeId = metadata.promoCodeId;
        order.discountAmount = session.total_details?.amount_discount || 0;
        
        // Обновляем статистику использования промокода
        await PromoCode.findByIdAndUpdate(
          metadata.promoCodeId,
          {
            $inc: { usedCount: 1 },
            $push: { usedBy: user._id }
          }
        );
      }

      await order.save();

      // Добавляем курс к купленным курсам пользователя (если еще не добавлен)
      if (!user.coursesOwned.includes(course._id)) {
        user.coursesOwned.push(course._id);
        await user.save();
      }

      console.log('Payment processed successfully:', {
        sessionId: session.id,
        userId: user._id,
        courseId: course._id,
        amount: session.amount_total,
        email: session.customer_details?.email
      });

      // TODO: Отправить email с подтверждением покупки
      
    } catch (error) {
      console.error('Error processing payment:', error);
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
    }
  }

  // Обработка неудачных платежей
  if (event.type === 'checkout.session.expired' || event.type === 'payment_intent.payment_failed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    try {
      await connectToDatabase();
      
      // Создаем запись неудачного заказа
      const metadata = session.metadata;
      if (metadata?.courseId && metadata?.userId) {
        const order = new Order({
          userId: metadata.userId,
          courseId: metadata.courseId,
          stripeSessionId: session.id,
          amount: session.amount_total || 0,
          currency: session.currency || 'rub',
          status: 'failed'
        });
        
        await order.save();
        console.log('Failed payment recorded:', session.id);
      }
    } catch (error) {
      console.error('Error recording failed payment:', error);
    }
  }

  return NextResponse.json({ received: true });
} 