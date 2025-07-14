import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { EmailService } from "@/lib/email-service"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; applicationId: string }> }) {
  try {
    const resolvedParams = await params
    const { id: taskId, applicationId } = resolvedParams
    const body = await request.json()
    const { feedback } = body

    // Use service role client to bypass RLS policies
    const supabase = createServerClient()

    // Update application status to rejected
    const { error } = await supabase
      .from("applications")
      .update({
        status: "rejected",
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId)

    if (error) throw error

    // Get application details for email notification
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select(`
        *,
        task:tasks(*),
        freelancer:users!applications_user_id_fkey(*)
      `)
      .eq("id", applicationId)
      .single()

    if (appError) throw appError

    // Send email notification to the freelancer
    if (application.freelancer?.email && application.freelancer?.name) {
      try {
        const emailResult = await EmailService.sendApplicationRejectedEmail(
          application.freelancer.email,
          application.freelancer.name,
          application.task.title,
          feedback
        )

        if (emailResult.success) {
          console.log("✅ Application rejection email sent successfully:", emailResult.messageId)
        } else {
          console.error("❌ Failed to send application rejection email:", emailResult.error)
          // Don't fail the whole process if email fails
        }
      } catch (emailError) {
        console.error("❌ Email service error:", emailError)
        // Don't fail the whole process if email fails
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Reject application error:", error)
    return NextResponse.json({ error: "Failed to reject application" }, { status: 500 })
  }
}
