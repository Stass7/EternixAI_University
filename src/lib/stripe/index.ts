import Stripe from 'stripe'

// Инициализация Stripe с API ключом только если он существует
const stripeApiKey = process.env.STRIPE_SECRET_KEY

if (!stripeApiKey && process.env.NODE_ENV !== 'development') {
  console.warn('Warning: STRIPE_SECRET_KEY is not set. Stripe functionality will be disabled.')
}

const stripe = stripeApiKey ? new Stripe(stripeApiKey, {
  // apiVersion: использую версию по умолчанию
}) : null

export async function createCheckoutSession(params: {
  courseId: string;
  courseTitle: string;
  price: number;
  userId: string;
  email: string;
  currency?: 'usd' | 'eur'; // Добавляем опциональный параметр валюты
}) {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.')
  }

  const { courseId, courseTitle, price, userId, email, currency = 'usd' } = params

  // Создаем сессию для оплаты
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: currency, // Используем переданную валюту или USD по умолчанию
          product_data: {
            name: courseTitle,
          },
          unit_amount: Math.round(price * 100), // Stripe ожидает цену в центах
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?sessionId={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/canceled`,
    customer_email: email,
    client_reference_id: userId,
    metadata: {
      courseId,
      userId,
    },
  })

  return session
}

export async function retrieveCheckoutSession(sessionId: string) {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.')
  }
  
  return await stripe.checkout.sessions.retrieve(sessionId)
}

export default stripe 