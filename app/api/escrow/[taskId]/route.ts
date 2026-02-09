import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { ServerSessionManager } from "@/lib/server-session-manager"

export async function GET(request: NextRequest, { params }: { params: { taskId: string } }) {
  try {
    const { taskId } = params
    const user = await ServerSessionManager.getCurrentUser()

    console.log("=== API: Fetching escrow data for task:", taskId)

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Get escrow account for this task
    const { data: escrow, error: escrowError } = await supabase
      .from("escrow_accounts")
      .select("*")
      .eq("task_id", taskId)
      .single()

    if (escrowError && escrowError.code !== "PGRST116") {
      console.error("=== API: Escrow fetch error:", escrowError)
      return NextResponse.json({ success: false, error: "Failed to fetch escrow data" }, { status: 500 })
    }

    let milestones = []
    if (escrow) {
      // Get milestones for this escrow
      const { data: milestonesData, error: milestonesError } = await supabase
        .from("escrow_milestones")
        .select("*")
        .eq("escrow_id", escrow.id)
        .order("created_at", { ascending: true })

      if (!milestonesError) {
        milestones = milestonesData || []
      }
    }

    console.log("=== API: Escrow data found:", {
      hasEscrow: !!escrow,
      milestonesCount: milestones.length,
      escrowStatus: escrow?.status,
    })

    return NextResponse.json({
      success: true,
      escrow: escrow || null,
      milestones: milestones,
    })
  } catch (error) {
    console.error("=== API: Escrow fetch error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
