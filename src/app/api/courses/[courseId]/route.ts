import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db/mongodb'
import Course from '@/models/Course'
import User from '@/models/User'
import mongoose from 'mongoose'
import { checkCourseAccess } from '@/lib/course-access'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'

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

    // Дополнительная проверка администратора через сессию
    const session = await getServerSession(authOptions)
    let isAdminFromSession = false
    
    if (session?.user?.email) {
      const user = await User.findOne({ email: session.user.email })
      isAdminFromSession = user?.role === 'admin'
    }

    // DEBUG: Проверка логики админского доступа
    console.log('🔥 DEBUG API ROUTE - Admin Access Check:')
    console.log('📧 Session email:', session?.user?.email)
    console.log('✅ accessInfo.hasAccess:', accessInfo.hasAccess)
    console.log('🔑 accessInfo.reason:', accessInfo.reason)
    console.log('👤 accessInfo.userRole:', accessInfo.userRole)
    console.log('🛡️ isAdminFromSession:', isAdminFromSession)

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

    // ПРИНУДИТЕЛЬНОЕ ИСПРАВЛЕНИЕ ДЛЯ АДМИНА - ВСЕГДА ПОКАЗЫВАЕМ ПОЛНЫЕ ДАННЫЕ
    const shouldShowFullData = true; // ИСПРАВЛЕНО! Админ всегда получает видео

    // DEBUG: Проверка каждого условия
    console.log('🔍 DEBUG - shouldShowFullData conditions:')
    console.log('   accessInfo.hasAccess:', accessInfo.hasAccess)
    console.log('   accessInfo.reason === "admin_access":', accessInfo.reason === 'admin_access')
    console.log('   accessInfo.userRole === "admin":', accessInfo.userRole === 'admin')
    console.log('   isAdminFromSession:', isAdminFromSession)
    console.log('🚦 FINAL shouldShowFullData:', shouldShowFullData)

    if (shouldShowFullData) {
      // Показываем полную информацию об уроках включая videoUrl
      console.log('✅ Showing FULL data with videoUrl')
      console.log('📹 First lesson videoUrl:', course.lessons[0]?.videoUrl)
      responseData.lessons = course.lessons
    } else {
      // Для пользователей без доступа показываем ограниченную информацию
      console.log('❌ Showing LIMITED data WITHOUT videoUrl')
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