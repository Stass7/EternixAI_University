"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'

type AdminSection = 'dashboard' | 'users' | 'courses' | 'orders' | 'settings'

interface AdminSidebarProps {
  locale: string
  activeSection: AdminSection
  setActiveSection: (section: AdminSection) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export default function AdminSidebar({ 
  locale, 
  activeSection, 
  setActiveSection, 
  isOpen, 
  setIsOpen 
}: AdminSidebarProps) {
  const translations = {
    ru: {
      dashboard: 'Панель управления',
      users: 'Пользователи',
      courses: 'Курсы',
      orders: 'Заказы',
      settings: 'Настройки',
      backToSite: 'Вернуться на сайт'
    },
    en: {
      dashboard: 'Dashboard',
      users: 'Users',
      courses: 'Courses',
      orders: 'Orders',
      settings: 'Settings',
      backToSite: 'Back to Site'
    }
  }

  const t = translations[locale as keyof typeof translations]

  const menuItems = [
    {
      id: 'dashboard' as AdminSection,
      label: t.dashboard,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z" />
        </svg>
      )
    },
    {
      id: 'users' as AdminSection,
      label: t.users,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    },
    {
      id: 'courses' as AdminSection,
      label: t.courses,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      id: 'orders' as AdminSection,
      label: t.orders,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      id: 'settings' as AdminSection,
      label: t.settings,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ]

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.div
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className="fixed left-0 top-0 h-full w-64 bg-dark-300 border-r border-white/10 z-50 lg:block hidden"
      >
        <div className="p-6 border-b border-white/10">
          <Link href={`/${locale}`} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">EA</span>
            </div>
            <span className="text-white font-semibold">EternixAI</span>
          </Link>
        </div>

        <nav className="mt-6">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-colors ${
                activeSection === item.id
                  ? 'bg-primary-500/20 text-primary-300 border-r-2 border-primary-500'
                  : 'text-white/70 hover:text-white hover:bg-dark-200'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-white/10">
          <Link
            href={`/${locale}`}
            className="flex items-center space-x-3 text-white/70 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>{t.backToSite}</span>
          </Link>
        </div>
      </motion.div>

      {/* Mobile Sidebar */}
      <motion.div
        initial={{ x: -250 }}
        animate={{ x: isOpen ? 0 : -250 }}
        transition={{ duration: 0.3 }}
        className="fixed left-0 top-0 h-full w-64 bg-dark-300 border-r border-white/10 z-50 lg:hidden"
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">EA</span>
            </div>
            <span className="text-white font-semibold">EternixAI</span>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg bg-dark-200 hover:bg-dark-100 transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="mt-6">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id)
                setIsOpen(false)
              }}
              className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-colors ${
                activeSection === item.id
                  ? 'bg-primary-500/20 text-primary-300 border-r-2 border-primary-500'
                  : 'text-white/70 hover:text-white hover:bg-dark-200'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-white/10">
          <Link
            href={`/${locale}`}
            className="flex items-center space-x-3 text-white/70 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>{t.backToSite}</span>
          </Link>
        </div>
      </motion.div>
    </>
  )
} 