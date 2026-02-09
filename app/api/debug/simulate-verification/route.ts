/**
 * Demo only: set is_verified = true for the current user so the sidebar unlocks
 * without going through YouVerify. Use for presentations when YouVerify is not configured.
 */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { ServerSessionManager } from "@/lib/server-session-manager"

export async function POST() {
  try {
    const user = await ServerSessionManager.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createClient()

    const { data: updatedUser, error } = await supabase
      .from("users")
      .update({
        is_verified: true,
        verification_type: "identity",
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select("id, email, is_verified, verification_type")
      .single()

    if (error) {
      console.error("[simulate-verification] Update failed:", error)
      return NextResponse.json(
        { error: "Failed to simulate verification" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Verification simulated. Refresh the page to see full sidebar.",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        is_verified: updatedUser.is_verified,
        verification_type: updatedUser.verification_type,
      },
    })
  } catch (err) {
    console.error("[simulate-verification] Error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
