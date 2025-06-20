import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { email, otp, type = "signup" } = await request.json()

  if (!email || !otp) {
    return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 })
  }

  try {
    const BREVO_API_KEY = process.env.BREVO_API_KEY
    const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"

    if (!BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY is not configured")
    }

    const emailData = {
      sender: {
        name: process.env.SENDER_NAME || "Tasklinkers",
        email: process.env.SENDER_EMAIL || "no-reply@tasklinkers.com",
      },
      to: [
        {
          email: email,
          name: email,
        },
      ],
      subject: type === "resend" ? "Your New Verification Code" : "Welcome to Tasklinkers - Verify Your Email",
      htmlContent: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">⚡ Tasklinkers</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">
                ${type === "resend" ? "New Verification Code" : "Welcome to the platform!"}
              </p>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">
                ${type === "resend" ? "Here is your new verification code:" : "Thank you for signing up! Please use the verification code below to verify your email address:"}
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div style="background: #3b82f6; color: white; padding: 20px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 8px; display: inline-block;">
                  ${otp}
                </div>
              </div>
              
              <p style="font-size: 14px; color: #666; margin-top: 20px; text-align: center;">
                This code expires in <strong>15 minutes</strong>
              </p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              
              <p style="font-size: 12px; color: #999; text-align: center;">
                If you didn't create an account with Tasklinkers, you can safely ignore this email.
              </p>
            </div>
          </body>
        </html>
      `,
    }

    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify(emailData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Brevo API error:", errorData)
      throw new Error(`Failed to send email: ${response.status}`)
    }

    const result = await response.json()
    console.log("Email sent successfully:", result)

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    })
  } catch (error) {
    console.error("Brevo API error:", error)
    return NextResponse.json({ error: "Failed to send OTP email" }, { status: 500 })
  }
}
