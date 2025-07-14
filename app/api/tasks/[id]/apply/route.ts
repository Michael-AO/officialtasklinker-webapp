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
    const { id: taskId } = await params
    const body = await request.json()
    const userId = request.headers.get("user-id")

    console.log("=== API: Application submission for task:", taskId)

    if (!taskId || taskId === "undefined" || taskId === "null") {
      return NextResponse.json({ success: false, error: "Invalid task ID" }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: "User authentication required" }, { status: 401 })
    }

    // Check if user has already applied to this task
    const { data: existingApplication, error: checkError } = await supabase
      .from("applications")
      .select("id")
      .eq("task_id", taskId)
      .eq("freelancer_id", userId)
      .single()

    if (existingApplication) {
      return NextResponse.json({ success: false, error: "You have already applied to this task" }, { status: 400 })
    }

    // Create the application
    const { data: application, error: createError } = await supabase
      .from("applications")
      .insert({
        task_id: taskId,
        freelancer_id: userId,
        proposed_budget: body.proposed_budget,
        cover_letter: body.cover_letter,
        status: "pending",
      })
      .select()
      .single()

    if (createError) {
      console.error("=== API: Application creation error:", createError)
      return NextResponse.json({ success: false, error: "Failed to submit application" }, { status: 500 })
    }

    console.log("=== API: Application created successfully:", application.id)

    return NextResponse.json({ success: true, application })
  } catch (error) {
    console.error("=== API: Application submission error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
