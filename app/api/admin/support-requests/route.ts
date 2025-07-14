import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    // Fetch all support requests
    const { data: supportRequests, error } = await supabase
      .from("support_requests")
      .select(`
        id,
        user_id,
        name,
        email,
        subject,
        message,
        status,
        created_at,
        updated_at
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching support requests:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch support requests" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      supportRequests: supportRequests || []
    })
  } catch (error) {
    console.error("Admin support API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status } = body

    // Update support request status
    const { error } = await supabase
      .from("support_requests")
      .update({ status })
      .eq("id", id)

    if (error) {
      console.error("Error updating support request:", error)
      return NextResponse.json({ success: false, error: "Failed to update support request" }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Admin support request update error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
} 