import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id
    const body = await request.json()
    const { user_data, ...taskData } = body

    console.log("=== API: Task Update Request ===")
    console.log("Task ID:", taskId)
    console.log("User data:", user_data)
    console.log("Task data:", taskData)

    // Validate required fields
    if (!taskData.title || !taskData.description || !taskData.category) {
      return NextResponse.json({ success: false, error: "Title, description, and category are required" }, { status: 400 })
    }

    // Validate budget
    if (!taskData.budget_min || !taskData.budget_max) {
      return NextResponse.json(
        { success: false, error: "Budget amount is required" },
        { status: 400 }
      )
    }

    // For fixed price, min and max should be the same
    if (Number(taskData.budget_min) !== Number(taskData.budget_max)) {
      return NextResponse.json(
        { success: false, error: "For fixed price tasks, budget min and max must be the same" },
        { status: 400 }
      )
    }

    // Check if task exists and user owns it
    const { data: existingTask, error: fetchError } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", taskId)
      .single()

    if (fetchError || !existingTask) {
      console.error("Error fetching existing task:", fetchError)
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      )
    }

    // Check if user owns the task
    if (existingTask.client_id !== user_data.id) {
      return NextResponse.json(
        { success: false, error: "You can only edit your own tasks" },
        { status: 403 }
      )
    }

    // Check if task has applications
    if (existingTask.applications_count > 0) {
      return NextResponse.json(
        { success: false, error: "Cannot edit task that has applications" },
        { status: 400 }
      )
    }

    // Update the task
    const { data: updatedTask, error: updateError } = await supabase
      .from("tasks")
      .update({
        title: taskData.title,
        description: taskData.description,
        category: taskData.category,
        budget_type: taskData.budget_type,
        budget_min: taskData.budget_min,
        budget_max: taskData.budget_max,
        currency: taskData.currency,
        duration: taskData.duration,
        location: taskData.location,
        skills_required: taskData.skills_required,
        questions: taskData.questions,
        requirements: taskData.requirements,
        visibility: taskData.visibility,
        urgency: taskData.urgency,
        requires_escrow: taskData.requires_escrow,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating task:", updateError)
      return NextResponse.json(
        { success: false, error: "Failed to update task" },
        { status: 500 }
      )
    }

    console.log("=== API: Task Update Success ===")
    console.log("Updated task:", updatedTask)

    return NextResponse.json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask,
    })

  } catch (error) {
    console.error("Task update error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
} 