import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { EmailService } from "@/lib/email-service"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; applicationId: string }> }) {
  try {
    const { id: taskId, applicationId } = await params

    // Use regular client - RLS policies should allow task owners to accept applications
    const supabase = createServerClient()

    // Update application status to accepted
    const { error: updateError } = await supabase
      .from("applications")
      .update({
        status: "accepted",
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId)

    if (updateError) {
      console.error("[ACCEPT] Failed to update application status:", updateError)
      return NextResponse.json({ error: "Failed to update application status", details: updateError.message || updateError }, { status: 500 })
    }

    // Get application details for escrow creation and email
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select(`
        *,
        task:tasks(*)
      `)
      .eq("id", applicationId)
      .single()

    if (appError) {
      console.error("[ACCEPT] Failed to fetch application details:", appError)
      return NextResponse.json({ error: "Failed to fetch application details", details: appError.message || appError }, { status: 500 })
    }

    // Get freelancer details separately
    const { data: freelancer, error: freelancerError } = await supabase
      .from("users")
      .select("id, name, email")
      .eq("id", application.freelancer_id)
      .single()

    if (freelancerError) {
      console.error("[ACCEPT] Failed to fetch freelancer details:", freelancerError)
      return NextResponse.json({ error: "Failed to fetch freelancer details", details: freelancerError.message || freelancerError }, { status: 500 })
    }

    // Get client details separately
    const { data: client, error: clientError } = await supabase
      .from("users")
      .select("id, name, email")
      .eq("id", application.task.client_id)
      .single()

    if (clientError) {
      console.error("[ACCEPT] Failed to fetch client details:", clientError)
      return NextResponse.json({ error: "Failed to fetch client details", details: clientError.message || clientError }, { status: 500 })
    }

    // Create escrow if task requires it (commented out for now due to RLS issues)
    // if (application.task && application.task.budget_type === "fixed") {
    //   const { error: escrowError } = await supabase.from("escrows").insert({
    //     task_id: taskId,
    //     client_id: application.task.posted_by,
    //     freelancer_id: application.user_id,
    //     amount: application.proposed_budget,
    //     status: "pending",
    //   })

    //   if (escrowError) {
    //     console.error("[ACCEPT] Failed to create escrow:", escrowError)
    //     return NextResponse.json({ error: "Failed to create escrow", details: escrowError.message || escrowError }, { status: 500 })
    //   }
    // }

    // Reject all other applications for this task
    const { error: rejectError } = await supabase
      .from("applications")
      .update({ status: "rejected" })
      .eq("task_id", taskId)
      .neq("id", applicationId)

    if (rejectError) {
      console.error("[ACCEPT] Failed to reject other applications:", rejectError)
      return NextResponse.json({ error: "Failed to reject other applications", details: rejectError.message || rejectError }, { status: 500 })
    }

    // Send email notification to the accepted freelancer
    try {
      const task = application.task as any

      if (freelancer && client && task) {
        console.log("[ACCEPT] Sending acceptance email to freelancer:", freelancer.email)
        
        const emailResult = await EmailService.sendApplicationAcceptedEmail(
          freelancer.email,
          freelancer.name,
          task.title,
          taskId,
          application.proposed_budget,
          client.name
        )

        if (emailResult.success) {
          console.log("[ACCEPT] Acceptance email sent successfully:", emailResult.messageId)
        } else {
          console.error("[ACCEPT] Failed to send acceptance email:", emailResult.error)
          // Don't fail the request if email fails, just log it
        }
      } else {
        console.error("[ACCEPT] Missing user data for email:", { freelancer, client, task })
      }
    } catch (emailError) {
      console.error("[ACCEPT] Email sending error:", emailError)
      // Don't fail the request if email fails, just log it
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[ACCEPT] Unexpected error:", error)
    return NextResponse.json({ error: "Failed to accept application", details: error instanceof Error ? error.message : error }, { status: 500 })
  }
}
