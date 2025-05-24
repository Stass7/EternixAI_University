'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d0d0d', color: 'white' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '1rem' }}>500</h1>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Something went wrong!</h2>
            <p style={{ marginBottom: '2rem', color: '#ccc' }}>An error occurred while processing your request.</p>
            <button
              onClick={reset}
              style={{ 
                display: 'inline-block', 
                padding: '0.75rem 1.5rem', 
                backgroundColor: '#0ea5e9', 
                color: 'white', 
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                marginRight: '1rem'
              }}
            >
              Try again
            </button>
            <a 
              href="/" 
              style={{ 
                display: 'inline-block', 
                padding: '0.75rem 1.5rem', 
                backgroundColor: '#181818', 
                color: 'white', 
                borderRadius: '0.5rem',
                textDecoration: 'none'
              }}
            >
              Go Home
            </a>
          </div>
        </div>
      </body>
    </html>
  )
} 