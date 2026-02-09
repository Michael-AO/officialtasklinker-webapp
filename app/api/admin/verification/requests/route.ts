import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { ServerSessionManager } from "@/lib/server-session-manager"

export async function GET(request: NextRequest) {
  try {
    const user = await ServerSessionManager.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!(await ServerSessionManager.isAdmin())) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const supabase = createClient()

    // Fetch verification requests with user information
    const { data: verificationRequests, error } = await supabase
      .from('manual_verification_requests')
      .select(`
        *,
        users:user_id (
          id,
          name,
          email,
          user_type
        )
      `)
      .order('submitted_at', { ascending: false })

    if (error) {
      console.error('Error fetching verification requests:', error)
      return NextResponse.json({ 
        error: "Failed to fetch verification requests" 
      }, { status: 500 })
    }

    // Transform the data to match the expected format
    const transformedRequests = verificationRequests?.map(request => ({
      id: request.id,
      user_id: request.user_id,
      user_name: request.users?.name || 'Unknown User',
      user_email: request.users?.email || 'Unknown Email',
      user_type: request.users?.user_type || 'freelancer',
      verification_type: request.verification_type,
      status: request.status,
      submitted_at: request.submitted_at,
      reviewed_at: request.reviewed_at,
      reviewed_by: request.reviewed_by,
      personal_info: request.personal_info,
      business_info: request.business_info,
      documents: request.documents,
      admin_notes: request.admin_notes,
      created_at: request.created_at,
      updated_at: request.updated_at
    })) || []

    return NextResponse.json({
      success: true,
      data: transformedRequests
    })

  } catch (error) {
    console.error('Admin verification requests error:', error)
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 })
  }
}
