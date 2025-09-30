import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    // Get user ID from headers
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "User authentication required" }, { status: 401 })
    }

    // Get user verification status
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('is_verified, verification_type, updated_at')
      .eq('id', userId)
      .single()

    if (userError) {
      return NextResponse.json({ error: "Failed to get user status" }, { status: 500 })
    }

    // Get latest verification request
    const { data: latestRequest, error: requestError } = await supabase
      .from('manual_verification_requests')
      .select('status, submitted_at, reviewed_at')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .single()

    let status = "unverified"
    let lastUpdated = user.updated_at

    if (user.is_verified) {
      status = "verified"
    } else if (latestRequest) {
      status = latestRequest.status
      lastUpdated = latestRequest.reviewed_at || latestRequest.submitted_at
    }

    return NextResponse.json({
      success: true,
      status: {
        status,
        type: user.verification_type || "identity",
        last_updated: lastUpdated
      }
    })

  } catch (error) {
    console.error('Verification status error:', error)
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 })
  }
}