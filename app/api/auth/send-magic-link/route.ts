/**
 * API Endpoint: Send Magic Link
 * Server-side magic link creation with rate limiting and validation
 * POST /api/auth/send-magic-link
 */

import { NextRequest, NextResponse } from 'next/server'
import { MagicLinkManager, UserType, MagicLinkType } from '@/lib/magic-link-manager'
import { EmailService } from '@/lib/email-service'

interface SendMagicLinkRequest {
  email: string
  user_type: UserType
  type?: MagicLinkType
  first_name?: string
  last_name?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: SendMagicLinkRequest = await request.json()

    // Validate required fields
    if (!body.email || !body.user_type) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email and user type are required',
          errorCode: 'MISSING_FIELDS'
        },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email format',
          errorCode: 'INVALID_EMAIL'
        },
        { status: 400 }
      )
    }

    // Validate user type
    const validUserTypes: UserType[] = ['freelancer', 'client', 'admin']
    if (!validUserTypes.includes(body.user_type)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid user type',
          errorCode: 'INVALID_USER_TYPE'
        },
        { status: 400 }
      )
    }

    // Default to 'login' if type not specified
    const type: MagicLinkType = body.type || 'login'

    // Create magic link
    const metadata = {
      firstName: body.first_name,
      lastName: body.last_name,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    }

    const result = await MagicLinkManager.createMagicLink(
      body.email,
      body.user_type,
      type,
      metadata
    )

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error,
          errorCode: result.errorCode
        },
        { status: 400 }
      )
    }

    // Send email with magic link
    const magicLinkUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify-magic-link?token=${result.token}&user_type=${body.user_type}`
    const name = body.first_name || body.email?.split('@')[0] || 'User'

    const emailResult = await EmailService.sendMagicLinkEmail(
      body.email,
      name,
      magicLinkUrl,
      type
    )

    if (!emailResult.success) {
      console.error('Failed to send magic link email:', emailResult.error)
      const raw = (emailResult.error || '').toLowerCase()
      const isConfigError =
        raw.includes('not configured') ||
        raw.includes('brevo') ||
        raw.includes('api key') ||
        raw.includes('not enabled') ||
        raw.includes('unauthorized') ||
        raw.includes('authentication')
      const userMessage = isConfigError
        ? 'Login emails are temporarily unavailable. Please try again later or contact support.'
        : emailResult.error || 'Failed to send email. Please try again.'
      return NextResponse.json(
        { 
          success: false, 
          error: userMessage,
          errorCode: 'EMAIL_SEND_FAILED'
        },
        { status: 500 }
      )
    }

    // Return success (don't expose token to client for security)
    return NextResponse.json({
      success: true,
      message: 'Magic link sent! Check your email.',
      expiresIn: '24 hours'
    })

  } catch (error) {
    console.error('Send magic link API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred. Please try again.',
        errorCode: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}

