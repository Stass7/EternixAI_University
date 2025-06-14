import mongoose from 'mongoose'
import { GridFSBucket, ObjectId } from 'mongodb'
import connectToDatabase from './mongodb'

let bucket: GridFSBucket | null = null

// Инициализация GridFS bucket
export async function getGridFSBucket(): Promise<GridFSBucket> {
  if (!bucket) {
    await connectToDatabase()
    const db = mongoose.connection.db
    if (!db) {
      throw new Error('Database connection not established')
    }
    bucket = new GridFSBucket(db, { bucketName: 'lesson_files' })
  }
  return bucket
}

// Интерфейс для метаданных файла
export interface FileMetadata {
  lessonId: string
  courseId: string
  originalName: string
  mimeType: string
  uploadedBy: string
  uploadedAt: Date
}

// Загрузка файла в GridFS
export async function uploadFileToGridFS(
  buffer: Buffer,
  filename: string,
  metadata: FileMetadata
): Promise<string> {
  const bucket = await getGridFSBucket()
  
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      metadata
    })
    
    uploadStream.on('error', reject)
    uploadStream.on('finish', () => {
      resolve(uploadStream.id.toString())
    })
    
    uploadStream.end(buffer)
  })
}

// Получение файла из GridFS
export async function getFileFromGridFS(fileId: string): Promise<{
  stream: NodeJS.ReadableStream
  metadata: any
}> {
  const bucket = await getGridFSBucket()
  
  try {
    const objectId = new ObjectId(fileId)
    const downloadStream = bucket.openDownloadStream(objectId)
    
    // Получаем метаданные файла
    const files = await bucket.find({ _id: objectId }).toArray()
    if (files.length === 0) {
      throw new Error('File not found')
    }
    
    return {
      stream: downloadStream,
      metadata: files[0]
    }
  } catch (error) {
    throw new Error(`Failed to get file: ${error}`)
  }
}

// Удаление файла из GridFS
export async function deleteFileFromGridFS(fileId: string): Promise<void> {
  const bucket = await getGridFSBucket()
  
  try {
    const objectId = new ObjectId(fileId)
    await bucket.delete(objectId)
  } catch (error) {
    throw new Error(`Failed to delete file: ${error}`)
  }
}

// Получение списка файлов для урока
export async function getFilesForLesson(lessonId: string): Promise<any[]> {
  const bucket = await getGridFSBucket()
  
  try {
    const files = await bucket.find({
      'metadata.lessonId': lessonId
    }).toArray()
    
    return files
  } catch (error) {
    throw new Error(`Failed to get files for lesson: ${error}`)
  }
}

// Проверка существования файла
export async function fileExists(fileId: string): Promise<boolean> {
  const bucket = await getGridFSBucket()
  
  try {
    const objectId = new ObjectId(fileId)
    const files = await bucket.find({ _id: objectId }).toArray()
    return files.length > 0
  } catch (error) {
    return false
  }
} 