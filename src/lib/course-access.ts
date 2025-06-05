import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import connectToDatabase from '@/lib/db/mongodb'
import User from '@/models/User'
import Course from '@/models/Course'
import mongoose from 'mongoose'

export interface CourseAccessResult {
  hasAccess: boolean
  reason: 'admin_access' | 'purchased' | 'not_purchased' | 'not_authenticated' | 'user_not_found' | 'course_not_found'
  message: string
  courseTitle?: string
  coursePrice?: number
  userRole?: 'admin' | 'user'
}

/**
 * Проверяет доступ пользователя к курсу
 * @param courseId - ID курса для проверки
 * @returns Promise<CourseAccessResult> - результат проверки доступа
 */
export async function checkCourseAccess(courseId: string): Promise<CourseAccessResult> {
  try {
    // Проверяем валидность ID курса
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return {
        hasAccess: false,
        reason: 'course_not_found',
        message: 'Invalid course ID'
      }
    }

    // Получаем сессию пользователя
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return {
        hasAccess: false,
        reason: 'not_authenticated',
        message: 'You must be logged in to access courses'
      }
    }

    await connectToDatabase()

    // Проверяем существование курса
    const course = await Course.findById(courseId)
    if (!course) {
      return {
        hasAccess: false,
        reason: 'course_not_found',
        message: 'Course not found'
      }
    }

    // Находим пользователя
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return {
        hasAccess: false,
        reason: 'user_not_found',
        message: 'User not found'
      }
    }

    // Админы имеют доступ ко всем курсам
    if (user.role === 'admin') {
      return {
        hasAccess: true,
        reason: 'admin_access',
        message: 'Admin has full access',
        courseTitle: course.title,
        userRole: 'admin'
      }
    }

    // Проверяем владение курсом
    const hasAccess = user.coursesOwned.includes(course._id)

    return {
      hasAccess,
      reason: hasAccess ? 'purchased' : 'not_purchased',
      message: hasAccess 
        ? 'You have access to this course' 
        : 'You need to purchase this course to access it',
      courseTitle: course.title,
      coursePrice: course.price,
      userRole: user.role
    }

  } catch (error) {
    console.error('Error checking course access:', error)
    return {
      hasAccess: false,
      reason: 'course_not_found',
      message: 'Failed to check course access'
    }
  }
}

/**
 * Проверяет доступ пользователя к конкретному уроку курса
 * @param courseId - ID курса
 * @param lessonId - ID урока
 * @returns Promise<CourseAccessResult> - результат проверки доступа
 */
export async function checkLessonAccess(courseId: string, lessonId: string): Promise<CourseAccessResult> {
  // Для доступа к уроку нужно иметь доступ к курсу
  const courseAccess = await checkCourseAccess(courseId)
  
  if (!courseAccess.hasAccess) {
    return courseAccess
  }

  try {
    await connectToDatabase()

    // Проверяем существование урока в курсе
    const course = await Course.findById(courseId)
    if (!course) {
      return {
        hasAccess: false,
        reason: 'course_not_found',
        message: 'Course not found'
      }
    }

    const lesson = course.lessons.find((l: any) => l.id === lessonId)
    if (!lesson) {
      return {
        hasAccess: false,
        reason: 'course_not_found',
        message: 'Lesson not found in this course'
      }
    }

    return {
      ...courseAccess,
      message: `You have access to lesson: ${lesson.title}`
    }

  } catch (error) {
    console.error('Error checking lesson access:', error)
    return {
      hasAccess: false,
      reason: 'course_not_found',
      message: 'Failed to check lesson access'
    }
  }
} 