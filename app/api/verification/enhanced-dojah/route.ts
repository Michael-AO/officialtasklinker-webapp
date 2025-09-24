import { NextRequest, NextResponse } from "next/server"
import { VerificationService } from "@/lib/verification-service"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { 
          success: false,
          error: "Unauthorized",
          code: "UNAUTHORIZED"
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      dojahResult, 
      verificationData, 
      verificationType = 'identity',
      metadata = {} 
    } = body

    // Validate required fields
    if (!dojahResult) {
      return NextResponse.json(
        { 
          success: false,
          error: "Dojah result is required",
          code: "MISSING_DOJAH_RESULT"
        },
        { status: 400 }
      )
    }

    // Validate verification data if provided
    if (verificationData) {
      const requiredFields = ['firstName', 'lastName', 'idNumber', 'idType', 'dateOfBirth']
      const missingFields = requiredFields.filter(field => !verificationData[field])
      
      if (missingFields.length > 0) {
        return NextResponse.json(
          { 
            success: false,
            error: `Missing required fields: ${missingFields.join(', ')}`,
            code: "MISSING_REQUIRED_FIELDS",
            missingFields
          },
          { status: 400 }
        )
      }
    }

    console.log("🔄 Processing enhanced Dojah verification:", {
      userId: user.id,
      verificationType,
      hasDojahResult: !!dojahResult,
      hasVerificationData: !!verificationData,
      metadata
    })

    // Process the Dojah verification result
    const result = await VerificationService.processDojahVerification(
      user.id,
      dojahResult
    )

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false,
          error: result.error || "Failed to process verification",
          code: "VERIFICATION_PROCESSING_FAILED"
        },
        { status: 400 }
      )
    }

    // Update user profile with verification status
    try {
      const { error: updateError } = await supabase
        .from("users")
        .update({
          dojah_verified: true,
          verification_type: verificationType,
          verification_status: "verified",
          verified_at: new Date().toISOString(),
          last_verification_attempt: new Date().toISOString()
        })
        .eq("id", user.id)

      if (updateError) {
        console.warn("⚠️ Failed to update user verification status:", updateError)
        // Don't fail the request for this, just log it
      }
    } catch (updateError) {
      console.warn("⚠️ Error updating user verification status:", updateError)
    }

    // Return success response with detailed information
    return NextResponse.json({
      success: true,
      data: {
        ...result.data,
        user_id: user.id,
        verification_type: verificationType,
        processed_at: new Date().toISOString(),
        metadata
      },
      message: "Verification processed successfully"
    })

  } catch (error) {
    console.error("❌ Error processing enhanced Dojah verification:", error)
    
    // Return detailed error response
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        code: "INTERNAL_SERVER_ERROR",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check verification status
export async function GET(request: NextRequest) {
  try {
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { 
          success: false,
          error: "Unauthorized",
          code: "UNAUTHORIZED"
        },
        { status: 401 }
      )
    }

    // Get user's verification status
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("dojah_verified, verification_type, verification_status, verified_at")
      .eq("id", user.id)
      .single()

    if (userError) {
      throw userError
    }

    // Get latest verification request
    const { data: verificationRequests, error: requestsError } = await supabase
      .from("user_verification_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)

    if (requestsError) {
      throw requestsError
    }

    const latestRequest = verificationRequests?.[0] || null

    return NextResponse.json({
      success: true,
      data: {
        user_id: user.id,
        verification_status: {
          dojah_verified: userData?.dojah_verified || false,
          verification_type: userData?.verification_type || null,
          verification_status: userData?.verification_status || 'unverified',
          verified_at: userData?.verified_at || null
        },
        latest_request: latestRequest ? {
          id: latestRequest.id,
          status: latestRequest.status,
          verification_type: latestRequest.verification_type,
          created_at: latestRequest.created_at,
          reviewed_at: latestRequest.reviewed_at
        } : null
      }
    })

  } catch (error) {
    console.error("❌ Error checking verification status:", error)
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        code: "INTERNAL_SERVER_ERROR"
      },
      { status: 500 }
    )
  }
}
