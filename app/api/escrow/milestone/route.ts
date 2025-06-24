import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("user-id")
    const body = await request.json()

    console.log("=== API: Creating milestone:", body)

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { escrow_id, title, description, amount, due_date, deliverables } = body

    // Insert milestone
    const { data: milestone, error } = await supabase
      .from("escrow_milestones")
      .insert({
        escrow_id,
        title,
        description,
        amount,
        due_date,
        deliverables,
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("=== API: Milestone creation error:", error)
      return NextResponse.json({ success: false, error: "Failed to create milestone" }, { status: 500 })
    }

    console.log("=== API: Milestone created:", milestone)

    return NextResponse.json({
      success: true,
      milestone,
    })
  } catch (error) {
    console.error("=== API: Milestone creation error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
