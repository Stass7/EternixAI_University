import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Проверяем доступ к админ-панели
    if (req.nextUrl.pathname.includes('/admin')) {
      const token = req.nextauth.token
      
      if (!token || token.role !== 'admin') {
        return NextResponse.redirect(new URL('/ru/auth/signin', req.url))
      }
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Защищенные маршруты
        const protectedPaths = ['/profile', '/admin', '/courses/']
        const isProtectedPath = protectedPaths.some(path => 
          req.nextUrl.pathname.includes(path)
        )
        
        // Если это защищенный путь, проверяем токен
        if (isProtectedPath) {
          return !!token
        }
        
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/ru/profile/:path*',
    '/en/profile/:path*', 
    '/ru/admin/:path*',
    '/en/admin/:path*',
    '/ru/courses/:path*/lessons/:path*',
    '/en/courses/:path*/lessons/:path*',
  ],
} 