import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { manualVerificationService } from "@/lib/services/manual-verification.service"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("🔄 Admin verification rejection API called")

    const { id } = await params

    // Get admin user from auth
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("❌ Auth error:", authError)
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Verify admin permissions
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (adminError || adminUser?.user_type !== 'admin') {
      console.error("❌ Admin permission error:", adminError)
      return NextResponse.json(
        { error: "Admin permissions required" },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { rejectionReason, adminNotes } = body

    if (!rejectionReason || rejectionReason.trim() === '') {
      return NextResponse.json(
        { error: "Rejection reason is required" },
        { status: 400 }
      )
    }

    console.log(`❌ Admin ${user.id} rejecting verification ${id}`)
    console.log(`📝 Rejection reason: ${rejectionReason}`)

    // Reject verification
    await manualVerificationService.rejectVerification(
      id,
      user.id,
      rejectionReason,
      adminNotes
    )

    console.log(`✅ Verification ${id} rejected successfully`)

    return NextResponse.json({
      success: true,
      message: "Verification rejected successfully"
    })

  } catch (error) {
    console.error("❌ Verification rejection error:", error)
    return NextResponse.json(
      { 
        error: "Failed to reject verification",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
