import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestId } = await params
    const { status } = await request.json()

    console.log("=== API: Updating support request status:", { requestId, status })

    // Update the support request status
    const { data, error } = await supabase
      .from("support_requests")
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq("id", requestId)
      .select()

    if (error) {
      console.error("=== API: Error updating support request:", error)
      return NextResponse.json(
        { success: false, error: "Failed to update support request" },
        { status: 500 }
      )
    }

    console.log("=== API: Support request updated successfully:", data)

    return NextResponse.json({
      success: true,
      supportRequest: data?.[0]
    })
  } catch (error) {
    console.error("=== API: Support request update error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
} 