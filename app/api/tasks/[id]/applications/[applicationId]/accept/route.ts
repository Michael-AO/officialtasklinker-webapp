import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest, { params }: { params: { id: string; applicationId: string } }) {
  try {
    // Update application status to accepted
    const { error: updateError } = await supabase
      .from("applications")
      .update({
        status: "accepted",
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.applicationId)

    if (updateError) throw updateError

    // Get application details for escrow creation
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select(`
        *,
        task:tasks(*),
        freelancer:users!applications_user_id_fkey(*)
      `)
      .eq("id", params.applicationId)
      .single()

    if (appError) throw appError

    // Create escrow if task requires it
    if (application.task.budget_type === "fixed") {
      const { error: escrowError } = await supabase.from("escrows").insert({
        task_id: params.id,
        client_id: application.task.posted_by,
        freelancer_id: application.user_id,
        amount: application.proposed_budget,
        status: "pending",
      })

      if (escrowError) throw escrowError
    }

    // Reject all other applications for this task
    const { error: rejectError } = await supabase
      .from("applications")
      .update({ status: "rejected" })
      .eq("task_id", params.id)
      .neq("id", params.applicationId)

    if (rejectError) throw rejectError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Accept application error:", error)
    return NextResponse.json({ error: "Failed to accept application" }, { status: 500 })
  }
}
