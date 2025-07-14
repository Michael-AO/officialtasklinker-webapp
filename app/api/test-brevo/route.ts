// app/api/test-brevo/route.ts
import { NextResponse } from 'next/server'
import { EmailService } from '@/lib/email-service'

export async function GET() {
  try {
    // Check if API key exists
    const hasApiKey = !!process.env.BREVO_API_KEY
    
    if (!hasApiKey) {
      return NextResponse.json({ 
        status: 'Brevo API key is missing',
        keyExists: false,
        error: 'BREVO_API_KEY environment variable is not set'
      })
    }

    // Test sending a simple email
    const testResult = await EmailService.sendEmail({
      to: "test@example.com",
      subject: "Test Email from TaskLinkers",
      htmlContent: "<p>This is a test email to verify Brevo integration.</p>"
    })

    return NextResponse.json({ 
      status: testResult.success ? 'Brevo connection successful' : 'Brevo connection failed',
      keyExists: true,
      testResult: testResult,
      apiKeyLength: process.env.BREVO_API_KEY?.length || 0
    })
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'Brevo connection failed', 
        keyExists: !!process.env.BREVO_API_KEY,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      },
      { status: 500 }
    )
  }
}