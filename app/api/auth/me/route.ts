/**
 * API Endpoint: Get Current User
 * Returns authenticated user data from JWT session
 * GET /api/auth/me
 */

import { NextResponse } from 'next/server'
import { ServerSessionManager } from '@/lib/server-session-manager'

export async function GET() {
  try {
    const user = await ServerSessionManager.getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 401, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
      )
    }

    return NextResponse.json(
      { authenticated: true, user },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    )
  } catch (error) {
    console.error('Get current user API error:', error)
    return NextResponse.json(
      { 
        authenticated: false,
        user: null 
      },
      { status: 500 }
    )
  }
}

