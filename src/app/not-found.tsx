export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-400">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-4">Page Not Found</h2>
        <p className="text-white/70 mb-8">The page you are looking for does not exist.</p>
        <a 
          href="/" 
          className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  )
} 