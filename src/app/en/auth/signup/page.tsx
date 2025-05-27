import { Metadata } from 'next'
import SignUpPageClient from './SignUpPageClient'

export const metadata: Metadata = {
  title: 'Sign Up – EternixAI University',
  description: 'Create an account to access AI courses and lessons',
}

export default function SignUpPage() {
  return <SignUpPageClient />
} 