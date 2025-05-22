import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db/mongodb'
import Course from '@/models/Course'

export async function GET(request: Request) {
  try {
    // Получаем параметры запроса
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'ru'
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    const category = searchParams.get('category')
    
    await connectToDatabase()
    
    // Базовый запрос
    const query: any = { published: true }
    
    // Добавляем фильтр по категории, если указана
    if (category) {
      query.category = category
    }
    
    const skip = (page - 1) * limit
    
    // Получаем курсы с пагинацией
    const courses = await Course.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
    
    // Получаем общее количество курсов для пагинации
    const total = await Course.countDocuments(query)
    
    return NextResponse.json({
      courses,
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