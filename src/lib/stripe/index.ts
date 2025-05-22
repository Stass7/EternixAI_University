import Stripe from 'stripe'

// Инициализация Stripe с API ключом
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-04-30.basil',
})

export async function createCheckoutSession(params: {
  courseId: string;
  courseTitle: string;
  price: number;
  userId: string;
  email: string;
}) {
  const { courseId, courseTitle, price, userId, email } = params

  // Создаем сессию для оплаты
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
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
  return await stripe.checkout.sessions.retrieve(sessionId)
}

export default stripe 