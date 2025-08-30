import { NextRequest, NextResponse } from "next/server"
import { VerificationService } from "@/lib/verification-service"
import { supabase } from "@/lib/supabase"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params
    const body = await request.json()
    const { action, notes } = body

    if (!action || !["approve", "reject", "request_more_info"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve', 'reject', or 'request_more_info'" },
        { status: 400 }
      )
    }

    let success = false

    switch (action) {
      case "approve":
        success = await VerificationService.approveVerification(id, user.id, notes)
        break
      case "reject":
        if (!notes) {
          return NextResponse.json(
            { error: "Notes are required when rejecting verification" },
            { status: 400 }
          )
        }
        success = await VerificationService.rejectVerification(id, user.id, notes)
        break
      case "request_more_info":
        if (!notes) {
          return NextResponse.json(
            { error: "Notes are required when requesting more information" },
            { status: 400 }
          )
        }
        success = await VerificationService.requestMoreInfo(id, user.id, notes)
        break
    }

    if (!success) {
      return NextResponse.json(
        { error: "Failed to process verification action" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Verification ${action}d successfully`
    })

  } catch (error) {
    console.error("Error processing verification action:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
