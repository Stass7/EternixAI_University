"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'
import SignUpForm from '@/components/auth/SignUpForm'

export default function SignUpPageClient() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="relative z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-primary-800/20 rounded-3xl blur-3xl -z-10"></div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glassmorphism p-8 md:p-12 rounded-2xl w-full max-w-md space-y-8"
        >
          <div className="text-center">
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-3xl font-bold text-white"
            >
              Регистрация
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-2 text-sm text-white/70"
            >
              Уже есть аккаунт? <Link href="/ru/auth/signin" className="text-primary-500 hover:text-primary-400">Войти</Link>
            </motion.p>
          </div>
          
          <SignUpForm locale="ru" />
        </motion.div>
      </div>
    </div>
  )
} 