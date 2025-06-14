"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'

interface LessonFile {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  uploadedAt: Date
}

interface LessonFilesProps {
  files: LessonFile[]
  hasAccess: boolean
  locale: 'ru' | 'en'
}

export default function LessonFiles({ files, hasAccess, locale }: LessonFilesProps) {
  const [downloading, setDownloading] = useState<{[key: string]: boolean}>({})

  const t = {
    ru: {
      materials: 'Материалы урока',
      download: 'Скачать',
      downloading: 'Скачивание...',
      noAccess: 'Материалы доступны после покупки курса'
    },
    en: {
      materials: 'Lesson Materials',
      download: 'Download',
      downloading: 'Downloading...',
      noAccess: 'Materials available after course purchase'
    }
  }

  const text = t[locale]

  // Получение иконки файла по типу
  const getFileIcon = (mimeType: string): string => {
    if (mimeType.includes('pdf')) return '📄'
    if (mimeType.includes('word')) return '📝'
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊'
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📋'
    if (mimeType.includes('image')) return '🖼️'
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦'
    if (mimeType.includes('text')) return '📄'
    return '📎'
  }

  // Форматирование размера файла
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Обработка скачивания файла
  const handleDownload = async (fileId: string, fileName: string) => {
    setDownloading(prev => ({ ...prev, [fileId]: true }))
    
    try {
      const response = await fetch(`/api/lessons/files/${fileId}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        console.error('Failed to download file')
      }
    } catch (error) {
      console.error('Error downloading file:', error)
    } finally {
      setDownloading(prev => ({ ...prev, [fileId]: false }))
    }
  }

  if (!hasAccess) {
    return (
      <div className="mb-6">
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <h3 className="text-yellow-400 font-semibold mb-2">📎 {text.materials}</h3>
          <p className="text-white/70">
            {text.noAccess}
          </p>
        </div>
      </div>
    )
  }

  if (!files || files.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <span className="mr-2">📎</span>
        {text.materials}
      </h3>
      
      <div className="space-y-3">
        {files.map((file, index) => (
          <motion.div
            key={file.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="group flex items-center justify-between bg-white/5 hover:bg-white/10 p-4 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200"
          >
            <div className="flex items-center space-x-4">
              <div className="text-3xl group-hover:scale-110 transition-transform duration-200">
                {getFileIcon(file.mimeType)}
              </div>
              <div className="flex-1">
                <p className="text-white font-medium group-hover:text-primary-300 transition-colors">
                  {file.originalName}
                </p>
                <div className="flex items-center space-x-3 text-white/60 text-sm mt-1">
                  <span>{formatFileSize(file.size)}</span>
                  <span>•</span>
                  <span>
                    {new Date(file.uploadedAt).toLocaleDateString(
                      locale === 'ru' ? 'ru-RU' : 'en-US'
                    )}
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => handleDownload(file.id, file.originalName)}
              disabled={downloading[file.id]}
              className="btn-primary px-4 py-2 text-sm flex items-center space-x-2 hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading[file.id] ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                  <span>{text.downloading}</span>
                </>
              ) : (
                <>
                  <span>📥</span>
                  <span>{text.download}</span>
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
} 