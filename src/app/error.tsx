'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-400">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">500</h1>
        <h2 className="text-2xl font-semibold text-white mb-4">Something went wrong!</h2>
        <p className="text-white/70 mb-8">An error occurred while processing your request.</p>
        <button
          onClick={reset}
          className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors mr-4"
        >
          Try again
        </button>
        <a 
          href="/" 
          className="inline-block px-6 py-3 bg-dark-200 text-white rounded-lg hover:bg-dark-300 transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  )
} 