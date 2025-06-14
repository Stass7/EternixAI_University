"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

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
    <div className="w-full h-96 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
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
  const [embedToken, setEmbedToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Получаем embed токен для защищённого доступа
  useEffect(() => {
    if (!hasAccess) {
      setLoading(false)
      return
    }

    const fetchEmbedToken = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/video/embed-token/${videoId}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Failed to get embed token')
        }

        const data = await response.json()
        if (data.token) {
          setEmbedToken(data.token)
        } else {
          setError('Embed token not available')
        }
      } catch (err) {
        console.error('Error fetching embed token:', err)
        setError('Failed to load video')
      } finally {
        setLoading(false)
      }
    }

    fetchEmbedToken()
  }, [videoId, hasAccess])

  // Если нет доступа, показываем paywall
  if (!hasAccess && showPaywall) {
    return (
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <div className="absolute inset-0">
          <PaywallComponent 
            courseTitle={title}
            price={99} // TODO: получать реальную цену
            courseId={courseId}
            locale="en" // TODO: получать реальную локаль
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

  // Если произошла ошибка
  if (error) {
    return (
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <div className="absolute inset-0 bg-red-900/20 rounded-xl flex items-center justify-center border border-red-500/20">
          <div className="text-center text-white">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-red-400 font-semibold mb-2">Video Error</p>
            <p className="text-white/70 text-sm">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  // Если токен не получен
  if (!embedToken) {
    return (
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <div className="absolute inset-0 bg-slate-800 rounded-xl flex items-center justify-center">
          <div className="text-center text-white/60">
            <div className="text-6xl mb-4">📹</div>
            <p className="text-xl mb-2">Video unavailable</p>
            <p className="text-sm">Video not found or not ready</p>
          </div>
        </div>
      </div>
    )
  }

  // Показываем Bunny Stream iframe плеер
  const libraryId = process.env.NEXT_PUBLIC_BUNNY_STREAM_LIBRARY_ID || '454060'
  const embedUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?token=${embedToken}&autoplay=false&preload=true`

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
        allowFullScreen
        loading="lazy"
        title={title}
      />
    </motion.div>
  )
} 