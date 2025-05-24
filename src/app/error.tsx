'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Error</h1>
        <h2 className="text-xl mb-4">Something went wrong!</h2>
        <p className="mb-8 text-gray-400">
          {error.message || 'An unexpected error occurred.'}
        </p>
        <button
          onClick={reset}
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 mr-4"
        >
          Try again
        </button>
        <a href="/" className="inline-block px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700">
          Go Home
        </a>
      </div>
    </div>
  )
} 