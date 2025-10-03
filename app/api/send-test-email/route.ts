import { NextResponse } from 'next/server'
import { EmailService } from '@/lib/email-service'

export async function POST(request: Request) {
  try {
    const { email, subject, message } = await request.json()
    
    if (!email) {
      return NextResponse.json({ 
        success: false,
        error: 'Email address is required' 
      }, { status: 400 })
    }

    const result = await EmailService.sendEmail({
      to: email,
      subject: subject || "Test Email from TaskLinkers Platform",
      htmlContent: message || `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">TaskLinkers Test Email</h2>
          <p>Hello!</p>
          <p>This is a test email sent from the TaskLinkers platform to verify that our email service is working correctly.</p>
          <p>If you're receiving this email, it means our Brevo email integration is functioning properly.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Email Details:</h3>
            <ul>
              <li><strong>Sent to:</strong> ${email}</li>
              <li><strong>Sent from:</strong> TaskLinkers Platform</li>
              <li><strong>Purpose:</strong> Email service verification</li>
              <li><strong>Timestamp:</strong> ${new Date().toLocaleString()}</li>
            </ul>
          </div>
          <p>Thank you for testing our email service!</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This is an automated test email from TaskLinkers Platform.
          </p>
        </div>
      `
    })

    return NextResponse.json({ 
      success: result.success,
      messageId: result.messageId,
      error: result.error,
      email: email
    })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      },
      { status: 500 }
    )
  }
}
