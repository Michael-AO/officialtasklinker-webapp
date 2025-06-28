import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No authorization header" }, { status: 401 })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify the token and get user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      console.error("Auth error:", authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get conversations where user is participant
    const { data: conversations, error } = await supabase
      .from("conversations")
      .select(`
        id,
        task_id,
        client_id,
        freelancer_id,
        created_at,
        updated_at,
        tasks!inner(
          id,
          title
        )
      `)
      .or(`client_id.eq.${user.id},freelancer_id.eq.${user.id}`)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
    }

    // Format conversations for frontend
    const formattedConversations = await Promise.all(
      (conversations || []).map(async (conv: any) => {
        // Determine the other participant
        const isClient = conv.client_id === user.id
        const otherUserId = isClient ? conv.freelancer_id : conv.client_id

        // Get other user's profile
        const { data: otherUser } = await supabase
          .from("users")
          .select("id, name, avatar_url, user_type, rating")
          .eq("id", otherUserId)
          .single()

        // Get messages for this conversation
        const { data: messages } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: true })

        // Get last message
        const lastMessage = messages?.[messages.length - 1]

        // Count unread messages
        const unreadCount = messages?.filter((msg: any) => msg.sender_id !== user.id && !msg.is_read).length || 0

        return {
          id: conv.id,
          participant: {
            id: otherUser?.id || otherUserId,
            name: otherUser?.name || "Unknown User",
            avatar: otherUser?.avatar_url,
            role: isClient ? "Freelancer" : "Client",
            rating: otherUser?.rating || 0,
            online: false,
          },
          task_title: conv.tasks?.title || "Unknown Task",
          task_id: conv.task_id,
          last_message: lastMessage?.content || "No messages yet",
          last_message_time: lastMessage?.created_at || conv.created_at,
          unread_count: unreadCount,
          messages:
            messages?.map((msg: any) => ({
              id: msg.id,
              sender_id: msg.sender_id,
              sender_name: msg.sender_id === user.id ? "You" : otherUser?.name || "Unknown",
              content: msg.content,
              timestamp: msg.created_at,
              type: "text",
              read: msg.is_read,
            })) || [],
        }
      }),
    )

    return NextResponse.json({
      conversations: formattedConversations,
      success: true,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
