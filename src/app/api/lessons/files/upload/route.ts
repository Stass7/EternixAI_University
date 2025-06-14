import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'
import { uploadFileToGridFS, FileMetadata } from '@/lib/db/gridfs'
import connectToDatabase from '@/lib/db/mongodb'
import Course from '@/models/Course'
import User from '@/models/User'

// Разрешенные типы файлов
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/zip',
  'application/x-rar-compressed'
]

// Максимальный размер файла (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
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

    const formData = await request.formData()
    const file = formData.get('file') as File
    const courseId = formData.get('courseId') as string
    const lessonId = formData.get('lessonId') as string

    if (!file || !courseId || !lessonId) {
      return NextResponse.json(
        { error: 'File, courseId, and lessonId are required' },
        { status: 400 }
      )
    }

    // Проверяем размер файла
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // Проверяем тип файла
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 400 }
      )
    }

    // Проверяем существование курса и урока
    const course = await Course.findById(courseId)
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    const lesson = course.lessons.find((l: any) => l.id === lessonId)
    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    // Конвертируем файл в Buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Создаем уникальное имя файла
    const timestamp = Date.now()
    const filename = `${lessonId}_${timestamp}_${file.name}`

    // Метаданные файла
    const metadata: FileMetadata = {
      lessonId,
      courseId,
      originalName: file.name,
      mimeType: file.type,
      uploadedBy: session.user.email,
      uploadedAt: new Date()
    }

    // Загружаем файл в GridFS
    const fileId = await uploadFileToGridFS(buffer, filename, metadata)

    // Добавляем информацию о файле в урок
    const fileInfo = {
      id: fileId,
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      uploadedAt: new Date()
    }

    // Обновляем урок в курсе
    await Course.updateOne(
      { _id: courseId, 'lessons.id': lessonId },
      { 
        $push: { 'lessons.$.files': fileInfo }
      }
    )

    console.log('📁 File uploaded successfully:', {
      fileId,
      filename: file.name,
      size: file.size,
      lessonId,
      courseId
    })

    return NextResponse.json({
      success: true,
      file: fileInfo
    })

  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 