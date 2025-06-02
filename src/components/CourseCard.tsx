'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

interface Course {
  _id: string
  title: string
  description: string
  language: 'ru' | 'en'
  price: number
  originalPrice: number
  discount: number
  category: string
  imageUrl: string
  published: boolean
  featured: boolean
  isNewCourse: boolean
  newUntil: string
  publishedAt: string | null
  lessonsCount: number
  createdAt: string
  updatedAt: string
  isStillNew?: boolean
}

interface CourseCardProps {
  course: Course
  locale: string
}

export default function CourseCard({ course, locale }: CourseCardProps) {
  const formatPrice = (price: number) => {
    if (locale === 'ru') {
      return `${price.toLocaleString('ru-RU')} ₽`
    }
    return `$${(price * 0.011).toFixed(0)}`
  }

  const getLanguageLabel = (lang: 'ru' | 'en') => {
    return lang === 'ru' ? '🇷🇺 RU' : '🇺🇸 EN'
  }

  // Проверяем является ли курс новым
  const isNewCourse = course.isStillNew || (
    course.publishedAt && 
    new Date(course.publishedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glassmorphism rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300"
    >
      <div className="relative">
        <img
          src={course.imageUrl || '/images/course-placeholder.jpg'}
          alt={course.title}
          className="w-full h-48 object-cover"
        />
        
        {/* Скидка */}
        {course.discount > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            -{course.discount}%
          </div>
        )}

        {/* Язык курса */}
        <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded text-sm">
          {getLanguageLabel(course.language)}
        </div>

        {/* Метка "новый" */}
        {isNewCourse && (
          <div className="absolute bottom-3 left-3 bg-green-500 text-white px-2 py-1 rounded text-sm font-bold">
            ✨ {locale === 'ru' ? 'Новый' : 'New'}
          </div>
        )}

        {/* Рекомендуемый курс */}
        {course.featured && (
          <div className="absolute bottom-3 right-3 bg-yellow-500 text-white px-2 py-1 rounded text-sm font-bold">
            🔥 {locale === 'ru' ? 'Хит' : 'Hot'}
          </div>
        )}

        {/* Overlay на hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="text-white text-4xl">
            ▶️
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Заголовок и описание */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
            {course.title}
          </h3>
          <p className="text-white/70 text-sm line-clamp-3">
            {course.description}
          </p>
        </div>

        {/* Категория */}
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-sm">
            �� {course.category}
          </span>
        </div>

        {/* Статистика */}
        <div className="flex items-center justify-between mb-4 text-white/60 text-sm">
          <div className="flex items-center space-x-1">
            <span>🕒</span>
            <span>{course.lessonsCount} {locale === 'ru' ? 'уроков' : 'lessons'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>👥</span>
            <span>0 {locale === 'ru' ? 'студентов' : 'students'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>⭐</span>
            <span>5.0</span>
          </div>
        </div>

        {/* Цена */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-right w-full">
            <div className="text-2xl font-bold text-white">
              {formatPrice(course.price)}
            </div>
            {course.discount > 0 && (
              <div className="text-white/50 line-through text-sm">
                {formatPrice(course.originalPrice)}
              </div>
            )}
          </div>
        </div>

        {/* Кнопка */}
        <Link
          href={`/${locale}/courses/${course._id}`}
          className="btn-primary w-full text-center block py-3"
        >
          {locale === 'ru' ? 'Подробнее' : 'Learn More'}
        </Link>
      </div>
    </motion.div>
  )
} 