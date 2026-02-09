import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { ServerSessionManager } from "@/lib/server-session-manager"

/**
 * GET /api/notifications
 * Returns notifications for the current user (from session)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await ServerSessionManager.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from("notifications")
      .select("id, user_id, type, title, content, message, link, is_read, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      console.error("Notifications fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
    }

    // Map DB fields to frontend shape (content/message -> message, link -> actionUrl)
    const notifications = (data || []).map((n) => ({
      id: n.id,
      type: mapTypeToFrontend(n.type),
      title: n.title,
      message: n.content || n.message || n.title,
      timestamp: n.created_at,
      read: n.is_read ?? false,
      actionUrl: n.link ?? undefined,
      actionLabel: n.link ? "View" : undefined,
    }))

    return NextResponse.json({
      success: true,
      notifications,
    })
  } catch (error) {
    console.error("Notifications API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * PATCH /api/notifications
 * Mark notification(s) as read. Body: { id?: string, markAll?: boolean }
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await ServerSessionManager.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const supabase = createServerClient()

    if (body.markAll) {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)

      if (error) {
        return NextResponse.json({ error: "Failed to mark all as read" }, { status: 500 })
      }
      return NextResponse.json({ success: true })
    }

    const id = body.id
    if (!id) {
      return NextResponse.json({ error: "Notification id or markAll required" }, { status: 400 })
    }

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Notifications PATCH error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function mapTypeToFrontend(dbType: string): "info" | "success" | "warning" | "error" {
  const map: Record<string, "info" | "success" | "warning" | "error"> = {
    task: "info",
    application: "info",
    payment: "success",
    message: "info",
    system: "info",
    info: "info",
    success: "success",
    warning: "warning",
    error: "error",
  }
  return map[dbType] ?? "info"
}
