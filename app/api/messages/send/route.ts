import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { ServerSessionManager } from "@/lib/server-session-manager"

export async function POST(request: NextRequest) {
  try {
    const user = await ServerSessionManager.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { conversation_id, content, type = "text" } = await request.json()

    if (!conversation_id || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Get conversation to determine receiver_id
    const { data: conv, error: convError } = await supabase
      .from("conversations")
      .select("client_id, freelancer_id")
      .eq("id", conversation_id)
      .single()

    if (convError || !conv) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    const receiverId = conv.client_id === user.id ? conv.freelancer_id : conv.client_id
    if (!receiverId) {
      return NextResponse.json({ error: "Invalid conversation" }, { status: 400 })
    }

    // Insert message (DB columns: message_type, is_read)
    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert({
        conversation_id,
        sender_id: user.id,
        receiver_id: receiverId,
        content,
        message_type: type === "file" ? "file" : "text",
        is_read: false,
      })
      .select()
      .single()

    if (messageError) {
      console.error("Error creating message:", messageError)
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
    }

    // Update conversation timestamp
    await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversation_id)

    return NextResponse.json({
      message: {
        id: message.id,
        sender_id: user.id,
        sender_name: "You",
        content: message.content,
        timestamp: message.created_at,
        type: message.message_type || "text",
        read: false,
      },
      success: true,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
