import { NextRequest, NextResponse } from "next/server"
import { VerificationService } from "@/lib/verification-service"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: userProfile } = await supabase
      .from("users")
      .select("user_type")
      .eq("id", user.id)
      .single()

    if (userProfile?.user_type !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      )
    }

    // Get pending verifications
    const pendingVerifications = await VerificationService.getPendingVerifications()
    
    // Get verification statistics
    const stats = await VerificationService.getVerificationStats()

    return NextResponse.json({
      success: true,
      data: {
        pendingVerifications,
        stats
      }
    })

  } catch (error) {
    console.error("Error getting pending verifications:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
