"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { motion } from 'framer-motion'

type SignInFormProps = {
  locale: string
}

export default function SignInForm({ locale }: SignInFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  
  const translations = {
    ru: {
      emailLabel: 'Электронная почта',
      emailPlaceholder: 'your@email.com',
      passwordLabel: 'Пароль',
      passwordPlaceholder: 'Введите пароль',
      signInButton: 'Войти',
      orContinueWith: 'или продолжить с',
      googleAuth: 'Google',
      signInError: 'Неверный email или пароль',
      signInSuccess: 'Вход выполнен успешно!',
    },
    en: {
      emailLabel: 'Email',
      emailPlaceholder: 'your@email.com',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter your password',
      signInButton: 'Sign In',
      orContinueWith: 'or continue with',
      googleAuth: 'Google',
      signInError: 'Invalid email or password',
      signInSuccess: 'Signed in successfully!',
    }
  }
  
  const t = translations[locale as keyof typeof translations]
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      
      if (result?.error) {
        setError(t.signInError)
      } else if (result?.ok) {
        // Перенаправляем на главную страницу
        router.push(`/${locale}`)
      }
    } catch (error) {
      console.error('Sign in error:', error)
      setError(t.signInError)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signIn('google', { 
        callbackUrl: `/${locale}`,
        redirect: true 
      })
    } catch (error) {
      console.error('Google sign in error:', error)
      setError('Google sign in failed')
    }
  }
  
  return (
    <motion.form 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      onSubmit={handleSubmit}
      className="mt-8 space-y-6"
    >
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}
      
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
        
        <div className="mt-6">
          <button 
            type="button"
            onClick={handleGoogleSignIn}
            className="btn-secondary w-full flex justify-center py-2"
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
        </div>
      </div>
    </motion.form>
  )
} 