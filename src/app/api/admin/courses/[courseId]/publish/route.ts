import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import connectToDatabase from '@/lib/db/mongodb'
import User from '@/models/User'
import Course from '@/models/Course'

// POST - переключить статус публикации курса
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDatabase()
    
    const user = await User.findOne({ email: session.user.email })
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    const course = await Course.findById(courseId)
    
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Переключаем статус публикации
    const newPublishedStatus = !course.published
    const updateData: any = {
      published: newPublishedStatus,
      updatedAt: new Date()
    }

    // Обновляем дату публикации
    if (newPublishedStatus) {
      updateData.publishedAt = new Date()
    } else {
      updateData.publishedAt = null
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      updateData,
      { new: true }
    )

    return NextResponse.json({
      success: true,
      published: updatedCourse!.published,
      publishedAt: updatedCourse!.publishedAt,
      message: newPublishedStatus ? 'Курс опубликован' : 'Курс снят с публикации'
    })
  } catch (error) {
    console.error('Course publish toggle error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 