import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db/mongodb'
import PromoCode from '@/models/PromoCode'
import { getServerSession } from 'next-auth/next'
import mongoose from 'mongoose'
import User from '@/models/User'

export async function POST(request: Request) {
  try {
    // Получаем данные запроса
    const { code, courseId } = await request.json()
    
    if (!code) {
      return NextResponse.json(
        { error: 'Promo code is required' },
        { status: 400 }
      )
    }
    
    await connectToDatabase()
    
    // Находим промокод
    const promoCode = await PromoCode.findOne({
      code: code.toUpperCase(),
      active: true,
      expiresAt: { $gt: new Date() },
      usedCount: { $lt: mongoose.Types.ObjectId.isValid('$maxUses') }
    })
    
    if (!promoCode) {
      return NextResponse.json(
        { error: 'Invalid or expired promo code' },
        { status: 404 }
      )
    }
    
    // Проверяем, применим ли промокод к конкретному курсу
    if (promoCode.courseId && courseId) {
      if (promoCode.courseId.toString() !== courseId) {
        return NextResponse.json(
          { error: 'Promo code not applicable to this course' },
          { status: 400 }
        )
      }
    }
    
    // Получаем данные пользователя из сессии
    const session = await getServerSession()
    
    // Проверяем, не использовал ли пользователь уже этот промокод
    if (session?.user?.email) {
      // Находим пользователя по email
      const user = await User.findOne({ email: session.user.email })
      
      if (user && promoCode.usedBy.includes(user._id)) {
        return NextResponse.json(
          { error: 'You have already used this promo code' },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json({
      valid: true,
      discountPercent: promoCode.discountPercent,
      promoCodeId: promoCode._id
    })
  } catch (error) {
    console.error('Error validating promo code:', error)
    return NextResponse.json(
      { error: 'Failed to validate promo code' },
      { status: 500 }
    )
  }
} 