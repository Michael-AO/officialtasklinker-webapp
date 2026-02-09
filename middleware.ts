import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ServerSessionManager } from '@/lib/server-session-manager'

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
    '/dashboard/browse',  // Browse tasks - viewable without login (apply requires auth)
  ]

  // Check if current path is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )

  // Protected API routes: verify JWT before proceeding
  const isProtectedApiRoute =
    pathname.startsWith('/api/admin/') || pathname.startsWith('/api/dashboard/')
  if (pathname.startsWith('/api/') && isProtectedApiRoute) {
    const isValid = await ServerSessionManager.validateTokenInMiddleware(request)
    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.next()
  }

  // Allow other API routes through (they verify session via ServerSessionManager.getCurrentUser())
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Allow public routes through
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Check for authentication cookie (simplified check - actual verification happens in pages/API)
  // This avoids Edge Runtime compatibility issues with Supabase SSR
  const authCookie = request.cookies.get('tl-auth-token')
  const supabaseSessionCookie = request.cookies.get('sb-access-token') || 
                                request.cookies.get('sb-refresh-token')

  // If no auth cookies found, redirect to login
  if (!authCookie && !supabaseSessionCookie) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Allow the request to proceed - actual auth verification happens in pages/API routes
  // Role-based access control is handled at the page/API level
  return NextResponse.next()
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
