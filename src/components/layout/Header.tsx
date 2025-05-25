"use client"

import Link from 'next/link'
import { motion } from 'motion/react'

type HeaderProps = {
  locale: string
}

export default function Header({ locale }: HeaderProps) {
  const altLocale = locale === 'ru' ? 'en' : 'ru'
  
  const navLinks = [
    { href: `/${locale}`, label: locale === 'ru' ? 'Главная' : 'Home' },
    { href: `/${locale}/courses`, label: locale === 'ru' ? 'Курсы' : 'Courses' },
    { href: `/${locale}/pricing`, label: locale === 'ru' ? 'Тарифы' : 'Pricing' },
  ]

  return (
    <header 
      className="sticky top-0 z-50 border-b" 
      style={{ 
        background: 'rgba(18, 18, 18, 0.8)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(16px)', 
        WebkitBackdropFilter: 'blur(16px)' 
      }}
    >
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            <Link href={`/${locale}`} className="text-2xl font-bold text-white">
              EternixAI <span className="text-primary-500">University</span>
            </Link>
          </motion.div>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link, index) => (
              <motion.div 
                key={link.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link 
                  href={link.href}
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </nav>
          
          {/* Auth and Lang */}
          <div className="flex items-center space-x-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Link href={`/${locale}/auth/signin`} className="btn-secondary">
                {locale === 'ru' ? 'Войти' : 'Sign In'}
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Link href={`/${altLocale}`} className="text-gray-400 hover:text-white">
                {altLocale.toUpperCase()}
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </header>
  )
} 