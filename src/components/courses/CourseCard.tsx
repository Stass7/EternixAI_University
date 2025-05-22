import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ICourse } from '@/models/Course'

type CourseCardProps = {
  course: ICourse;
  locale: string;
  index?: number;
}

export default function CourseCard({ course, locale, index = 0 }: CourseCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  // Получаем заголовок и описание для текущей локали
  const title = course.title[locale] || course.title['en'] || 'Course'
  const description = course.description[locale] || course.description['en'] || ''
  
  // Форматируем цену в зависимости от локали
  const formatPrice = (price: number) => {
    if (locale === 'ru') {
      return `${price.toLocaleString('ru-RU')} ₽`
    }
    return `$${price.toLocaleString('en-US')}`
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1 * index }}
      className="glassmorphism rounded-xl overflow-hidden transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-video relative">
        <Image 
          src={course.coverImage || `/images/course-placeholder.jpg`}
          alt={title}
          fill
          className={`object-cover transition-transform duration-500 ${isHovered ? 'scale-105' : 'scale-100'}`}
        />
      </div>
      <div className="p-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium px-2 py-1 rounded bg-primary-500/20 text-primary-300">
            {course.category}
          </span>
          <span className="text-white/60 text-sm">
            {course.lessons.length} {locale === 'ru' ? 'уроков' : 'lessons'}
          </span>
        </div>
        <h3 className="text-xl font-semibold text-white mt-2 line-clamp-1">{title}</h3>
        <p className="mt-2 text-white/70 line-clamp-2">{description}</p>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-primary-500 font-bold">
            {formatPrice(course.price)}
            {course.discount && course.discount > 0 && (
              <span className="ml-2 text-white/40 text-sm line-through">
                {formatPrice(course.price / (1 - (course.discount || 0) / 100))}
              </span>
            )}
          </span>
          <Link 
            href={`/${locale}/courses/${course._id}`} 
            className="btn-primary text-sm"
          >
            {locale === 'ru' ? 'Подробнее' : 'Learn More'}
          </Link>
        </div>
      </div>
    </motion.div>
  )
} 