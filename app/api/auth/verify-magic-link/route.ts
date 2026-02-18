/**
 * API Endpoint: Verify Magic Link
 * Server-side magic link verification with atomic single-use enforcement
 * GET /api/auth/verify-magic-link?token={token}&user_type={user_type}
 */

import { NextRequest, NextResponse } from 'next/server'
import { MagicLinkManager, UserType } from '@/lib/magic-link-manager'
import { ServerSessionManager } from '@/lib/server-session-manager'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')
    const userType = searchParams.get('user_type') as UserType

    // Validate required parameters
    if (!token || !userType) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Token and user type are required',
          errorCode: 'MISSING_PARAMETERS'
        },
        { status: 400 }
      )
    }

    // Validate user type
    const validUserTypes: UserType[] = ['freelancer', 'client', 'admin']
    if (!validUserTypes.includes(userType)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid user type',
          errorCode: 'INVALID_USER_TYPE'
        },
        { status: 400 }
      )
    }

    // Verify magic link (atomic operation - ensures single use)
    const result = await MagicLinkManager.verifyMagicLink(token, userType)

    if (!result.success) {
      const canonicalOrigin =
        process.env.NODE_ENV === 'production'
          ? (process.env.NEXT_PUBLIC_APP_URL || 'https://tasklinkers.com').replace(/\/$/, '')
          : request.nextUrl.origin
      const errorUrl = new URL('/login', canonicalOrigin)
      errorUrl.searchParams.set('error', result.error || 'Verification failed')
      errorUrl.searchParams.set('error_code', result.errorCode || 'UNKNOWN')
      return NextResponse.redirect(errorUrl)
    }

    // Create session for user
    const metadata = {
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    }

    const sessionToken = await ServerSessionManager.createSession(result.user!, metadata)

    // Redirect to appropriate dashboard based on user type
    let dashboardUrl: string
    switch (userType) {
      case 'admin':
        dashboardUrl = '/admin/dashboard'
        break
      case 'client':
      case 'freelancer':
      default:
        dashboardUrl = '/dashboard'
        break
    }

    // Always redirect to canonical app URL in production so we never send users to deploy URL (e.g. *.netlify.app)
    const canonicalOrigin =
      process.env.NODE_ENV === 'production'
        ? (process.env.NEXT_PUBLIC_APP_URL || 'https://tasklinkers.com').replace(/\/$/, '')
        : request.nextUrl.origin
    const redirectUrl = new URL(dashboardUrl, canonicalOrigin)
    redirectUrl.searchParams.set('verified', 'true')
    const redirectHref = redirectUrl.toString().replace(/&/g, '&amp;').replace(/"/g, '&quot;')

    // Return 200 + HTML redirect so the browser persists the Set-Cookie before navigating.
    // Some browsers don't persist cookies on 3xx redirect responses, which caused users to land on dashboard without the session cookie and get sent back to login.
    const isProduction = process.env.NODE_ENV === 'production'
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${redirectHref}"></head><body>Redirecting to dashboard…</body></html>`
    const res = new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
    const cookieDomain =
      isProduction && canonicalOrigin ? new URL(canonicalOrigin).hostname : undefined
    res.cookies.set(ServerSessionManager.COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
      ...(cookieDomain && { domain: cookieDomain }),
    })
    return res

  } catch (error) {
    console.error('Verify magic link API error:', error)
    const canonicalOrigin =
      process.env.NODE_ENV === 'production'
        ? (process.env.NEXT_PUBLIC_APP_URL || 'https://tasklinkers.com').replace(/\/$/, '')
        : request.nextUrl.origin
    const errorUrl = new URL('/login', canonicalOrigin)
    errorUrl.searchParams.set('error', 'An unexpected error occurred. Please try again.')
    errorUrl.searchParams.set('error_code', 'INTERNAL_ERROR')
    return NextResponse.redirect(errorUrl)
  }
}

