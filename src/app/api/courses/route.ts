import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db/mongodb'
import Course from '@/models/Course'
import { Types } from 'mongoose'

export async function GET(request: Request) {
  try {
    // Получаем параметры запроса
    const { searchParams } = new URL(request.url)
    const language = searchParams.get('language') || 'ru'
    const limit = parseInt(searchParams.get('limit') || '12')
    const page = parseInt(searchParams.get('page') || '1')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const published = searchParams.get('published')
    
    await connectToDatabase()
    
    // Базовый запрос - только опубликованные курсы для публичного API
    const query: any = { published: true }
    
    // Добавляем фильтр по языку
    if (language && language !== 'all') {
      query.language = language
    }
    
    // Добавляем фильтр по категории, если указана
    if (category && category !== 'all') {
      query.category = category
    }
    
    // Добавляем поиск по названию и описанию
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }
    
    const skip = (page - 1) * limit
    
    // Получаем курсы с пагинацией
    const courses = await Course.find(query)
      .sort({ featured: -1, createdAt: -1 }) // Сначала рекомендуемые, потом новые
      .skip(skip)
      .limit(limit)
      .lean()
    
    // Получаем общее количество курсов для пагинации
    const total = await Course.countDocuments(query)
    
    // Форматируем данные курсов
    const formattedCourses = courses.map((course: any) => ({
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
      // Вычисляем isStillNew на сервере
      isStillNew: course.isNewCourse && course.newUntil && course.newUntil > new Date()
    }))
    
    return NextResponse.json({
      courses: formattedCourses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
} 