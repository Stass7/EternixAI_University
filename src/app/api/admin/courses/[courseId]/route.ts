import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import connectToDatabase from '@/lib/db/mongodb'
import User from '@/models/User'
import Course from '@/models/Course'
import { Types } from 'mongoose'

// GET - получить курс по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDatabase()
    
    const user = await User.findOne({ email: session.user.email })
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    if (!Types.ObjectId.isValid(courseId)) {
      return NextResponse.json(
        { error: 'Invalid course ID' },
        { status: 400 }
      )
    }

    const course: any = await Course.findById(courseId).lean()
    
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      _id: course._id.toString(),
      title: course.title,
      description: course.description,
      language: course.language,
      price: course.price,
      originalPrice: course.originalPrice,
      discount: course.discount,
      category: course.category,
      imageUrl: course.imageUrl,
      published: course.published,
      featured: course.featured,
      isNewCourse: course.isNewCourse,
      newUntil: course.newUntil,
      publishedAt: course.publishedAt,
      lessons: course.lessons || [],
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      isStillNew: course.isNewCourse && course.newUntil && course.newUntil > new Date()
    })
  } catch (error) {
    console.error('Admin course GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - обновить курс
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDatabase()
    
    const user = await User.findOne({ email: session.user.email })
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    if (!Types.ObjectId.isValid(courseId)) {
      return NextResponse.json(
        { error: 'Invalid course ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      language,
      originalPrice,
      price,
      category,
      imageUrl,
      published,
      featured,
      isNewCourse,
      newUntil,
      lessons = []
    } = body

    // Валидация обязательных полей
    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }
    
    if (!description?.trim()) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      )
    }
    
    if (!originalPrice || !category || !language) {
      return NextResponse.json(
        { error: 'Original price, category and language are required' },
        { status: 400 }
      )
    }

    // Подготавливаем данные для обновления
    const updateData: any = {
      title: title.trim(),
      description: description.trim(),
      language,
      originalPrice: Number(originalPrice),
      price: price ? Number(price) : Number(originalPrice),
      category,
      imageUrl: imageUrl || '/images/course-placeholder.jpg',
      lessons
    }

    // Обновляем статус публикации если передан
    if (typeof published === 'boolean') {
      updateData.published = published
    }

    // Обновляем featured если передан
    if (typeof featured === 'boolean') {
      updateData.featured = featured
    }

    // Обновляем статус "новый" если передан
    if (typeof isNewCourse === 'boolean') {
      updateData.isNewCourse = isNewCourse
      
      // Если включаем статус "новый", устанавливаем или обновляем дату
      if (isNewCourse) {
        updateData.newUntil = newUntil ? new Date(newUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      } else {
        updateData.newUntil = null
      }
    }

    // Вычисляем скидку
    const calculatedDiscount = updateData.price < updateData.originalPrice 
      ? Math.round(((updateData.originalPrice - updateData.price) / updateData.originalPrice) * 100)
      : 0
    
    updateData.discount = calculatedDiscount

    const course: any = await Course.findByIdAndUpdate(
      courseId,
      updateData,
      { new: true, runValidators: true }
    )

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      course: {
        _id: course._id.toString(),
        title: course.title,
        description: course.description,
        language: course.language,
        price: course.price,
        originalPrice: course.originalPrice,
        discount: course.discount,
        category: course.category,
        imageUrl: course.imageUrl,
        published: course.published,
        featured: course.featured,
        isNewCourse: course.isNewCourse,
        newUntil: course.newUntil,
        publishedAt: course.publishedAt,
        lessonsCount: course.lessons?.length || 0,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        isStillNew: course.isNewCourse && course.newUntil && course.newUntil > new Date()
      }
    })
  } catch (error) {
    console.error('Admin course PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - удалить курс
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDatabase()
    
    const user = await User.findOne({ email: session.user.email })
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    if (!Types.ObjectId.isValid(courseId)) {
      return NextResponse.json(
        { error: 'Invalid course ID' },
        { status: 400 }
      )
    }

    const course = await Course.findByIdAndDelete(courseId)
    
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully'
    })
  } catch (error) {
    console.error('Admin course DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 