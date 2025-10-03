import { NextRequest, NextResponse } from "next/server"
import { EmailService } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const { email, name, confirmationLink } = await request.json()

    if (!email || !confirmationLink) {
      return NextResponse.json(
        { error: "Email and confirmation link are required" },
        { status: 400 }
      )
    }

    console.log("Sending verification email with confirmation link...")
    console.log("Email:", email)
    console.log("Confirmation Link:", confirmationLink)

    // Send verification email with confirmation link
    const result = await EmailService.sendEmail({
      to: email,
      toName: name || email,
      subject: "Verify Your Email - Tasklinkers",
      htmlContent: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email - Tasklinkers</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Tasklinkers!</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Please verify your email address</p>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">
                Hi ${name || 'there'},
              </p>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                Thank you for signing up with Tasklinkers! To complete your registration and start using our platform, please verify your email address by clicking the button below.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmationLink}" 
                   style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                  Verify Email Address
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666; margin: 20px 0;">
                If the button doesn't work, you can copy and paste this link into your browser:
              </p>
              
              <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0; word-break: break-all;">
                <p style="margin: 0; font-size: 12px; color: #1e40af;">${confirmationLink}</p>
              </div>
              
              <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <h4 style="margin: 0 0 10px 0; color: #856404;">Important:</h4>
                <ul style="margin: 0; padding-left: 20px; color: #856404;">
                  <li>This link will expire in 24 hours</li>
                  <li>If you didn't create an account with Tasklinkers, you can safely ignore this email</li>
                  <li>For security reasons, please don't share this link with anyone</li>
                </ul>
              </div>
              
              <p style="font-size: 14px; color: #666; margin-top: 20px;">
                Once verified, you'll have full access to our platform where you can:
              </p>
              
              <ul style="font-size: 14px; color: #666; margin: 10px 0;">
                <li>Browse and apply to available tasks</li>
                <li>Post your own tasks and hire freelancers</li>
                <li>Manage your profile and portfolio</li>
                <li>Track your earnings and payments</li>
              </ul>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              
              <p style="font-size: 12px; color: #999; text-align: center;">
                This email was sent from Tasklinkers. If you have any questions, please contact our support team.
              </p>
            </div>
          </body>
        </html>
      `
    })

    if (result.success) {
      console.log("✅ Verification email sent successfully:", result.messageId)
      return NextResponse.json({
        success: true,
        messageId: result.messageId
      })
    } else {
      console.error("❌ Failed to send verification email:", result.error)
      return NextResponse.json(
        { error: result.error || "Failed to send verification email" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("❌ Error sending verification email:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
