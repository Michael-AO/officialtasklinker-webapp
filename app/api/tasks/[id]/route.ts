import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    console.log("=== API: Fetching task details for ID:", id)

    // Validate the ID format
    if (!id || id === "undefined" || id === "null") {
      console.log("=== API: Invalid task ID:", id)
      return NextResponse.json({ success: false, error: "Invalid task ID" }, { status: 400 })
    }

    // Get user ID from headers
    const userId = request.headers.get("user-id")
    console.log("=== API: User ID from headers:", userId)

    // First, try to get the task with basic data only
    const { data: task, error } = await supabase.from("tasks").select("*").eq("id", id).single()

    if (error) {
      console.log("=== API: Database error:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Task not found",
          details: error.message,
        },
        { status: 404 },
      )
    }

    if (!task) {
      console.log("=== API: Task not found:", id)
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 })
    }

    // Check if user has permission to view this task
    if (userId && task.client_id !== userId) {
      console.log("=== API: User doesn't own this task:", { userId, clientId: task.client_id })
      // For now, allow viewing but could restrict later
    }

    // Try to get profile information separately
    let clientProfile = null
    if (task.client_id) {
      const { data: profile } = await supabase
        .from("users")
        .select("id, name, avatar_url, location, rating, completed_tasks, join_date, bio")
        .eq("id", task.client_id)
        .single()

      clientProfile = profile
    }

    // Get applications count
    const { count: applicationsCount } = await supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("task_id", id)

    // Only increment view count for active tasks (not drafts) and if not the owner
    if (task.status === "active" && userId !== task.client_id) {
      await supabase
        .from("tasks")
        .update({ views_count: (task.views_count || 0) + 1 })
        .eq("id", id)
    }

    // Transform data to match expected format
    const transformedTask = {
      ...task,
      skills_required: task.skills_required || [],
      requirements: task.requirements || [],
      questions: task.questions || [],
      attachments: task.attachments || [],
      applications_count: applicationsCount || 0,
      client: {
        id: clientProfile?.id || task.client_id,
        name: clientProfile?.name || "Anonymous Client",
        avatar_url: clientProfile?.avatar_url || "/placeholder.svg?height=40&width=40",
        rating: clientProfile?.rating || 0,
        location: clientProfile?.location || "Not specified",
        completed_tasks: clientProfile?.completed_tasks || 0,
        total_earned: 0,
        join_date: clientProfile?.join_date || task.created_at,
        bio: clientProfile?.bio || "Experienced client on Tasklinkers platform",
      },
    }

    console.log("=== API: Task found:", {
      id: transformedTask.id,
      title: transformedTask.title,
      budget_min: transformedTask.budget_min,
      budget_max: transformedTask.budget_max,
      status: transformedTask.status,
      applications_count: transformedTask.applications_count,
    })

    return NextResponse.json({
      success: true,
      task: transformedTask,
      is_saved: false,
    })
  } catch (error) {
    console.error("=== API: Task detail fetch error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
