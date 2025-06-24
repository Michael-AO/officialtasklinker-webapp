import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function POST(request: NextRequest) {
  try {
    const { conversation_id, content, type = "text" } = await request.json()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!conversation_id || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Insert message
    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert({
        conversation_id,
        sender_id: user.id,
        content,
        type,
        read: false,
      })
      .select()
      .single()

    if (messageError) {
      console.error("Error creating message:", messageError)
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
    }

    // Update conversation timestamp
    await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversation_id)

    // Get sender info for response
    const { data: sender } = await supabase.from("users").select("name").eq("id", user.id).single()

    return NextResponse.json({
      message: {
        id: message.id,
        sender_id: user.id,
        sender_name: sender?.name || "You",
        content: message.content,
        timestamp: message.created_at,
        type: message.type,
        read: false,
      },
      success: true,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
