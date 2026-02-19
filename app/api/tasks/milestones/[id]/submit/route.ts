import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { ServerSessionManager } from "@/lib/server-session-manager"

/**
 * Freelancer submits deliverable for a milestone. Sets milestone status to IN_REVIEW.
 * Body: { fileUrls?: string[], notes?: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await ServerSessionManager.getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const { id: milestoneId } = await params
    if (!milestoneId) {
      return NextResponse.json({ success: false, error: "Milestone ID required" }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const fileUrls = Array.isArray(body.fileUrls) ? body.fileUrls : []
    const notes = typeof body.notes === "string" ? body.notes : ""

    const { data: milestone, error: milestoneError } = await supabase
      .from("task_milestones")
      .select("id, task_id, status")
      .eq("id", milestoneId)
      .single()

    if (milestoneError || !milestone) {
      return NextResponse.json({ success: false, error: "Milestone not found" }, { status: 404 })
    }

    const { data: task } = await supabase
      .from("tasks")
      .select("id, assigned_freelancer_id")
      .eq("id", milestone.task_id)
      .single()

    if (!task || task.assigned_freelancer_id !== user.id) {
      return NextResponse.json(
        { success: false, error: "Only the accepted freelancer for this task can submit deliverables" },
        { status: 403 }
      )
    }

    if (milestone.status !== "FUNDED" && milestone.status !== "PENDING") {
      return NextResponse.json(
        { success: false, error: "Milestone is not in a state that accepts submissions" },
        { status: 400 }
      )
    }

    const { error: insertError } = await supabase.from("milestone_submissions").insert({
      task_milestone_id: milestoneId,
      freelancer_id: user.id,
      file_urls: fileUrls,
      notes: notes || null,
      status: "submitted",
    })

    if (insertError) {
      console.error("Milestone submission insert error:", insertError)
      return NextResponse.json(
        { success: false, error: insertError.message || "Failed to save submission" },
        { status: 500 }
      )
    }

    const { error: updateError } = await supabase
      .from("task_milestones")
      .update({ status: "IN_REVIEW", updated_at: new Date().toISOString() })
      .eq("id", milestoneId)

    if (updateError) {
      console.error("Milestone status update error:", updateError)
    }

    return NextResponse.json({ success: true, message: "Deliverable submitted" })
  } catch (error) {
    console.error("Milestone submit error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
