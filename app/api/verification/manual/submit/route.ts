import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { manualVerificationService } from "@/lib/services/manual-verification.service"

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Manual verification submission API called")

    // Get user from auth
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("❌ Auth error:", authError)
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Parse request body
    const formData = await request.formData()
    const documentType = formData.get('documentType') as string
    const additionalNotes = formData.get('additionalNotes') as string || undefined

    if (!documentType) {
      return NextResponse.json(
        { error: "Document type is required" },
        { status: 400 }
      )
    }

    // Extract files from form data
    const documents = []
    const fileTypes = ['front', 'back', 'selfie']
    
    for (const fileType of fileTypes) {
      const file = formData.get(fileType) as File | null
      if (file && file.size > 0) {
        documents.push({
          type: fileType,
          file: file
        })
      }
    }

    if (documents.length === 0) {
      return NextResponse.json(
        { error: "At least one document is required" },
        { status: 400 }
      )
    }

    console.log(`📝 Processing manual verification for user ${user.id}`)
    console.log(`📄 Document type: ${documentType}`)
    console.log(`📎 Documents: ${documents.length} files`)

    // Submit verification
    const submission = await manualVerificationService.submitVerification(
      user.id,
      documentType,
      documents,
      additionalNotes
    )

    console.log(`✅ Manual verification submitted: ${submission.id}`)

    return NextResponse.json({
      success: true,
      message: "Verification documents submitted successfully",
      submission: {
        id: submission.id,
        status: submission.status,
        document_type: submission.document_type,
        submitted_at: submission.submitted_at
      }
    })

  } catch (error) {
    console.error("❌ Manual verification submission error:", error)
    return NextResponse.json(
      { 
        error: "Failed to submit verification documents",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get user from auth
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("❌ Auth error:", authError)
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Get user's verification status
    const status = await manualVerificationService.getUserVerificationStatus(user.id)

    return NextResponse.json({
      success: true,
      status: status.status,
      submission: status.submission,
      canSubmit: status.canSubmit
    })

  } catch (error) {
    console.error("❌ Error fetching verification status:", error)
    return NextResponse.json(
      { 
        error: "Failed to fetch verification status",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
