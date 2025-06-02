'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import CourseCard from '@/components/CourseCard'

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

interface CoursesListProps {
  locale: string
}

export default function CoursesList({ locale }: CoursesListProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCourses()
  }, [locale])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Получаем только опубликованные курсы для публичной страницы
      const response = await fetch(`/api/courses?published=true&language=${locale}`)
      
      if (response.ok) {
        const data = await response.json()
        setCourses(data.courses || [])
      } else {
        setError('Ошибка загрузки курсов')
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
      setError('Ошибка загрузки курсов')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-white/70 text-lg">{error}</p>
        <button 
          onClick={fetchCourses}
          className="btn-primary mt-4 px-6 py-2"
        >
          Попробовать снова
        </button>
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-white/70 text-lg">
          {locale === 'ru' ? 'Курсы не найдены' : 'No courses found'}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {courses.map((course, index) => (
        <motion.div
          key={course._id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <CourseCard course={course} locale={locale} />
        </motion.div>
      ))}
    </div>
  )
} 