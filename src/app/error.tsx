'use client'

import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-dark-400 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">500</h1>
        <h2 className="text-2xl font-semibold text-white mb-8">Something went wrong</h2>
        <p className="text-gray-400 mb-8">
          An error occurred while processing your request.
        </p>
        <div className="space-x-4">
          <button
            onClick={() => reset()}
            className="inline-block px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
          >
            Try again
          </button>
          <Link 
            href="/" 
            className="inline-block px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
} 