import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { ServerSessionManager } from "@/lib/server-session-manager"

/**
 * GET /api/escrow
 * Returns all escrow_accounts where the current user is client or freelancer,
 * with milestones and task/party names.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await ServerSessionManager.getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()

    const { data: accounts, error: accError } = await supabase
      .from("escrow_accounts")
      .select(`
        id,
        task_id,
        client_id,
        freelancer_id,
        amount,
        currency,
        status,
        payment_reference,
        created_at,
        updated_at,
        dispute_reason
      `)
      .or(`client_id.eq.${user.id},freelancer_id.eq.${user.id}`)
      .order("updated_at", { ascending: false })

    if (accError) {
      console.error("Escrow list error:", accError)
      return NextResponse.json({ success: false, error: "Failed to fetch escrow" }, { status: 500 })
    }

    const transactions = await Promise.all(
      (accounts || []).map(async (acc: any) => {
        const [taskRes, clientRes, freelancerRes, milestonesRes] = await Promise.all([
          acc.task_id
            ? supabase.from("tasks").select("title").eq("id", acc.task_id).single()
            : { data: null },
          acc.client_id
            ? supabase.from("users").select("name").eq("id", acc.client_id).single()
            : { data: null },
          acc.freelancer_id
            ? supabase.from("users").select("name").eq("id", acc.freelancer_id).single()
            : { data: null },
          supabase
            .from("escrow_milestones")
            .select("id, title, description, amount, status, due_date, completed_at")
            .eq("escrow_id", acc.id)
            .order("created_at", { ascending: true }),
        ])

        const milestones = (milestonesRes.data || []).map((m: any) => ({
          id: m.id,
          title: m.title,
          description: m.description || "",
          amount: Number(m.amount) ?? 0,
          status: (m.status || "pending") as "pending" | "completed" | "approved" | "disputed",
          dueDate: m.due_date || "",
          completedAt: m.completed_at,
        }))

        return {
          id: acc.id,
          taskId: acc.task_id,
          taskTitle: taskRes.data?.title || "Unknown Task",
          clientId: acc.client_id,
          clientName: clientRes.data?.name || "Unknown",
          freelancerId: acc.freelancer_id,
          freelancerName: freelancerRes.data?.name || "Unknown",
          amount: Number(acc.amount) ?? 0,
          currency: acc.currency || "NGN",
          status: acc.status,
          paymentReference: acc.payment_reference || "",
          createdAt: acc.created_at,
          updatedAt: acc.updated_at,
          disputeReason: acc.dispute_reason,
          milestones,
        }
      })
    )

    return NextResponse.json({
      success: true,
      transactions,
      disputes: [],
    })
  } catch (error) {
    console.error("GET /api/escrow error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
