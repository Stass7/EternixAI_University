import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File
    const type = data.get('type') as string || 'image'

    if (!file) {
      return NextResponse.json(
        { error: 'No file received' },
        { status: 400 }
      )
    }

    // Проверяем размер файла (максимум 10MB для Base64 хранения в MongoDB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB for image uploads' },
        { status: 400 }
      )
    }

    // Проверяем что это изображение
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      )
    }

    // Разрешенные типы изображений
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    
    if (!allowedImageTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Image type ${file.type} not allowed. Supported: JPEG, PNG, WebP, GIF` },
        { status: 400 }
      )
    }

    // Конвертируем файл в Base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64String = buffer.toString('base64')
    
    // Создаем data URL для хранения в MongoDB
    const dataUrl = `data:${file.type};base64,${base64String}`

    // Логируем успешную загрузку
    console.log(`✅ Image uploaded successfully: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`)

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileUrl: dataUrl, // Возвращаем data URL для хранения в MongoDB
      fileSize: file.size,
      fileType: file.type,
      uploadedAt: new Date().toISOString(),
      storage: 'mongodb' // Указываем что файл хранится в MongoDB
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
} 