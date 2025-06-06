import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db/mongodb'
import Course from '@/models/Course'
import mongoose from 'mongoose'
import { checkCourseAccess } from '@/lib/course-access'

export async function GET(
  request: Request,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    const params = await context.params
    const courseId = params.courseId
    
    // Проверяем валидность идентификатора
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json(
        { error: 'Invalid course ID' },
        { status: 400 }
      )
    }
    
    await connectToDatabase()
    
    // Находим курс по ID
    const course = await Course.findById(courseId)
    
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Проверяем доступ пользователя к курсу
    const accessInfo = await checkCourseAccess(courseId)

    // Базовая информация о курсе
    let responseData: any = {
      _id: course._id,
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
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      // Информация о доступе
      access: accessInfo
    }

    // Определяем нужно ли показывать полную информацию
    const shouldShowFullData = accessInfo.hasAccess || accessInfo.reason === 'admin_access' || accessInfo.userRole === 'admin'

    if (shouldShowFullData) {
      // Показываем полную информацию об уроках включая videoUrl
      responseData.lessons = course.lessons
    } else {
      // Для пользователей без доступа показываем ограниченную информацию
      responseData.lessons = course.lessons.map((lesson: any) => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        duration: lesson.duration,
        order: lesson.order,
        isNewLesson: lesson.isNewLesson,
        // НЕ показываем videoUrl только для пользователей без доступа (не админов)
        videoUrl: null
      }))
      responseData.lessonsCount = course.lessons.length
    }
    
    return NextResponse.json({ course: responseData })
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    )
  }
} 