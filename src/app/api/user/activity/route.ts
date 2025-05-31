import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import connectToDatabase from '@/lib/db/mongodb'
import User from '@/models/User'
import UserActivity from '@/models/UserActivity'

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
    const { action, details } = body

    if (!action) {
      return NextResponse.json(
        { error: 'Missing action' },
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

    // Создаем запись активности
    await UserActivity.create({
      userId: user._id,
      action,
      details: details || {},
      timestamp: new Date()
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('User activity API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')

    await connectToDatabase()
    
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Получаем активность пользователя
    const activities = await UserActivity.find({ userId: user._id })
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip((page - 1) * limit)

    const totalActivities = await UserActivity.countDocuments({ userId: user._id })

    return NextResponse.json({
      activities: activities.map(activity => ({
        id: activity._id.toString(),
        action: activity.action,
        details: activity.details,
        timestamp: activity.timestamp.toISOString()
      })),
      total: totalActivities,
      page,
      totalPages: Math.ceil(totalActivities / limit)
    })
  } catch (error) {
    console.error('User activity GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 