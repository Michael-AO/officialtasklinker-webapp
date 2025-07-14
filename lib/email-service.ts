import { supabase } from "@/lib/supabase"

export interface EmailData {
  to: string
  toName?: string
  subject: string
  htmlContent: string
}

export class EmailService {
  private static BREVO_API_KEY = process.env.BREVO_API_KEY
  private static BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"
  private static SENDER_NAME = process.env.SENDER_NAME || "Tasklinkers"
  private static SENDER_EMAIL = process.env.NEXT_PUBLIC_SENDER_EMAIL || "no-reply@tasklinkers.com"

  static async sendEmail(emailData: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.BREVO_API_KEY) {
        console.error("BREVO ERROR: BREVO_API_KEY is not configured")
        return { success: false, error: "BREVO_API_KEY is not configured" }
      }

      const payload = {
        sender: {
          name: this.SENDER_NAME,
          email: this.SENDER_EMAIL,
        },
        to: [
          {
            email: emailData.to,
            name: emailData.toName || emailData.to,
          },
        ],
        subject: emailData.subject,
        htmlContent: emailData.htmlContent,
      }

      console.log("BREVO PAYLOAD:", JSON.stringify(payload, null, 2))

      // Add timeout and retry logic
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

      try {
        const response = await fetch(this.BREVO_API_URL, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "api-key": this.BREVO_API_KEY,
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        let result
        try {
          result = await response.json()
        } catch (parseError) {
          console.error("BREVO ERROR: Failed to parse response as JSON", parseError)
          result = null
        }

        console.log("BREVO RESPONSE:", response.status, result)

        if (!response.ok) {
          console.error("BREVO ERROR: API returned error", result)
          return {
            success: false,
            error: result?.message || `Failed to send email: ${response.status}`,
          }
        }

        console.log("BREVO DEBUG: Email sent successfully", result)

        return {
          success: true,
          messageId: result?.messageId,
        }
      } catch (fetchError) {
        clearTimeout(timeoutId)
        
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          console.error("BREVO ERROR: Request timed out after 15 seconds")
          return {
            success: false,
            error: "Request timed out. Please check your internet connection and try again.",
          }
        }
        
        throw fetchError
      }
    } catch (error) {
      console.error("BREVO ERROR: Exception in sendEmail", error)
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('fetch failed')) {
          return {
            success: false,
            error: "Network error. Please check your internet connection and try again.",
          }
        }
        if (error.message.includes('timeout')) {
          return {
            success: false,
            error: "Request timed out. Please try again later.",
          }
        }
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send email",
      }
    }
  }

  static async sendApplicationAcceptedEmail(
    freelancerEmail: string,
    freelancerName: string,
    taskTitle: string,
    taskId: string,
    proposedBudget: number,
    clientName: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const subject = "🎉 Your Application Has Been Accepted! - Tasklinkers"
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Application Accepted - Tasklinkers</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your application has been accepted</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              Hi <strong>${freelancerName}</strong>,
            </p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Great news! Your application for the task <strong>"${taskTitle}"</strong> has been accepted by <strong>${clientName}</strong>.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <h3 style="margin: 0 0 10px 0; color: #3b82f6;">Project Details</h3>
              <p style="margin: 5px 0;"><strong>Task:</strong> ${taskTitle}</p>
              <p style="margin: 5px 0;"><strong>Budget:</strong> ₦${proposedBudget.toLocaleString()}</p>
              <p style="margin: 5px 0;"><strong>Client:</strong> ${clientName}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://tasklinkers.com'}/dashboard/tasks/${taskId}" 
                 style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                View Project Details
              </a>
            </div>
            
            <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #1e40af;">Next Steps:</h4>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Review the project requirements and timeline</li>
                <li>Set up communication with the client</li>
                <li>Begin work on the project</li>
                <li>Keep the client updated on your progress</li>
              </ul>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
              If you have any questions about this project, please don't hesitate to reach out to the client through the platform.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            
            <p style="font-size: 12px; color: #999; text-align: center;">
              This email was sent from Tasklinkers. If you have any questions, please contact our support team.
            </p>
          </div>
        </body>
      </html>
    `

    return this.sendEmail({
      to: freelancerEmail,
      toName: freelancerName,
      subject,
      htmlContent,
    })
  }

  static async sendApplicationRejectedEmail(
    freelancerEmail: string,
    freelancerName: string,
    taskTitle: string,
    feedback?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const subject = "Application Update - Tasklinkers"
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Application Update - Tasklinkers</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Application Update</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Regarding your application</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              Hi <strong>${freelancerName}</strong>,
            </p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Thank you for your interest in the task <strong>"${taskTitle}"</strong>. After careful consideration, the client has decided to move forward with another freelancer for this project.
            </p>
            
            ${feedback ? `
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6b7280;">
                <h3 style="margin: 0 0 10px 0; color: #6b7280;">Client Feedback</h3>
                <p style="margin: 0; font-style: italic;">"${feedback}"</p>
              </div>
            ` : ''}
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Don't be discouraged! There are many other opportunities available on Tasklinkers. Keep applying to tasks that match your skills and experience.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://tasklinkers.com'}/dashboard/browse" 
                 style="background: #6b7280; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                Browse More Tasks
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            
            <p style="font-size: 12px; color: #999; text-align: center;">
              This email was sent from Tasklinkers. If you have any questions, please contact our support team.
            </p>
          </div>
        </body>
      </html>
    `

    return this.sendEmail({
      to: freelancerEmail,
      toName: freelancerName,
      subject,
      htmlContent,
    })
  }
} 