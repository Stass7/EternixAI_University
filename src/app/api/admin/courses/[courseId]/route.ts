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
      price: course.price,
      originalPrice: course.originalPrice,
      discount: course.discount,
      category: course.category,
      imageUrl: course.imageUrl,
      published: course.published,
      featured: course.featured,
      lessons: course.lessons || [],
      createdAt: course.createdAt,
      updatedAt: course.updatedAt
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
      originalPrice,
      price,
      category,
      imageUrl,
      published,
      featured,
      lessons
    } = body

    // Новая валидация: хотя бы один язык должен быть заполнен
    const hasTitle = (title?.ru && title.ru.trim()) || (title?.en && title.en.trim())
    const hasDescription = (description?.ru && description.ru.trim()) || (description?.en && description.en.trim())
    
    if (!hasTitle) {
      return NextResponse.json(
        { error: 'Title in at least one language is required' },
        { status: 400 }
      )
    }
    
    if (!hasDescription) {
      return NextResponse.json(
        { error: 'Description in at least one language is required' },
        { status: 400 }
      )
    }
    
    if (!originalPrice || !category) {
      return NextResponse.json(
        { error: 'Original price and category are required' },
        { status: 400 }
      )
    }

    // Заполняем пустые языки, если не указаны
    const courseTitle = {
      ru: title?.ru?.trim() || title?.en?.trim() || '',
      en: title?.en?.trim() || title?.ru?.trim() || ''
    }
    
    const courseDescription = {
      ru: description?.ru?.trim() || description?.en?.trim() || '',
      en: description?.en?.trim() || description?.ru?.trim() || ''
    }

    const updateData: any = {
      title: courseTitle,
      description: courseDescription,
      originalPrice: Number(originalPrice),
      price: price ? Number(price) : Number(originalPrice),
      category,
      published: published !== undefined ? published : true,
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
        price: course.price,
        originalPrice: course.originalPrice,
        discount: course.discount,
        category: course.category,
        imageUrl: course.imageUrl,
        published: course.published,
        featured: course.featured,
        lessonsCount: course.lessons?.length || 0,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt
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