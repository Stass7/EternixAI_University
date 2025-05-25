"use client"

import Link from 'next/link'
import { motion } from '@/utils/motion-stub'
import CoursesList from '@/components/courses/CoursesList'

export default function CoursesPageClient() {
  return (
    <div className="min-h-screen">
      {/* Заголовок страницы */}
      <section className="bg-dark-300 py-16 md:py-24">
        <div className="container-custom">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold text-white text-center"
          >
            Курсы
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-xl text-white/70 text-center max-w-3xl mx-auto"
          >
            Выберите интересующие вас курсы и начните обучение прямо сейчас
          </motion.p>
        </div>
      </section>

      {/* Фильтры и поиск */}
      <section className="bg-dark-400 py-8 border-y border-white/10">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Поиск курсов..."
                  className="input-field pl-10"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            <div>
              <select className="input-field">
                <option value="">Все категории</option>
                <option value="programming">Программирование</option>
                <option value="design">Дизайн</option>
                <option value="marketing">Маркетинг</option>
                <option value="business">Бизнес</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Список курсов */}
      <section className="bg-dark-300 py-16">
        <div className="container-custom">
          <CoursesList locale="ru" />
          
          {/* Пагинация */}
          <div className="mt-12 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button className="btn-secondary px-4 py-2 disabled:opacity-50" disabled>
                Предыдущая
              </button>
              <button className="btn-primary px-4 py-2">1</button>
              <button className="btn-secondary px-4 py-2">2</button>
              <button className="btn-secondary px-4 py-2">3</button>
              <button className="btn-secondary px-4 py-2">
                Следующая
              </button>
            </nav>
          </div>
        </div>
      </section>
    </div>
  )
} 