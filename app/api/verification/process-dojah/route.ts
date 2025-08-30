import { NextRequest, NextResponse } from "next/server"
import { VerificationService } from "@/lib/verification-service"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { dojahResult } = body

    if (!dojahResult) {
      return NextResponse.json(
        { error: "Dojah result is required" },
        { status: 400 }
      )
    }

    // Process the Dojah verification result
    const result = await VerificationService.processDojahVerification(
      user.id,
      dojahResult
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to process verification" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data
    })

  } catch (error) {
    console.error("Error processing Dojah verification:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
