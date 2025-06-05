import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import connectToDatabase from '@/lib/db/mongodb'
import User from '@/models/User'
import Course from '@/models/Course'
import mongoose from 'mongoose'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    const params = await context.params
    const courseId = params.courseId
    
    // Проверяем валидность идентификатора курса
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json(
        { error: 'Invalid course ID' },
        { status: 400 }
      )
    }

    // Получаем сессию пользователя
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({
        hasAccess: false,
        reason: 'not_authenticated',
        message: 'You must be logged in to access courses'
      })
    }

    await connectToDatabase()

    // Проверяем существование курса
    const course = await Course.findById(courseId)
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Находим пользователя
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({
        hasAccess: false,
        reason: 'user_not_found',
        message: 'User not found'
      })
    }

    // Админы имеют доступ ко всем курсам
    if (user.role === 'admin') {
      return NextResponse.json({
        hasAccess: true,
        reason: 'admin_access',
        message: 'Admin has full access',
        courseTitle: course.title,
        userRole: 'admin'
      })
    }

    // Проверяем владение курсом
    const hasAccess = user.coursesOwned.includes(course._id)

    return NextResponse.json({
      hasAccess,
      reason: hasAccess ? 'purchased' : 'not_purchased',
      message: hasAccess 
        ? 'You have access to this course' 
        : 'You need to purchase this course to access it',
      courseTitle: course.title,
      coursePrice: course.price,
      userRole: user.role
    })

  } catch (error) {
    console.error('Error checking course access:', error)
    return NextResponse.json(
      { error: 'Failed to check course access' },
      { status: 500 }
    )
  }
} 