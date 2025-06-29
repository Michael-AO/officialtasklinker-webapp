import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Helper function to convert simple IDs to UUID format
function convertToUUID(id: string): string {
  if (id.length === 36 && id.includes("-")) {
    return id // Already a UUID
  }
  // Convert simple ID like "1" to UUID format
  const paddedId = id.padStart(8, "0")
  return `${paddedId}-0000-4000-8000-000000000000`
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const taskId = resolvedParams.id
    const body = await request.json()

    console.log("=== API: Starting application submission")
    console.log("=== API: Task ID:", taskId)
    console.log("=== API: Request body:", JSON.stringify(body, null, 2))

    const { proposed_budget, budget_type, estimated_duration, cover_letter, questions_answers } = body

    // Get user ID from header and convert to UUID
    const rawUserId = request.headers.get("user-id") || "1"
    const userId = convertToUUID(rawUserId)
    console.log("=== API: Raw User ID:", rawUserId, "→ UUID:", userId)

    // Validate required fields
    if (!proposed_budget || !cover_letter) {
      console.log("=== API: Missing required fields")
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: proposed_budget and cover_letter are required",
        },
        { status: 400 },
      )
    }

    console.log("=== API: Step 1 - Checking if task exists")

    // Check if task exists and is active
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("id, status, client_id, budget_min, budget_max")
      .eq("id", taskId)
      .single()

    console.log("=== API: Task query result:", { task, taskError })

    if (taskError || !task) {
      console.log("=== API: Task not found:", taskError)
      return NextResponse.json(
        {
          success: false,
          error: "Task not found",
          details: taskError?.message,
        },
        { status: 404 },
      )
    }

    if (task.status !== "active") {
      console.log("=== API: Task not active:", task.status)
      return NextResponse.json(
        {
          success: false,
          error: "Task is not accepting applications",
        },
        { status: 400 },
      )
    }

    console.log("=== API: Step 2 - Validating budget")

    // Validate budget range
    const proposedAmount = Number.parseFloat(proposed_budget.toString())
    console.log("=== API: Proposed amount:", proposedAmount, "Budget range:", task.budget_min, "-", task.budget_max)

    if (task.budget_min && proposedAmount < task.budget_min) {
      return NextResponse.json(
        {
          success: false,
          error: `Proposed budget must be at least ₦${task.budget_min.toLocaleString()}`,
        },
        { status: 400 },
      )
    }

    if (task.budget_max && proposedAmount > task.budget_max) {
      return NextResponse.json(
        {
          success: false,
          error: `Proposed budget cannot exceed ₦${task.budget_max.toLocaleString()}`,
        },
        { status: 400 },
      )
    }

    console.log("=== API: Step 3 - Checking for existing application")

    // Check if user already applied
    const { data: existingApplication, error: checkError } = await supabase
      .from("applications")
      .select("id")
      .eq("task_id", taskId)
      .eq("freelancer_id", userId)
      .single()

    console.log("=== API: Existing application check:", { existingApplication, checkError })

    if (existingApplication) {
      console.log("=== API: User already applied")
      return NextResponse.json(
        {
          success: false,
          error: "You have already applied to this task",
        },
        { status: 400 },
      )
    }

    console.log("=== API: Step 4 - Preparing application data")

    // Create application record
    const applicationData = {
      task_id: taskId,
      freelancer_id: userId, // Now properly formatted UUID
      proposed_budget: proposedAmount,
      budget_type: budget_type || "fixed",
      estimated_duration: estimated_duration || "",
      cover_letter: cover_letter.trim(),
      questions_answers: questions_answers || {},
      status: "pending",
    }

    console.log("=== API: Application data to insert:", JSON.stringify(applicationData, null, 2))

    console.log("=== API: Step 5 - Inserting application")

    // Insert application
    const { data: application, error: insertError } = await supabase
      .from("applications")
      .insert(applicationData)
      .select("*")
      .single()

    console.log("=== API: Insert result:", { application, insertError })

    if (insertError) {
      console.log("=== API: Error creating application:", insertError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to submit application",
          details: insertError.message,
          code: insertError.code,
          hint: insertError.hint,
        },
        { status: 500 },
      )
    }

    console.log("=== API: Application created successfully:", application.id)

    // Note: Applications count is automatically updated by database triggers
    // when a new application is inserted into the applications table

    return NextResponse.json({
      success: true,
      application: application,
      message: "Application submitted successfully! The client will be notified.",
    })
  } catch (error) {
    console.error("=== API: Unexpected error:", error)
    console.error("=== API: Error stack:", error instanceof Error ? error.stack : "No stack")
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        type: typeof error,
      },
      { status: 500 },
    )
  }
}
