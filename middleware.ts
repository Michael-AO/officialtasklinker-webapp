import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// JWT secret key
const getSecretKey = () => {
  const secret = process.env.JWT_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return new TextEncoder().encode(secret)
}

const COOKIE_NAME = 'tl-auth-token'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = [
    '/login',
    '/signup',
    '/',
    '/auth/callback',
    '/legal',
    '/terms',
    '/privacy',
    '/forgot-password',
    '/reset-password',
  ]

  // Check if current path is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )

  // Allow API routes through (they handle their own auth)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Allow public routes through
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Get session token from cookie
  const token = request.cookies.get(COOKIE_NAME)?.value

  if (!token) {
    // No session, redirect to login with return URL
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    // Verify JWT token
    const secretKey = getSecretKey()
    const { payload } = await jwtVerify(token, secretKey)
    
    const user = payload.user as any

    if (!user) {
      throw new Error('Invalid token payload')
    }

    // Role-based access control for admin routes
    if (pathname.startsWith('/admin')) {
      if (user.user_type !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // Role-based access control for client routes
    if (pathname.startsWith('/dashboard/client')) {
      if (user.user_type !== 'client') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // Allow the request to proceed
    return NextResponse.next()
  } catch (error) {
    console.error('Middleware auth error:', error)
    
    // Invalid or expired token, redirect to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    loginUrl.searchParams.set('error', 'Session expired. Please login again.')
    
    // Clear invalid cookie
    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete(COOKIE_NAME)
    
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
