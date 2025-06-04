import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db/mongodb'
import Course from '@/models/Course'
import mongoose from 'mongoose'

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
    
    // Находим курс по ID - убираем populate createdBy так как это поле не существует в схеме
    const course = await Course.findById(courseId)
    
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ course })
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    )
  }
} 