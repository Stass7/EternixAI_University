import Link from 'next/link'
import { Metadata } from 'next'
import SignInForm from '@/components/auth/SignInForm'
import SignInPageClient from './SignInPageClient'

export const metadata: Metadata = {
  title: 'Вход – EternixAI University',
  description: 'Войдите в свой аккаунт для доступа к курсам и урокам',
}

export default function SignInPage() {
  return <SignInPageClient />
} 