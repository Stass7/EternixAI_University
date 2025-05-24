import Link from 'next/link'
import { Metadata } from 'next'
import SignInForm from '@/components/auth/SignInForm'
import SignInPageClient from './SignInPageClient'

export const metadata: Metadata = {
  title: 'Sign In – EternixAI University',
  description: 'Sign in to your account to access courses and lessons',
}

export default function SignInPage() {
  return <SignInPageClient />
} 