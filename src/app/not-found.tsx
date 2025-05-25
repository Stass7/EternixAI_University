import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-400 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-8">Page Not Found</h2>
        <p className="text-gray-400 mb-8">
          The page you are looking for doesn't exist.
        </p>
        <Link 
          href="/" 
          className="inline-block px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
} 