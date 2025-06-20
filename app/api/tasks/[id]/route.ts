import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { id } = params

    console.log("API: Fetching task details for ID:", id)

    const { data: task, error } = await supabase
      .from("tasks")
      .select(`
        *,
        profiles!tasks_client_id_fkey (
          id,
          full_name,
          avatar_url,
          location
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.log("API: Task not found:", id, error)
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 })
    }

    // Increment view count
    await supabase
      .from("tasks")
      .update({ views_count: (task.views_count || 0) + 1 })
      .eq("id", id)

    // Transform data to match expected format
    const transformedTask = {
      ...task,
      client: {
        id: task.profiles?.id || task.client_id,
        name: task.profiles?.full_name || "Anonymous Client",
        avatar_url: task.profiles?.avatar_url,
        rating: 4.8, // Default rating
        location: task.profiles?.location || "Not specified",
        completed_tasks: 0,
        total_earned: 0,
        join_date: task.created_at,
        bio: "Experienced client on Tasklinkers platform",
      },
    }

    console.log("API: Task found:", transformedTask.title)

    return NextResponse.json({
      success: true,
      task: transformedTask,
      is_saved: false, // You can implement saved tasks functionality later
    })
  } catch (error) {
    console.error("API: Task detail fetch error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
