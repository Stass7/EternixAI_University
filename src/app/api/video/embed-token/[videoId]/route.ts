import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import connectToDatabase from '@/lib/db/mongodb'
import Course from '@/models/Course'
import User from '@/models/User'
import { generateEmbedViewToken } from '@/lib/bunny-stream'

export async function GET(
  request: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { videoId } = params
    if (!videoId) {
      return NextResponse.json({ error: 'Video ID required' }, { status: 400 })
    }

    await connectToDatabase()
    
    // Находим курс с этим видео
    const course = await Course.findOne({
      'lessons.bunnyVideoId': videoId
    })

    if (!course) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Проверяем доступ пользователя
    const userEmail = session.user.email
    
    // 🔥 HARDCODE СУПЕР-АДМИН ДОСТУП ДЛЯ ГЛАВНОГО АДМИНА
    if (userEmail === 'stanislavsk1981@gmail.com') {
      console.log('🚀 HARDCODE SUPER ADMIN ACCESS: stanislavsk1981@gmail.com detected')
    } else {
      // Находим пользователя
      const user = await User.findOne({ email: userEmail })
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Проверяем доступ: админ или владелец курса
      const isAdmin = user.role === 'admin'
      const hasPurchased = user.coursesOwned.includes(course._id)

      if (!isAdmin && !hasPurchased) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    // Генерируем токен для встроенного плеера
    // Если в настройках Bunny Stream включена embed view token authentication
    const embedToken = generateEmbedViewToken(videoId, 120) // 2 часа
    
    return NextResponse.json({ 
      success: true,
      token: embedToken,
      message: 'Access granted'
    })

  } catch (error) {
    console.error('Error in embed token API:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
} 