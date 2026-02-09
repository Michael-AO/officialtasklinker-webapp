import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { ServerSessionManager } from "@/lib/server-session-manager"

export async function POST(request: NextRequest) {
  try {
    const user = await ServerSessionManager.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!(await ServerSessionManager.isAdmin())) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { requestId, adminNotes } = await request.json()

    if (!requestId) {
      return NextResponse.json({ error: "Request ID is required" }, { status: 400 })
    }

    const supabase = createClient()

    // Update verification request status
    const { data: updatedRequest, error: updateError } = await supabase
      .from('manual_verification_requests')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        admin_notes: adminNotes || null
      })
      .eq('id', requestId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating verification request:', updateError)
      return NextResponse.json({ 
        error: "Failed to approve verification request" 
      }, { status: 500 })
    }

    // The database trigger will automatically:
    // 1. Update the user's verification status
    // 2. Send a notification to the user

    return NextResponse.json({
      success: true,
      data: updatedRequest,
      message: "Verification approved successfully"
    })

  } catch (error) {
    console.error('Admin verification approval error:', error)
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 })
  }
}
