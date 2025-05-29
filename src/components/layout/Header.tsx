"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

type HeaderProps = {
  locale: string
}

export default function Header({ locale }: HeaderProps) {
  const { data: session, status } = useSession()
  const [showDropdown, setShowDropdown] = useState(false)
  const altLocale = locale === 'ru' ? 'en' : 'ru'
  
  const navLinks = [
    { href: `/${locale}`, label: locale === 'ru' ? 'Главная' : 'Home' },
    { href: `/${locale}/courses`, label: locale === 'ru' ? 'Курсы' : 'Courses' },
    { href: `/${locale}/pricing`, label: locale === 'ru' ? 'Тарифы' : 'Pricing' },
  ]

  const handleSignOut = async () => {
    await signOut({ callbackUrl: `/${locale}` })
  }

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
            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-dark-300 animate-pulse"></div>
            ) : session?.user ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="relative"
              >
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-3 p-2 rounded-lg bg-dark-200 hover:bg-dark-300 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
                    {session.user.name?.charAt(0) || session.user.email?.charAt(0)}
                  </div>
                  <span className="text-white text-sm font-medium hidden sm:block">
                    {session.user.name || locale === 'ru' ? 'Профиль' : 'Profile'}
                  </span>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-dark-200 rounded-lg border border-white/10 shadow-lg overflow-hidden"
                  >
                    <Link
                      href={`/${locale}/profile`}
                      className="block px-4 py-3 text-white hover:bg-dark-300 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      {locale === 'ru' ? '👤 Мой профиль' : '👤 My Profile'}
                    </Link>
                    {session.user.role === 'admin' && (
                      <Link
                        href={`/${locale}/admin`}
                        className="block px-4 py-3 text-white hover:bg-dark-300 transition-colors"
                        onClick={() => setShowDropdown(false)}
                      >
                        {locale === 'ru' ? '⚙️ Админ-панель' : '⚙️ Admin Panel'}
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setShowDropdown(false)
                        handleSignOut()
                      }}
                      className="w-full text-left px-4 py-3 text-white hover:bg-dark-300 transition-colors"
                    >
                      {locale === 'ru' ? '🚪 Выйти' : '🚪 Sign Out'}
                    </button>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Link href={`/${locale}/auth/signin`} className="btn-secondary">
                  {locale === 'ru' ? 'Войти' : 'Sign In'}
                </Link>
              </motion.div>
            )}
            
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