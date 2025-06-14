import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import { generateSecureVideoUrl } from '@/lib/bunny-stream'
import connectToDatabase from '@/lib/db/mongodb'
import User from '@/models/User'
import Course from '@/models/Course'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params
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

    // Находим курс, содержащий этот урок с видео
    const course = await Course.findOne({
      'lessons.bunnyVideoId': videoId
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    // Проверяем доступ к курсу
    let hasAccess = false

    if (isAdmin) {
      hasAccess = true
      console.log('🔧 Admin access granted for video:', videoId)
    } else {
      // Проверяем, купил ли пользователь курс
      hasAccess = user.purchasedCourses?.includes(course._id.toString()) || false
      console.log('🔧 User access check:', {
        userId: user._id,
        courseId: course._id,
        hasAccess,
        purchasedCourses: user.purchasedCourses
      })
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied. Course not purchased.' },
        { status: 403 }
      )
    }

    // Генерируем защищённый URL на 2 часа
    const secureUrl = generateSecureVideoUrl(videoId, true, 120)

    if (!secureUrl) {
      return NextResponse.json(
        { error: 'Failed to generate secure URL' },
        { status: 500 }
      )
    }

    console.log('🔧 Generated secure video URL for:', {
      videoId,
      userEmail: session.user.email,
      isAdmin,
      expiresIn: '2 hours'
    })

    return NextResponse.json({
      url: secureUrl,
      expiresIn: 7200, // 2 hours in seconds
      videoId
    })

  } catch (error) {
    console.error('Error generating secure video URL:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 