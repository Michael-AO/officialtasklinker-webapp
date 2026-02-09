import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { ServerSessionManager } from "@/lib/server-session-manager"
import { paystackService } from "@/lib/paystack"

export async function POST(request: NextRequest) {
  try {
    const user = await ServerSessionManager.getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { reference, milestone_id: milestoneId } = body

    if (!reference || typeof reference !== "string" || !milestoneId || typeof milestoneId !== "string") {
      return NextResponse.json(
        { success: false, error: "reference and milestone_id are required" },
        { status: 400 },
      )
    }

    // Fetch milestone and task to verify ownership
    const { data: milestone, error: milestoneError } = await supabase
      .from("task_milestones")
      .select("id, task_id, amount, status")
      .eq("id", milestoneId)
      .single()

    if (milestoneError || !milestone) {
      return NextResponse.json({ success: false, error: "Milestone not found" }, { status: 404 })
    }

    if (milestone.status !== "PENDING") {
      return NextResponse.json(
        { success: false, error: "Milestone is not pending (already funded or released)" },
        { status: 400 },
      )
    }

    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("id, client_id")
      .eq("id", milestone.task_id)
      .single()

    if (taskError || !task) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 })
    }

    if (task.client_id !== user.id) {
      return NextResponse.json(
        { success: false, error: "Only the task client can fund this milestone" },
        { status: 403 },
      )
    }

    // Verify payment with Paystack
    let verification: { status?: boolean; data?: { status?: string; amount?: number } }
    try {
      verification = await paystackService.verifyTransaction(reference)
    } catch (err) {
      console.error("[milestone/fund/verify] Paystack verification error:", err)
      return NextResponse.json(
        { success: false, error: "Payment verification failed" },
        { status: 400 },
      )
    }

    if (!verification.status || verification.data?.status !== "success") {
      return NextResponse.json(
        { success: false, error: "Payment verification failed or transaction not successful" },
        { status: 400 },
      )
    }

    // Optional: ensure amount matches (Paystack amount is in kobo)
    const amountKobo = Math.round(Number(milestone.amount) * 100)
    if (verification.data?.amount != null && verification.data.amount !== amountKobo) {
      return NextResponse.json(
        { success: false, error: "Payment amount does not match milestone amount" },
        { status: 400 },
      )
    }

    const now = new Date().toISOString()
    const { error: updateError } = await supabase
      .from("task_milestones")
      .update({
        status: "FUNDED",
        paystack_reference: reference,
        updated_at: now,
      })
      .eq("id", milestoneId)
      .eq("status", "PENDING")

    if (updateError) {
      console.error("[milestone/fund/verify] Failed to update milestone:", updateError)
      return NextResponse.json(
        { success: false, error: "Failed to update milestone status" },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Milestone funded successfully",
    })
  } catch (error) {
    console.error("[milestone/fund/verify] Error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    )
  }
}
