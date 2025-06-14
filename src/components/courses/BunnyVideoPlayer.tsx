"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { bunnyConfig } from '@/lib/bunny-stream'

interface BunnyVideoPlayerProps {
  videoId: string
  title: string
  hasAccess: boolean
  courseId: string
  lessonId: string
  showPaywall?: boolean
}

interface PaywallProps {
  courseTitle: string
  price: number
  courseId: string
  locale: string
}

function PaywallComponent({ courseTitle, price, courseId, locale }: PaywallProps) {
  return (
    <div className="w-full h-96 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center rounded-xl">
      <div className="text-center text-white p-8 max-w-md">
        <div className="text-6xl mb-6">🔒</div>
        <h3 className="text-2xl font-bold mb-4">
          {locale === 'ru' ? 'Купите курс для доступа' : 'Purchase the course to access it'}
        </h3>
        <p className="text-white/70 mb-6">
          {locale === 'ru' 
            ? `Этот урок доступен только после покупки курса "${courseTitle}"`
            : `This lesson is only available after purchasing the course "${courseTitle}"`
          }
        </p>
        <div className="space-y-3">
          <button className="btn-primary px-6 py-3 w-full">
            {locale === 'ru' ? `Купить за $${price}` : `Buy for $${price}`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BunnyVideoPlayer({ 
  videoId, 
  title, 
  hasAccess, 
  courseId, 
  lessonId,
  showPaywall = true 
}: BunnyVideoPlayerProps) {
  const [loading, setLoading] = useState(true)

  // Простая инициализация без токенов
  useEffect(() => {
    if (hasAccess && videoId) {
      // Небольшая задержка для плавной анимации
      const timer = setTimeout(() => {
        setLoading(false)
      }, 500)
      return () => clearTimeout(timer)
    } else {
      setLoading(false)
    }
  }, [hasAccess, videoId])

  // Если нет доступа, показываем paywall
  if (!hasAccess && showPaywall) {
    return (
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <div className="absolute inset-0">
          <PaywallComponent 
            courseTitle={title}
            price={99}
            courseId={courseId}
            locale="en"
          />
        </div>
      </div>
    )
  }

  // Если идёт загрузка
  if (loading) {
    return (
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <div className="absolute inset-0 bg-dark-400 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-primary-500 rounded-full border-t-transparent mb-4 mx-auto"></div>
            <p className="text-white/70">Loading video...</p>
          </div>
        </div>
      </div>
    )
  }

  // Если нет videoId
  if (!videoId) {
    return (
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <div className="absolute inset-0 bg-slate-800 rounded-xl flex items-center justify-center">
          <div className="text-center text-white/60">
            <div className="text-6xl mb-4">📹</div>
            <p className="text-xl mb-2">Video unavailable</p>
            <p className="text-sm">No video ID provided</p>
          </div>
        </div>
      </div>
    )
  }

  // Формируем URL для встроенного плеера БЕЗ ТОКЕНОВ (пока)
  const { libraryId } = bunnyConfig
  const embedUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?autoplay=false&preload=true`

  // Показываем встроенный Bunny Stream плеер
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full"
      style={{ paddingBottom: '56.25%' }}
    >
      <iframe
        src={embedUrl}
        className="absolute inset-0 w-full h-full rounded-xl"
        style={{ border: 'none' }}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen={true}
        loading="lazy"
        title={title}
      />
      
      {/* Overlay с информацией о видео */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
        <p className="text-white text-sm font-medium">{title}</p>
      </div>
    </motion.div>
  )
} 