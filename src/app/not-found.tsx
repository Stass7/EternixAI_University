export default function NotFound() {
  return (
    <html>
      <body>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d0d0d', color: 'white' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '1rem' }}>404</h1>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Page Not Found</h2>
            <p style={{ marginBottom: '2rem', color: '#ccc' }}>The page you are looking for does not exist.</p>
            <a 
              href="/" 
              style={{ 
                display: 'inline-block', 
                padding: '0.75rem 1.5rem', 
                backgroundColor: '#0ea5e9', 
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