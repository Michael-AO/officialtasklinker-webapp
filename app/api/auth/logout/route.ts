/**
 * API Endpoint: Logout
 * Destroys user session and clears cookies
 * POST /api/auth/logout
 */

import { NextResponse } from 'next/server'
import { ServerSessionManager } from '@/lib/server-session-manager'

export async function POST() {
  try {
    await ServerSessionManager.destroySession()

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })
  } catch (error) {
    console.error('Logout API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to logout' 
      },
      { status: 500 }
    )
  }
}

