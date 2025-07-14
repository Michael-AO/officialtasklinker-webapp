import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: taskId } = await params
    const body = await request.json()
    const userId = request.headers.get("user-id")

    console.log("=== API: Updating task:", taskId)

    if (!taskId || taskId === "undefined" || taskId === "null") {
      return NextResponse.json({ success: false, error: "Invalid task ID" }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: "User authentication required" }, { status: 401 })
    }

    // Verify the user is the task owner
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("client_id")
      .eq("id", taskId)
      .single()

    if (taskError || !task) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 })
    }

    if (task.client_id !== userId) {
      return NextResponse.json({ success: false, error: "You can only update your own tasks" }, { status: 403 })
    }

    // Update the task
    const { data: updatedTask, error: updateError } = await supabase
      .from("tasks")
      .update(body)
      .eq("id", taskId)
      .select()
      .single()

    if (updateError) {
      console.error("=== API: Update error:", updateError)
      return NextResponse.json({ success: false, error: "Failed to update task" }, { status: 500 })
    }

    return NextResponse.json({ success: true, task: updatedTask })
  } catch (error) {
    console.error("=== API: Task update error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
} 