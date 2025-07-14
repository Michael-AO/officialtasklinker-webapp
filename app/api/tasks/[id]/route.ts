import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Validate the ID format
    if (!id || id === "undefined" || id === "null") {
      return NextResponse.json({ success: false, error: "Invalid task ID" }, { status: 400 })
    }

    // Get user ID from headers
    const userId = request.headers.get("user-id")

    // Fetch the task from the database
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select(`
        *,
        users!tasks_client_id_fkey (
          name,
          email,
          rating,
          completed_tasks,
          is_verified,
          avatar_url
        )
      `)
      .eq("id", id)
      .single()

    if (taskError || !task) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 })
    }

    // Fetch accepted application for this task
    const { data: acceptedApp, error: appError } = await supabase
      .from("applications")
      .select("*")
      .eq("task_id", id)
      .eq("status", "accepted")
      .single()

    // Determine access level
    let access = "none"
    if (userId === task.client_id) {
      access = "owner"
    } else if (acceptedApp && userId === acceptedApp.user_id) {
      access = "accepted_freelancer"
    }

    // Always return the task, plus access info
    return NextResponse.json({ 
      success: true, 
      task: {
        ...task,
        client: task.users || null
      }, 
      access 
    })
  } catch (err) {
    return NextResponse.json({ success: false, error: "Unexpected error" })
  }
}
