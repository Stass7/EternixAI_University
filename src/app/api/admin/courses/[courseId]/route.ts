import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import connectToDatabase from '@/lib/db/mongodb'
import User from '@/models/User'
import Course from '@/models/Course'

// GET - получить конкретный курс
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    const params = await context.params
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

    const course = await Course.findById(params.courseId)
    
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
      isNew: course.isNew,
      newUntil: course.newUntil,
      publishedAt: course.publishedAt,
      lessons: course.lessons || [],
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      isStillNew: course.isNew && course.newUntil && course.newUntil > new Date()
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
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    const params = await context.params
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
      isNew,
      newUntil,
      lessons
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

    const updateData: any = {
      title: title.trim(),
      description: description.trim(),
      language,
      originalPrice: Number(originalPrice),
      price: price ? Number(price) : Number(originalPrice),
      category,
      published: published !== undefined ? published : false,
      featured: featured !== undefined ? featured : false,
      updatedAt: new Date()
    }

    // Пересчитываем скидку
    if (price && price < originalPrice) {
      updateData.discount = Math.round(((originalPrice - price) / originalPrice) * 100)
    } else {
      updateData.discount = 0
    }

    // Обновляем изображение если предоставлено
    if (imageUrl) {
      updateData.imageUrl = imageUrl
    }

    // Обновляем уроки если предоставлены
    if (lessons) {
      updateData.lessons = lessons
    }

    // Управление метками "новый"
    if (isNew !== undefined) {
      updateData.isNew = isNew
      if (isNew && newUntil) {
        updateData.newUntil = new Date(newUntil)
      } else if (isNew && !newUntil) {
        // Если помечаем как новый без даты, ставим 30 дней
        updateData.newUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    }

    // Обновляем дату публикации при изменении статуса
    if (published !== undefined) {
      const existingCourse = await Course.findById(params.courseId)
      if (existingCourse && !existingCourse.published && published) {
        updateData.publishedAt = new Date()
      } else if (!published) {
        updateData.publishedAt = null
      }
    }

    const course = await Course.findByIdAndUpdate(
      params.courseId,
      updateData,
      { new: true }
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
        isNew: course.isNew,
        newUntil: course.newUntil,
        publishedAt: course.publishedAt,
        lessonsCount: course.lessons?.length || 0,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        isStillNew: course.isNew && course.newUntil && course.newUntil > new Date()
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
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    const params = await context.params
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

    const course = await Course.findByIdAndDelete(params.courseId)
    
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