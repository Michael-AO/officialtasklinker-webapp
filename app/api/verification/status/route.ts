import { NextRequest, NextResponse } from "next/server"
import { VerificationService } from "@/lib/verification-service"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Verification status API called")
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log("🔍 Auth check result:", {
      hasUser: !!user,
      userId: user?.id,
      authError: authError?.message
    })
    
    if (authError || !user) {
      console.log("❌ Authentication failed:", authError?.message || "No user found")
      return NextResponse.json(
        { error: "Unauthorized", details: authError?.message || "No user found" },
        { status: 401 }
      )
    }

    console.log("✅ User authenticated:", user.id)

    // Get user's verification status
    const isVerified = await VerificationService.isUserVerified(user.id)
    
    // Get latest verification request
    const latestRequest = await VerificationService.getLatestVerificationRequest(user.id)
    
    // Get all verification requests for the user
    const allRequests = await VerificationService.getUserVerificationRequests(user.id)

    console.log("📊 Verification data:", {
      isVerified,
      requestCount: allRequests.length,
      latestRequest: latestRequest?.status
    })

    return NextResponse.json({
      success: true,
      data: {
        isVerified,
        latestRequest,
        allRequests,
        verificationCount: allRequests.length
      }
    })

  } catch (error) {
    console.error("❌ Error getting verification status:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
