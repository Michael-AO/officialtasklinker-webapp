import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { ServerSessionManager } from "@/lib/server-session-manager"

const DEMO_VERIFIED_EMAIL = process.env.NEXT_PUBLIC_DEMO_VERIFIED_EMAIL || "your@email.com"

export async function GET(request: NextRequest) {
  try {
    const user = await ServerSessionManager.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "User authentication required" }, { status: 401 })
    }

    const userId = user.id

    // Get user verification status
    const { data: dbUser, error: userError } = await supabase
      .from('users')
      .select('is_verified, verification_type, updated_at, email, kyc_fail_reason')
      .eq('id', userId)
      .single()

    if (userError || !dbUser) {
      return NextResponse.json({ error: "Failed to get user status" }, { status: 500 })
    }

    // Demo presentation: always show verified for demo email
    if (dbUser.email === DEMO_VERIFIED_EMAIL) {
      return NextResponse.json({
        success: true,
        is_verified: true,
        status: {
          status: "verified",
          type: dbUser.verification_type || "identity",
          last_updated: dbUser.updated_at,
          kyc_fail_reason: undefined,
        },
      })
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
    let lastUpdated = dbUser.updated_at

    if (dbUser.is_verified) {
      status = "verified"
    } else if (latestRequest) {
      status = latestRequest.status
      lastUpdated = latestRequest.reviewed_at || latestRequest.submitted_at
    }

    return NextResponse.json({
      success: true,
      is_verified: dbUser.is_verified,
      status: {
        status,
        type: dbUser.verification_type || "identity",
        last_updated: lastUpdated,
        kyc_fail_reason: dbUser.kyc_fail_reason ?? undefined,
      }
    })

  } catch (error) {
    console.error('Verification status error:', error)
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 })
  }
}