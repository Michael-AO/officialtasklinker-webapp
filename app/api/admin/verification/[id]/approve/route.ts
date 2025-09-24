import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { manualVerificationService } from "@/lib/services/manual-verification.service"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("🔄 Admin verification approval API called")

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
    const { verificationScore, adminNotes } = body

    if (!verificationScore || verificationScore < 1 || verificationScore > 100) {
      return NextResponse.json(
        { error: "Verification score must be between 1 and 100" },
        { status: 400 }
      )
    }

    console.log(`✅ Admin ${user.id} approving verification ${id}`)
    console.log(`📊 Verification score: ${verificationScore}`)

    // Approve verification
    await manualVerificationService.approveVerification(
      id,
      user.id,
      verificationScore,
      adminNotes
    )

    console.log(`✅ Verification ${id} approved successfully`)

    return NextResponse.json({
      success: true,
      message: "Verification approved successfully"
    })

  } catch (error) {
    console.error("❌ Verification approval error:", error)
    return NextResponse.json(
      { 
        error: "Failed to approve verification",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
