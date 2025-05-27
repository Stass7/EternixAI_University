import { Metadata } from 'next'
import SignUpPageClient from './SignUpPageClient'

export const metadata: Metadata = {
  title: 'Регистрация – EternixAI University',
  description: 'Создайте аккаунт для доступа к курсам и урокам по искусственному интеллекту',
}

export default function SignUpPage() {
  return <SignUpPageClient />
} 