import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    console.log("API: Task creation request received")

    const supabase = createClient()

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log("API: Auth check - User:", user?.id, "Error:", authError)

    if (authError || !user) {
      console.log("API: Authentication failed")
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("API: Request body received:", body)

    // Validate required fields
    const {
      title,
      description,
      category,
      budget_type,
      budget_min,
      budget_max,
      currency = "NGN",
      duration,
      location,
      skills_required = [],
      questions = [],
      requirements = [],
      visibility = "public",
      urgency = "normal",
      experience_level = "intermediate",
      requires_escrow = false,
    } = body

    console.log("API: Extracted fields:", {
      title,
      description,
      category,
      budget_type,
      budget_min,
      budget_max,
      duration,
    })

    if (!title || !description || !category || !budget_min || !budget_max || !duration) {
      console.log("API: Missing required fields")
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Create the task in the database
    const taskData = {
      client_id: user.id,
      title,
      description,
      category,
      budget_type,
      budget_min,
      budget_max,
      currency,
      duration,
      location,
      skills_required,
      questions,
      requirements,
      visibility,
      urgency,
      experience_level,
      status: "active",
      applications_count: 0,
      views_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log("API: Inserting task data:", taskData)

    const { data: task, error: insertError } = await supabase.from("tasks").insert(taskData).select().single()

    if (insertError) {
      console.error("API: Database insert error:", insertError)
      console.error("API: Insert error details:", {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
      })
      return NextResponse.json(
        {
          success: false,
          error: `Database error: ${insertError.message}`,
          details: insertError.details,
        },
        { status: 500 },
      )
    }

    console.log("API: Task created successfully:", task)

    // If escrow is required, create an escrow account
    if (requires_escrow && task) {
      console.log("API: Creating escrow account")
      const { error: escrowError } = await supabase.from("escrow_accounts").insert({
        task_id: task.id,
        client_id: user.id,
        amount: budget_max,
        currency,
        status: "pending",
        milestones: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (escrowError) {
        console.error("API: Escrow creation error:", escrowError)
        // Don't fail the task creation if escrow fails
      }
    }

    return NextResponse.json({
      success: true,
      task,
      message: "Task created successfully",
    })
  } catch (error) {
    console.error("API: Unexpected error:", error)
    console.error("API: Error stack:", error instanceof Error ? error.stack : "No stack trace")
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
