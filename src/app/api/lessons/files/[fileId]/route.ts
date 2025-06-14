import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import { getFileFromGridFS, deleteFileFromGridFS } from '@/lib/db/gridfs'
import connectToDatabase from '@/lib/db/mongodb'
import Course from '@/models/Course'
import User from '@/models/User'

// GET - Скачивание файла
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params
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

    // Получаем файл и его метаданные
    const { stream, metadata } = await getFileFromGridFS(fileId)
    
    if (!metadata.metadata) {
      return NextResponse.json(
        { error: 'File metadata not found' },
        { status: 404 }
      )
    }

    const { lessonId, courseId } = metadata.metadata

    // Находим курс
    const course = await Course.findById(courseId)
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
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
      hasAccess = user.purchasedCourses?.includes(course._id.toString()) || false
      console.log('🔧 User file access check:', {
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

    // Создаем ReadableStream для Next.js
    const readableStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk) => {
          controller.enqueue(chunk)
        })
        
        stream.on('end', () => {
          controller.close()
        })
        
        stream.on('error', (error) => {
          controller.error(error)
        })
      }
    })

    // Возвращаем файл с правильными заголовками
    return new Response(readableStream, {
      headers: {
        'Content-Type': metadata.metadata.mimeType,
        'Content-Disposition': `attachment; filename="${metadata.metadata.originalName}"`,
        'Content-Length': metadata.length.toString(),
      }
    })

  } catch (error) {
    console.error('Error downloading file:', error)
    return NextResponse.json(
      { error: 'File not found or access denied' },
      { status: 404 }
    )
  }
}

// DELETE - Удаление файла (только для админов)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDatabase()

    // Проверяем является ли пользователь админом
    const user = await User.findOne({ email: session.user.email })
    const isAdmin = user?.role === 'admin' || session.user.email === 'stanislavsk1981@gmail.com'

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Получаем метаданные файла перед удалением
    const { metadata } = await getFileFromGridFS(fileId)
    const { lessonId, courseId } = metadata.metadata

    // Удаляем файл из GridFS
    await deleteFileFromGridFS(fileId)

    // Удаляем информацию о файле из урока
    await Course.updateOne(
      { _id: courseId, 'lessons.id': lessonId },
      { 
        $pull: { 'lessons.$.files': { id: fileId } }
      }
    )

    console.log('🗑️ File deleted successfully:', {
      fileId,
      lessonId,
      courseId
    })

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 