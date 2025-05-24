export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-xl mb-4">Page Not Found</h2>
        <p className="mb-8 text-gray-400">The page you are looking for does not exist.</p>
        <a href="/" className="inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700">
          Go Home
        </a>
      </div>
    </div>
  )
} 