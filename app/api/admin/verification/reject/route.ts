import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { requestId, adminNotes } = await request.json()

    if (!requestId) {
      return NextResponse.json({ error: "Request ID is required" }, { status: 400 })
    }

    if (!adminNotes || !adminNotes.trim()) {
      return NextResponse.json({ error: "Admin notes are required for rejection" }, { status: 400 })
    }

    const supabase = createClient()

    // Check if user is admin by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', session.user.id)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user is admin by email
    const adminEmails = ['michael@tasklinkers.com', 'admin@tasklinkers.com']
    if (!adminEmails.includes(user.email)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Update verification request status
    const { data: updatedRequest, error: updateError } = await supabase
      .from('manual_verification_requests')
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: session.user.id,
        admin_notes: adminNotes
      })
      .eq('id', requestId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating verification request:', updateError)
      return NextResponse.json({ 
        error: "Failed to reject verification request" 
      }, { status: 500 })
    }

    // The database trigger will automatically send a notification to the user

    return NextResponse.json({
      success: true,
      data: updatedRequest,
      message: "Verification rejected"
    })

  } catch (error) {
    console.error('Admin verification rejection error:', error)
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 })
  }
}
