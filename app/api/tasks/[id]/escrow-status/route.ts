import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: taskId } = await params
    const userId = request.headers.get("user-id")

    console.log("=== API: Checking escrow status for task:", taskId)

    // Validate the task ID
    if (!taskId || taskId === "undefined" || taskId === "null") {
      return NextResponse.json({ success: false, error: "Invalid task ID" }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: "User authentication required" }, { status: 401 })
    }

    // Get the task to verify ownership
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("id, client_id")
      .eq("id", taskId)
      .single()

    if (taskError || !task) {
      console.log("=== API: Task not found:", taskError)
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 })
    }

    // Check if user is the task owner or an accepted freelancer
    const { data: acceptedApplication } = await supabase
      .from("applications")
      .select("id")
      .eq("task_id", taskId)
      .eq("freelancer_id", userId)
      .eq("status", "accepted")
      .single()

    if (task.client_id !== userId && !acceptedApplication) {
      return NextResponse.json(
        { success: false, error: "You can only view escrow status for your own tasks or if you are the accepted freelancer" },
        { status: 403 }
      )
    }

    // Check if escrow exists for this task
    const { data: escrow, error: escrowError } = await supabase
      .from("escrow_accounts")
      .select(`
        id,
        status,
        amount
      `)
      .eq("task_id", taskId)
      .single()

    // Get milestones separately to avoid relationship issues
    let milestones: any[] = []
    if (escrow && !escrowError) {
      const { data: milestoneData, error: milestoneError } = await supabase
        .from("milestones")
        .select(`
          id,
          title,
          amount,
          status
        `)
        .eq("escrow_id", escrow.id)
      
      if (!milestoneError && milestoneData) {
        milestones = milestoneData
      }
    }

    if (escrowError && escrowError.code !== "PGRST116") {
      console.log("=== API: Error checking escrow:", escrowError)
      return NextResponse.json({ success: false, error: "Error checking escrow status" }, { status: 500 })
    }

    const hasEscrow = !!escrow
    const escrowStatus = escrow?.status
    const milestonesCount = milestones.length

    console.log("=== API: Escrow status check result:", { hasEscrow, escrowStatus, milestonesCount })

    return NextResponse.json({
      success: true,
      hasEscrow,
      escrowStatus,
      milestonesCount,
      milestones,
    })
  } catch (error) {
    console.error("=== API: Escrow status check error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
