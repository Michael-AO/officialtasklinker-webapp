import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { ServerSessionManager } from "@/lib/server-session-manager"

export async function POST(request: NextRequest) {
  try {
    const user = await ServerSessionManager.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { milestone_id: milestoneId, reason, evidence_urls: evidenceUrls } = body

    if (!milestoneId || !reason || typeof reason !== "string" || reason.trim() === "") {
      return NextResponse.json(
        { error: "milestone_id and reason are required" },
        { status: 400 },
      )
    }

    const { data: milestone, error: milestoneError } = await supabase
      .from("task_milestones")
      .select("id, task_id, status")
      .eq("id", milestoneId)
      .single()

    if (milestoneError || !milestone) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 })
    }

    if (milestone.status !== "FUNDED") {
      return NextResponse.json(
        { error: "Only FUNDED milestones can be disputed" },
        { status: 400 },
      )
    }

    const { data: acceptedApp } = await supabase
      .from("applications")
      .select("id")
      .eq("task_id", milestone.task_id)
      .eq("freelancer_id", user.id)
      .eq("status", "accepted")
      .single()

    if (!acceptedApp) {
      return NextResponse.json(
        { error: "Only the accepted freelancer for this task can raise a dispute" },
        { status: 403 },
      )
    }

    const now = new Date().toISOString()

    const { error: updateMilestoneError } = await supabase
      .from("task_milestones")
      .update({ status: "DISPUTED", updated_at: now })
      .eq("id", milestoneId)

    if (updateMilestoneError) {
      console.error("[disputes/raise] Failed to update milestone:", updateMilestoneError)
      return NextResponse.json({ error: "Failed to lock milestone" }, { status: 500 })
    }

    const urls = Array.isArray(evidenceUrls) ? evidenceUrls.filter((u: unknown) => typeof u === "string") : []

    const { data: dispute, error: insertError } = await supabase
      .from("disputes")
      .insert({
        milestone_id: milestoneId,
        raised_by: user.id,
        reason: reason.trim(),
        evidence_urls: urls.length > 0 ? urls : null,
        status: "OPEN",
      })
      .select("id, milestone_id, status, created_at")
      .single()

    if (insertError) {
      console.error("[disputes/raise] Failed to create dispute:", insertError)
      return NextResponse.json({ error: "Failed to create dispute" }, { status: 500 })
    }

    return NextResponse.json({ success: true, dispute })
  } catch (error) {
    console.error("[disputes/raise] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
