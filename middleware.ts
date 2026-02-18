import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ServerSessionManager } from '@/lib/server-session-manager'

const CANONICAL_ORIGIN =
  process.env.NODE_ENV === 'production'
    ? (process.env.NEXT_PUBLIC_APP_URL || 'https://tasklinkers.com').replace(/\/$/, '')
    : null

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.nextUrl.hostname

  // In production, if request hit a Netlify deploy URL, redirect to canonical domain so cookie/session stay on tasklinkers.com
  if (CANONICAL_ORIGIN && host.includes('netlify.app') && host !== new URL(CANONICAL_ORIGIN).hostname) {
    const canonicalUrl = new URL(pathname + request.nextUrl.search, CANONICAL_ORIGIN)
    return NextResponse.redirect(canonicalUrl)
  }

  // Public routes that don't require authentication
  const publicRoutes = [
    '/login',
    '/signup',
    '/admin-login',
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

  // If no auth cookies found, redirect to login (use canonical URL in production so we never keep users on deploy URL)
  if (!authCookie && !supabaseSessionCookie) {
    const base = CANONICAL_ORIGIN || request.nextUrl.origin
    const loginUrl = new URL('/login', base)
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
