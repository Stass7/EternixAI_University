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

    // Построение фильтра поиска
    let filter: any = {}
    
    if (search) {
      filter.$or = [
        { 'title.ru': { $regex: search, $options: 'i' } },
        { 'title.en': { $regex: search, $options: 'i' } },
        { 'description.ru': { $regex: search, $options: 'i' } },
        { 'description.en': { $regex: search, $options: 'i' } }
      ]
    }

    if (status !== 'all') {
      filter.published = status === 'published'
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
      published = true, // Автоматически публикуем
      featured = false,
      lessons = []
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

    // Создаем новый курс
    const course = new Course({
      title: courseTitle,
      description: courseDescription,
      originalPrice: Number(originalPrice),
      price: price ? Number(price) : Number(originalPrice),
      discount: price && price < originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0,
      category,
      imageUrl: imageUrl || '/images/course-placeholder.jpg',
      published,
      featured,
      lessons
    })

    await course.save()

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
    console.error('Admin courses POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 