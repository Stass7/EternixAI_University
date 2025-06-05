import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Payment Canceled – EternixAI University',
  description: 'Your payment was canceled',
}

export default function PaymentCanceledPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glassmorphism rounded-xl p-8 text-center">
          <div className="text-6xl mb-6">❌</div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Payment Canceled
          </h1>
          <p className="text-white/80 text-lg mb-6">
            Your payment was canceled. No charges were made to your account.
          </p>
          
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
            <p className="text-yellow-400 font-semibold mb-2">Don't worry!</p>
            <p className="text-white/80 text-sm">
              You can try again anytime. Your course will be waiting for you.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/en/courses"
              className="btn-primary px-8 py-3 inline-block"
            >
              Browse Courses
            </Link>
            <Link
              href="/"
              className="btn-secondary px-8 py-3 inline-block ml-4"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 