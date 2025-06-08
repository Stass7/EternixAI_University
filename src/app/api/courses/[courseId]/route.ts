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
    
    // 🔥 HARDCODE СУПЕР-АДМИН ДОСТУП ДЛЯ ГЛАВНОГО АДМИНА
    const isSuperAdmin = session?.user?.email === 'stanislavsk1981@gmail.com'
    
    if (session?.user?.email) {
      if (isSuperAdmin) {
        isAdminFromSession = true
        console.log('🚀 HARDCODE SUPER ADMIN IN API: stanislavsk1981@gmail.com detected')
      } else {
        const user = await User.findOne({ email: session.user.email })
        isAdminFromSession = user?.role === 'admin'
      }
    }

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
    // СУПЕРАДМИН или обычные админы получают полный доступ
    const shouldShowFullData = 
      isSuperAdmin || 
      isAdminFromSession || 
      accessInfo.hasAccess || 
      accessInfo.reason === 'admin_access' || 
      accessInfo.userRole === 'admin'

    // ДЕБАГ ЛОГИРОВАНИЕ
    console.log('🔧 API DEBUG INFO:')
    console.log('User email:', session?.user?.email)
    console.log('isSuperAdmin (stanislavsk1981@gmail.com):', isSuperAdmin)
    console.log('isAdminFromSession:', isAdminFromSession)
    console.log('accessInfo.hasAccess:', accessInfo.hasAccess)
    console.log('accessInfo.reason:', accessInfo.reason)
    console.log('accessInfo.userRole:', accessInfo.userRole)
    console.log('shouldShowFullData:', shouldShowFullData)
    console.log('Course has lessons:', course.lessons?.length || 0)
    console.log('First lesson videoUrl:', course.lessons?.[0]?.videoUrl || 'EMPTY')

    if (shouldShowFullData) {
      // Показываем полную информацию об уроках включая videoUrl для администраторов и пользователей с доступом
      responseData.lessons = course.lessons
      console.log('✅ FULL DATA MODE - videoUrl included')
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
      console.log('❌ LIMITED DATA MODE - videoUrl hidden')
    }

    // ПРИНУДИТЕЛЬНАЯ ПРОВЕРКА ДЛЯ СУПЕР-АДМИНА И АДМИНИСТРАТОРОВ
    if ((isSuperAdmin || isAdminFromSession) && course.lessons) {
      console.log('🚀 FORCING ADMIN ACCESS - ensuring videoUrl is present')
      responseData.lessons = course.lessons // Принудительно даем полные данные админу
      console.log('Admin lessons with videoUrl:', responseData.lessons.map((l: any) => ({ 
        title: l.title, 
        videoUrl: l.videoUrl 
      })))
    }
    
    // Добавляем количество уроков для всех случаев
    responseData.lessonsCount = course.lessons.length
    
    console.log('📤 FINAL RESPONSE lessons count:', responseData.lessons?.length)
    console.log('📤 FINAL RESPONSE first lesson:', responseData.lessons?.[0])
    
    return NextResponse.json({ course: responseData })
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    )
  }
} 