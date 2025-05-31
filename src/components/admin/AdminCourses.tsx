"use client"

import { motion } from 'framer-motion'

interface AdminCoursesProps {
  locale: string
}

export default function AdminCourses({ locale }: AdminCoursesProps) {
  const translations = {
    ru: {
      title: 'Управление курсами',
      coming_soon: 'Раздел в разработке'
    },
    en: {
      title: 'Course Management',
      coming_soon: 'Section under development'
    }
  }

  const t = translations[locale as keyof typeof translations]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-white mb-8">{t.title}</h1>
        
        <div className="glassmorphism rounded-xl p-8 text-center">
          <p className="text-white/70 text-lg">{t.coming_soon}</p>
        </div>
      </motion.div>
    </div>
  )
} 