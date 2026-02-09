import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { ServerSessionManager } from "@/lib/server-session-manager"
import { createNotification } from "@/lib/notifications"
import { EmailService } from "@/lib/email-service"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; applicationId: string }> }) {
  try {
    const { id: taskId, applicationId } = await params

    const user = await ServerSessionManager.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Use server client (service role when available) so updates are not blocked by RLS
    const supabase = createServerClient()

    // Fetch application and task first to authorize (only task owner can accept)
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select(`
        id,
        freelancer_id,
        proposed_budget,
        task:tasks(id, client_id, title)
      `)
      .eq("id", applicationId)
      .single()

    if (appError || !application) {
      console.error("[ACCEPT] Failed to fetch application:", appError)
      return NextResponse.json({ error: "Application not found", details: appError?.message }, { status: 404 })
    }

    const rawTask = application.task
    const task =
      rawTask && !Array.isArray(rawTask) && "id" in rawTask && "client_id" in rawTask
        ? (rawTask as { id: string; client_id: string; title: string })
        : null
    if (!task || task.id !== taskId) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    if (task.client_id !== user.id) {
      return NextResponse.json({ error: "Only the task owner can accept an application" }, { status: 403 })
    }

    const now = new Date().toISOString()

    // 1. Update application status to accepted
    const { error: updateError } = await supabase
      .from("applications")
      .update({ status: "accepted", updated_at: now })
      .eq("id", applicationId)

    if (updateError) {
      console.error("[ACCEPT] Failed to update application status:", updateError)
      return NextResponse.json({ error: "Failed to update application status", details: updateError.message }, { status: 500 })
    }

    // 2. Update task status to assigned
    const { error: taskUpdateError } = await supabase
      .from("tasks")
      .update({ status: "assigned", updated_at: now })
      .eq("id", taskId)

    if (taskUpdateError) {
      console.error("[ACCEPT] Failed to update task status:", taskUpdateError)
      // Application already accepted; try to continue
    }

    // 3. Reject all other applications for this task
    await supabase
      .from("applications")
      .update({ status: "rejected", updated_at: now })
      .eq("task_id", taskId)
      .neq("id", applicationId)

    // 4. In-app notification for the freelancer
    const title = "You've been hired!"
    const content = `You've been hired for "${task.title}"!`
    const link = `/dashboard/tasks/${taskId}`
    await createNotification(application.freelancer_id, "application", title, content, link)

    // 5. Email notification (existing behavior)
    try {
      const { data: freelancer } = await supabase
        .from("users")
        .select("id, name, email")
        .eq("id", application.freelancer_id)
        .single()
      const { data: client } = await supabase
        .from("users")
        .select("id, name, email")
        .eq("id", task.client_id)
        .single()

      if (freelancer?.email && client && task) {
        await EmailService.sendApplicationAcceptedEmail(
          freelancer.email,
          freelancer.name,
          task.title,
          taskId,
          application.proposed_budget,
          client.name,
        )
      }
    } catch (emailError) {
      console.error("[ACCEPT] Email sending error:", emailError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[ACCEPT] Unexpected error:", error)
    return NextResponse.json(
      { error: "Failed to accept application", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
