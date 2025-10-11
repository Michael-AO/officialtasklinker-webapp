/**
 * API Endpoint: Send Magic Link
 * Server-side magic link creation with rate limiting and validation
 * POST /api/auth/send-magic-link
 */

import { NextRequest, NextResponse } from 'next/server'
import { MagicLinkManager, UserType, MagicLinkType } from '@/lib/magic-link-manager'
import { sendEmail } from '@/lib/email-service'

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
    const magicLinkUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback?token=${result.token}&user_type=${body.user_type}`
    
    try {
      await sendMagicLinkEmail(
        body.email,
        magicLinkUrl,
        type,
        body.user_type,
        body.first_name
      )
    } catch (emailError) {
      console.error('Failed to send magic link email:', emailError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to send email. Please try again.',
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

/**
 * Send magic link email using Brevo
 */
async function sendMagicLinkEmail(
  email: string,
  magicLinkUrl: string,
  type: MagicLinkType,
  userType: UserType,
  firstName?: string
): Promise<void> {
  const greeting = firstName ? `Hi ${firstName}` : 'Hello'
  const action = type === 'login' ? 'log in to' : 'complete your signup for'
  
  let userTypeLabel = 'TaskLinker'
  if (userType === 'freelancer') {
    userTypeLabel = 'TaskLinker Freelancer'
  } else if (userType === 'client') {
    userTypeLabel = 'TaskLinker Client'
  } else if (userType === 'admin') {
    userTypeLabel = 'TaskLinker Admin'
  }

  const subject = type === 'login' 
    ? `Your ${userTypeLabel} Login Link` 
    : `Complete Your ${userTypeLabel} Signup`

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background: #ffffff;
      border-radius: 8px;
      padding: 32px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .logo {
      text-align: center;
      margin-bottom: 32px;
    }
    .logo h1 {
      color: #2563eb;
      margin: 0;
      font-size: 28px;
    }
    .button {
      display: inline-block;
      background: #2563eb;
      color: #ffffff;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 6px;
      font-weight: 600;
      margin: 24px 0;
    }
    .button:hover {
      background: #1d4ed8;
    }
    .security-note {
      background: #f3f4f6;
      border-left: 4px solid #2563eb;
      padding: 16px;
      margin: 24px 0;
      border-radius: 4px;
    }
    .footer {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <h1>TaskLinker</h1>
    </div>
    
    <h2>🔐 ${type === 'login' ? 'Login' : 'Signup'} Link Ready</h2>
    
    <p>${greeting},</p>
    
    <p>Click the button below to ${action} ${userTypeLabel}:</p>
    
    <div style="text-align: center;">
      <a href="${magicLinkUrl}" class="button">
        ${type === 'login' ? 'Log In Now' : 'Complete Signup'}
      </a>
    </div>
    
    <div class="security-note">
      <strong>🛡️ Security Note:</strong>
      <ul style="margin: 8px 0 0 0; padding-left: 20px;">
        <li>This link expires in <strong>24 hours</strong></li>
        <li>It can only be used <strong>once</strong></li>
        <li>If you didn't request this, you can safely ignore this email</li>
      </ul>
    </div>
    
    <p style="margin-top: 24px; font-size: 14px; color: #6b7280;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${magicLinkUrl}" style="color: #2563eb; word-break: break-all;">${magicLinkUrl}</a>
    </p>
    
    <div class="footer">
      <p>
        <strong>TaskLinker</strong><br>
        Connecting Freelancers with Clients
      </p>
      <p style="font-size: 12px; margin-top: 16px;">
        This is an automated email. Please do not reply to this message.
      </p>
    </div>
  </div>
</body>
</html>
  `

  const textContent = `
${greeting},

Click the link below to ${action} ${userTypeLabel}:

${magicLinkUrl}

Security Note:
- This link expires in 24 hours
- It can only be used once
- If you didn't request this, you can safely ignore this email

---
TaskLinker - Connecting Freelancers with Clients
  `

  await sendEmail(email, subject, textContent, htmlContent)
}

