import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data: disputes, error } = await supabase
      .from("disputes")
      .select(`
        id,
        milestone_id,
        raised_by,
        reason,
        status,
        evidence_urls,
        admin_verdict,
        created_at,
        resolved_at
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Admin disputes API error:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const withDetails = await Promise.all(
      (disputes || []).map(async (d) => {
        const { data: milestone } = await supabase
          .from("task_milestones")
          .select("id, task_id, title, amount")
          .eq("id", d.milestone_id)
          .single()
        const { data: user } = await supabase
          .from("users")
          .select("id, name, email")
          .eq("id", d.raised_by)
          .single()
        return {
          ...d,
          milestone,
          raised_by_user: user,
        }
      }),
    )

    return NextResponse.json({
      success: true,
      disputes: withDetails,
    })
  } catch (error) {
    console.error("Admin disputes error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
