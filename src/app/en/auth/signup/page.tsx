import Link from 'next/link'
import { Metadata } from 'next'
import SignUpForm from '@/components/auth/SignUpForm'
import SignUpPageClient from './SignUpPageClient'

export const metadata: Metadata = {
  title: 'Sign Up – EternixAI University',
  description: 'Create an account to access AI courses and lessons',
}

export default function SignUpPage() {
  return <SignUpPageClient />
} 