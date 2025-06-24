import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: taskId } = params
    const userId = request.headers.get("user-id")

    console.log("=== API: Checking escrow status for task:", taskId)

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Check if escrow exists for this task
    const { data: escrow, error: escrowError } = await supabase
      .from("escrow_accounts")
      .select(`
        id,
        amount,
        platform_fee,
        payment_reference,
        payment_type,
        status,
        funded_at,
        created_at
      `)
      .eq("task_id", taskId)
      .eq("client_id", userId)
      .single()

    if (escrowError && escrowError.code !== "PGRST116") {
      console.error("=== API: Escrow check error:", escrowError)
      return NextResponse.json({ success: false, error: "Failed to check escrow status" }, { status: 500 })
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

    console.log("=== API: Escrow status check result:", {
      hasEscrow: !!escrow,
      escrowStatus: escrow?.status,
      milestonesCount: milestones.length,
    })

    return NextResponse.json({
      success: true,
      hasEscrow: !!escrow,
      escrow: escrow || null,
      milestones: milestones,
    })
  } catch (error) {
    console.error("=== API: Escrow status check error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
