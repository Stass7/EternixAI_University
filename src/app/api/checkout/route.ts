import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db/mongodb'
import Course from '@/models/Course'
import User from '@/models/User'
import PromoCode from '@/models/PromoCode'
import { createCheckoutSession } from '@/lib/stripe'
import { getServerSession } from 'next-auth/next'
import mongoose from 'mongoose'

export async function POST(request: Request) {
  try {
    const { courseId, promoCodeId } = await request.json()
    
    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      )
    }
    
    // Проверяем валидность идентификатора курса
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json(
        { error: 'Invalid course ID' },
        { status: 400 }
      )
    }
    
    await connectToDatabase()
    
    // Находим курс
    const course = await Course.findById(courseId)
    
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }
    
    // Получаем данные пользователя из сессии
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be logged in to purchase a course' },
        { status: 401 }
      )
    }
    
    // Находим пользователя
    const user = await User.findOne({ email: session.user.email })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Проверяем, не приобрел ли пользователь уже этот курс
    if (user.coursesOwned.includes(course._id)) {
      return NextResponse.json(
        { error: 'You already own this course' },
        { status: 400 }
      )
    }
    
    // Определяем финальную цену с учетом промокода
    let finalPrice = course.price
    
    if (promoCodeId && mongoose.Types.ObjectId.isValid(promoCodeId)) {
      const promoCode = await PromoCode.findById(promoCodeId)
      
      if (promoCode && promoCode.active && new Date(promoCode.expiresAt) > new Date()) {
        // Проверяем применимость промокода к курсу
        if (!promoCode.courseId || promoCode.courseId.toString() === courseId) {
          // Применяем скидку
          finalPrice = course.price * (1 - promoCode.discountPercent / 100)
        }
      }
    }
    
    // Получаем заголовок курса для текущей локали
    const locale = request.headers.get('Accept-Language')?.startsWith('ru') ? 'ru' : 'en'
    const courseTitle = course.title.get(locale) || course.title.get('en') || 'Course'
    
    // Создаем сессию Stripe
    const checkoutSession = await createCheckoutSession({
      courseId: course._id.toString(),
      courseTitle,
      price: finalPrice,
      userId: user._id.toString(),
      email: user.email
    })
    
    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
} 