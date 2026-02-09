import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { ServerSessionManager } from "@/lib/server-session-manager"

async function resetVerification() {
  const user = await ServerSessionManager.getCurrentUser()
  if (!user) return { error: "Unauthorized", status: 401 as const }

  const supabase = createServerClient()

  const { data: updatedUser, error: updateError } = await supabase
    .from("users")
    .update({
      is_verified: false,
      dojah_verified: false,
      verification_type: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)
    .select()
    .single()

  if (updateError) {
    console.error("Error updating user verification status:", updateError)
    return { error: "Failed to reset verification status", status: 500 as const }
  }

  await supabase
    .from("manual_verification_requests")
    .delete()
    .eq("user_id", user.id)

  return { success: true, updatedUser }
}

export async function POST(request: NextRequest) {
  try {
    const result = await resetVerification()
    if ("status" in result && result.status === 401) {
      return NextResponse.json({ error: result.error }, { status: 401 })
    }
    if ("status" in result && result.status === 500) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
    const { updatedUser } = result as { success: true; updatedUser: any }
    return NextResponse.json({
      success: true,
      message: "Verification status reset successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        is_verified: updatedUser.is_verified,
        dojah_verified: updatedUser.dojah_verified,
        verification_type: updatedUser.verification_type,
      },
    })
  } catch (error) {
    console.error("Reset verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/** GET: unverify current user and redirect to dashboard (for opening in browser). */
export async function GET(request: NextRequest) {
  try {
    const result = await resetVerification()
    if ("status" in result && (result.status === 401 || result.status === 500)) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    return NextResponse.redirect(new URL("/dashboard", request.url))
  } catch (error) {
    console.error("Reset verification GET error:", error)
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }
}
