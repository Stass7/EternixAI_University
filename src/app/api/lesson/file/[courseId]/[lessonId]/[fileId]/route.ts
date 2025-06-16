import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import connectToDatabase from '@/lib/db/mongodb'
import User from '@/models/User'
import Course from '@/models/Course'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; lessonId: string; fileId: string }> }
) {
  try {
    const { courseId, lessonId, fileId } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDatabase()

    // Получаем пользователя
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Проверяем является ли пользователь админом
    const isAdmin = user.role === 'admin' || session.user.email === 'stanislavsk1981@gmail.com'

    // Находим курс
    const course = await Course.findById(courseId)
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Находим урок
    const lesson = course.lessons.find((l: any) => l.id === lessonId)
    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    // Находим файл
    const file = lesson.files?.find((f: any) => f.id === fileId)
    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Проверяем доступ к курсу
    let hasAccess = false

    if (isAdmin) {
      hasAccess = true
      console.log('🔧 Admin access granted for file:', fileId)
    } else {
      // Проверяем, купил ли пользователь курс
      hasAccess = user.coursesOwned?.includes(course._id) || false
      console.log('🔧 User file access check:', {
        userId: user._id,
        courseId: course._id,
        hasAccess,
        coursesOwned: user.coursesOwned
      })
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied. Course not purchased.' },
        { status: 403 }
      )
    }

    // Декодируем base64 файл
    const base64Data = file.data.split(',')[1] // Убираем data:mime/type;base64, префикс
    const buffer = Buffer.from(base64Data, 'base64')

    console.log('🔧 File download:', {
      fileId,
      fileName: file.originalName,
      userEmail: session.user.email,
      isAdmin,
      fileSize: file.size
    })

    // Возвращаем файл
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': file.mimeType,
        'Content-Disposition': `attachment; filename="${file.originalName}"`,
        'Content-Length': file.size.toString(),
      },
    })

  } catch (error) {
    console.error('Error downloading lesson file:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 