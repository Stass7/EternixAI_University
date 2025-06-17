import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import connectToDatabase from '@/lib/db/mongodb'
import User from '@/models/User'
import Course from '@/models/Course'
import LessonProgress from '@/models/LessonProgress'

export async function GET() {
  try {
    // Проверяем авторизацию
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDatabase()
    
    console.log('📊 Stats API: Looking for user with email:', session.user.email)
    
    // Находим пользователя с заполненными курсами
    const user = await User.findOne({ email: session.user.email })
      .populate('coursesOwned', 'title lessons')
      .populate('favorites', 'title')
    
    console.log('📊 Stats API: User found:', user ? {
      id: user._id,
      email: user.email,
      coursesOwnedCount: user.coursesOwned.length,
      coursesOwnedIds: user.coursesOwned.map((course: any) => course._id?.toString() || course.toString())
    } : 'NOT FOUND')
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('📊 Stats API: Raw coursesOwned before populate:', user.coursesOwned)
    console.log('📊 Stats API: Populated courses details:', user.coursesOwned.map((course: any, index: number) => ({
      index,
      hasId: !!course._id,
      hasTitle: !!course.title,
      hasLessons: !!course.lessons,
      courseData: course._id ? {
        id: course._id.toString(),
        title: course.title,
        lessonsCount: course.lessons?.length || 0
      } : 'UNPOPULATED_OBJECT_ID'
    })))

    // Подсчитываем статистику
    const coursesPurchased = user.coursesOwned.length
    const coursesInFavorites = user.favorites.length

    // Подсчитываем общее количество уроков во всех купленных курсах
    const totalLessonsInOwnedCourses = user.coursesOwned.reduce((total: number, course: any) => {
      return total + (course.lessons?.length || 0)
    }, 0)

    // Получаем прогресс пользователя по урокам
    const lessonProgress = await LessonProgress.find({ 
      userId: user._id,
      courseId: { $in: user.coursesOwned.map((course: any) => course._id) }
    })

    // Подсчитываем завершенные уроки
    const completedLessons = lessonProgress.filter(progress => progress.completed).length

    // Подсчитываем общее время просмотра (в часах)
    const totalWatchTime = lessonProgress.reduce((total, progress) => {
      return total + (progress.watchTime || 0)
    }, 0)
    const totalWatchTimeHours = Math.round((totalWatchTime / 3600) * 10) / 10 // округляем до 1 знака

    // Подсчитываем общий прогресс в процентах
    const overallProgress = totalLessonsInOwnedCourses > 0 
      ? Math.round((completedLessons / totalLessonsInOwnedCourses) * 100)
      : 0

    // Получаем детальную информацию о курсах с прогрессом
    const coursesWithProgress = await Promise.all(
      user.coursesOwned.map(async (course: any) => {
        const courseProgress = lessonProgress.filter(
          progress => progress.courseId.toString() === course._id.toString()
        )
        
        const courseLessons = course.lessons?.length || 0
        const courseCompletedLessons = courseProgress.filter(p => p.completed).length
        const courseProgressPercentage = courseLessons > 0 
          ? Math.round((courseCompletedLessons / courseLessons) * 100)
          : 0

        return {
          _id: course._id,
          title: course.title,
          totalLessons: courseLessons,
          completedLessons: courseCompletedLessons,
          progress: courseProgressPercentage,
          lastStudied: courseProgress.length > 0 
            ? courseProgress.sort((a, b) => new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime())[0].lastWatchedAt
            : null
        }
      })
    )

    const userStats = {
      coursesPurchased,
      coursesInFavorites,
      totalLessons: totalLessonsInOwnedCourses,
      completedLessons,
      overallProgress,
      totalWatchTimeHours,
      courses: coursesWithProgress.sort((a, b) => {
        // Сортируем по дате последнего изучения
        if (!a.lastStudied && !b.lastStudied) return 0
        if (!a.lastStudied) return 1
        if (!b.lastStudied) return -1
        return new Date(b.lastStudied).getTime() - new Date(a.lastStudied).getTime()
      })
    }

    return NextResponse.json(userStats)
  } catch (error) {
    console.error('User stats API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 