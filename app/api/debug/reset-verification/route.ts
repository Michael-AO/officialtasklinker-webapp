import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createClient()

    // Reset verification status for the current user
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        is_verified: false,
        dojah_verified: false,
        verification_type: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating user verification status:', updateError)
      return NextResponse.json({ 
        error: "Failed to reset verification status" 
      }, { status: 500 })
    }

    // Also delete any existing verification requests for testing
    const { error: deleteError } = await supabase
      .from('manual_verification_requests')
      .delete()
      .eq('user_id', session.user.id)

    if (deleteError) {
      console.error('Error deleting verification requests:', deleteError)
      // Don't fail the request if this fails
    }

    return NextResponse.json({
      success: true,
      message: "Verification status reset successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        is_verified: updatedUser.is_verified,
        dojah_verified: updatedUser.dojah_verified,
        verification_type: updatedUser.verification_type
      }
    })

  } catch (error) {
    console.error('Reset verification error:', error)
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 })
  }
}
