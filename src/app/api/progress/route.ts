import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import connectToDatabase from '@/lib/db/mongodb'
import User from '@/models/User'
import LessonProgress from '@/models/LessonProgress'
import UserActivity from '@/models/UserActivity'

// GET - получить прогресс урока
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const lessonId = searchParams.get('lessonId')

    if (!courseId || !lessonId) {
      return NextResponse.json(
        { error: 'Missing courseId or lessonId' },
        { status: 400 }
      )
    }

    await connectToDatabase()
    
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Ищем прогресс урока
    const progress = await LessonProgress.findOne({
      userId: user._id,
      courseId,
      lessonId
    })

    return NextResponse.json({
      completed: progress?.completed || false,
      watchTime: progress?.watchTime || 0,
      lastWatchedAt: progress?.lastWatchedAt || null
    })
  } catch (error) {
    console.error('Progress GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - обновить прогресс урока
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { courseId, lessonId, watchTime, completed } = body

    if (!courseId || !lessonId || watchTime === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    await connectToDatabase()
    
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Проверяем, что пользователь владеет курсом
    if (!user.coursesOwned.includes(courseId)) {
      return NextResponse.json(
        { error: 'Course access denied' },
        { status: 403 }
      )
    }

    // Обновляем или создаем прогресс урока
    const progressData: any = {
      userId: user._id,
      courseId,
      lessonId,
      watchTime: Math.max(0, Number(watchTime)), // убеждаемся что время положительное
      lastWatchedAt: new Date()
    }

    // Если урок завершен
    if (completed) {
      progressData.completed = true
      progressData.completedAt = new Date()
    }

    const progress = await LessonProgress.findOneAndUpdate(
      {
        userId: user._id,
        courseId,
        lessonId
      },
      progressData,
      {
        upsert: true,
        new: true
      }
    )

    // Логируем активность пользователя
    if (completed) {
      await UserActivity.create({
        userId: user._id,
        action: 'lesson_complete',
        details: {
          courseId,
          lessonId,
          watchTime
        }
      })
    } else {
      // Логируем начало изучения урока (только если это первый раз)
      const existingProgress = await LessonProgress.findOne({
        userId: user._id,
        courseId,
        lessonId
      })
      
      if (!existingProgress || existingProgress.watchTime === 0) {
        await UserActivity.create({
          userId: user._id,
          action: 'lesson_start',
          details: {
            courseId,
            lessonId
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      progress: {
        completed: progress.completed,
        watchTime: progress.watchTime,
        lastWatchedAt: progress.lastWatchedAt
      }
    })
  } catch (error) {
    console.error('Progress POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 