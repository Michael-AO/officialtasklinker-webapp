import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest, { params }: { params: { id: string; applicationId: string } }) {
  try {
    const body = await request.json()
    const { feedback } = body

    // Update application status to rejected
    const { error } = await supabase
      .from("applications")
      .update({
        status: "rejected",
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.applicationId)

    if (error) throw error

    // TODO: Send notification to freelancer with feedback

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Reject application error:", error)
    return NextResponse.json({ error: "Failed to reject application" }, { status: 500 })
  }
}
