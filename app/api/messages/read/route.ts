import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { ServerSessionManager } from "@/lib/server-session-manager"

export async function PATCH(request: NextRequest) {
  try {
    const user = await ServerSessionManager.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { conversation_id } = await request.json()
    if (!conversation_id) {
      return NextResponse.json({ error: "conversation_id required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Mark all messages in this conversation that are not from current user as read
    const { error } = await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", conversation_id)
      .neq("sender_id", user.id)

    if (error) {
      console.error("Error marking messages read:", error)
      return NextResponse.json({ error: "Failed to update" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
