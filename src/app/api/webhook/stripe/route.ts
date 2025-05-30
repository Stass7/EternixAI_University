import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

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
    
    // Логируем успешную оплату
    console.log('Payment successful for session:', session.id);
    console.log('Customer email:', session.customer_details?.email);
    console.log('Amount paid:', session.amount_total);
    
    // TODO: Здесь будет логика обработки успешной оплаты:
    // - Обновить базу данных
    // - Предоставить доступ к курсу
    // - Отправить письмо с подтверждением
  }

  return NextResponse.json({ received: true });
} 