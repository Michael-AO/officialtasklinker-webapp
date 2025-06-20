// app/api/test-brevo/route.ts
import { NextResponse } from 'next/server'
import brevo from '@getbrevo/brevo'

export async function GET() {
  try {
    const apiInstance = new brevo.TransactionalEmailsApi()
    apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey, 
      process.env.BREVO_API_KEY!
    )
    
    return NextResponse.json({ 
      status: 'Brevo connection successful',
      keyExists: !!process.env.BREVO_API_KEY 
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Brevo connection failed', details: error },
      { status: 500 }
    )
  }
}