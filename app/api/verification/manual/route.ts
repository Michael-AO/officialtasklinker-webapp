import { NextRequest, NextResponse } from "next/server"
import { VerificationService, type VerificationDocument, type VerificationData } from "@/lib/verification-service"
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
    const { 
      verificationType, 
      documents, 
      verificationData 
    }: {
      verificationType: "identity" | "business" | "professional"
      documents: VerificationDocument[]
      verificationData: VerificationData
    } = body

    if (!verificationType || !documents || documents.length === 0) {
      return NextResponse.json(
        { error: "Verification type and documents are required" },
        { status: 400 }
      )
    }

    // Create verification request
    const verificationRequest = await VerificationService.createVerificationRequest(
      user.id,
      verificationType,
      documents,
      verificationData
    )

    if (!verificationRequest) {
      return NextResponse.json(
        { error: "Failed to create verification request" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: verificationRequest
    })

  } catch (error) {
    console.error("Error creating manual verification request:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
