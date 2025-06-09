import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import connectToDatabase from '@/lib/db/mongodb'
import User from '@/models/User'
import Course from '@/models/Course'
import { Types } from 'mongoose'

// GET - получить все курсы для админа
export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all' // all, published, draft
    const language = searchParams.get('language') || 'all' // all, ru, en

    // Построение фильтра поиска
    let filter: any = {}
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ]
    }

    if (status !== 'all') {
      filter.published = status === 'published'
    }

    if (language !== 'all') {
      filter.language = language
    }

    // Получаем курсы с пагинацией
    const [courses, totalCourses] = await Promise.all([
      Course.find(filter)
        .sort({ updatedAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .lean(),
      Course.countDocuments(filter)
    ])

    return NextResponse.json({
      courses: courses.map((course: any) => ({
        _id: (course._id as Types.ObjectId).toString(),
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
      })),
      pagination: {
        total: totalCourses,
        page,
        limit,
        totalPages: Math.ceil(totalCourses / limit)
      }
    })
  } catch (error) {
    console.error('Admin courses GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - создать новый курс
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDatabase()
    
    // 🔥 УДАЛЯЕМ СТАРЫЙ ИНДЕКС SLUG ЕСЛИ ОН СУЩЕСТВУЕТ
    try {
      await Course.collection.dropIndex('slug_1')
      console.log('✅ Старый индекс slug успешно удален')
    } catch (error) {
      // Индекс может не существовать - это нормально
      console.log('ℹ️ Индекс slug не найден или уже удален')
    }
    
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

    console.log('🔧 Creating course with language:', language)

    // Создаем новый курс
    const course = new Course({
      title: title.trim(),
      description: description.trim(),
      language,
      originalPrice: Number(originalPrice),
      price: price ? Number(price) : Number(originalPrice),
      discount: price && price < originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0,
      category,
      imageUrl: imageUrl || '/images/course-placeholder.jpg',
      published: false, // По умолчанию черновик
      featured: false,
      lessons,
      isNewCourse: true, // Новые курсы помечаются как новые
      newUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 дней
      publishedAt: null
    })

    await course.save()

    console.log('✅ Course created successfully with language:', course.language)

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
    console.error('Admin courses POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 