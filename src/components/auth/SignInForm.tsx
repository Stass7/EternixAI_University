"use client"

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

type SignInFormProps = {
  locale: string
}

export default function SignInForm({ locale }: SignInFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  
  const translations = {
    ru: {
      emailLabel: 'Электронная почта',
      emailPlaceholder: 'your@email.com',
      passwordLabel: 'Пароль',
      passwordPlaceholder: 'Введите пароль',
      signInButton: 'Войти',
      orContinueWith: 'или продолжить с',
      googleAuth: 'Google',
      githubAuth: 'GitHub',
    },
    en: {
      emailLabel: 'Email',
      emailPlaceholder: 'your@email.com',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter your password',
      signInButton: 'Sign In',
      orContinueWith: 'or continue with',
      googleAuth: 'Google',
      githubAuth: 'GitHub',
    }
  }
  
  const t = translations[locale as keyof typeof translations]
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Здесь будет интеграция с NextAuth.js для аутентификации
    
    // Имитация задержки запроса
    setTimeout(() => {
      setLoading(false)
    }, 1500)
  }
  
  return (
    <motion.form 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      onSubmit={handleSubmit}
      className="mt-8 space-y-6"
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
            {t.emailLabel}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="input-field"
            placeholder={t.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
            {t.passwordLabel}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="input-field"
            placeholder={t.passwordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>
      
      <div>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 flex justify-center items-center relative"
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            t.signInButton
          )}
        </button>
      </div>
      
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-dark-200 text-white/60">
              {t.orContinueWith}
            </span>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button 
            type="button"
            onClick={() => alert('Google Auth')}  
            className="btn-secondary flex justify-center py-2"
          >
            <span className="sr-only">Sign in with Google</span>
            <svg 
              className="h-5 w-5 mr-2" 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 2a9.96 9.96 0 0 1 7.383 3.256L12 12V2Z"></path>
            </svg>
            {t.googleAuth}
          </button>
          
          <button 
            type="button"
            onClick={() => alert('GitHub Auth')}  
            className="btn-secondary flex justify-center py-2"
          >
            <span className="sr-only">Sign in with GitHub</span>
            <svg 
              className="h-5 w-5 mr-2" 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
              <path d="M9 18c-4.51 2-5-2-7-2"></path>
            </svg>
            {t.githubAuth}
          </button>
        </div>
      </div>
    </motion.form>
  )
} 