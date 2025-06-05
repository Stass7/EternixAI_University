import { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/config'

export const metadata: Metadata = {
  title: 'Payment Successful – EternixAI University',
  description: 'Your payment has been processed successfully',
}

function PaymentSuccessContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glassmorphism rounded-xl p-8 text-center">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Payment Successful!
          </h1>
          <p className="text-white/80 text-lg mb-6">
            Thank you for your purchase. Your course access has been activated.
          </p>
          
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-6">
            <p className="text-green-400 font-semibold mb-2">What happens next?</p>
            <ul className="text-white/80 text-sm space-y-1">
              <li>• Your course is now available in your profile</li>
              <li>• You can start learning immediately</li>
              <li>• You'll receive a confirmation email shortly</li>
            </ul>
          </div>

          <div className="space-y-4">
            <Link
              href="/en/profile"
              className="btn-primary px-8 py-3 inline-block"
            >
              Go to My Courses
            </Link>
            <Link
              href="/en/courses"
              className="btn-secondary px-8 py-3 inline-block ml-4"
            >
              Browse More Courses
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function PaymentSuccessPage() {
  const session = await getServerSession(authOptions)
  
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
} 