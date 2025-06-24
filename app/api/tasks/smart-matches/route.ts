import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    console.log("=== Smart matches API called")

    const userId = request.headers.get("user-id")

    if (!userId) {
      console.log("=== No user ID provided")
      return NextResponse.json(
        {
          success: false,
          error: "User ID required",
        },
        { status: 401 },
      )
    }

    console.log("=== Fetching smart matches for user:", userId)

    // First, let's just get basic tasks to test
    const { data: tasks, error: tasksError } = await supabase.from("tasks").select("*").eq("status", "active").limit(10)

    if (tasksError) {
      console.error("Error fetching tasks:", tasksError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch tasks",
          details: tasksError.message,
        },
        { status: 500 },
      )
    }

    console.log("=== Found tasks:", tasks?.length || 0)

    // Simple mock matches for now to test the API
    const matches = (tasks || []).slice(0, 5).map((task, index) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      budget: `₦${task.budget_min?.toLocaleString()} - ₦${task.budget_max?.toLocaleString()}`,
      budget_min: task.budget_min || 0,
      budget_max: task.budget_max || 0,
      client: "Test Client",
      client_id: task.client_id,
      clientRating: 4.5,
      postedDate: task.created_at,
      matchScore: 95 - index * 5, // Decreasing scores
      matchReasons: ["Perfect skill match", "Budget fits your rate"],
      urgency: "medium" as const,
      skills: task.skills || ["React", "TypeScript"],
      location: task.location || "Remote",
      applications_count: 0,
      views_count: task.views_count || 0,
      category: task.category || "Development",
      deadline: task.deadline,
    }))

    console.log("=== Generated matches:", matches.length)

    return NextResponse.json({
      success: true,
      matches,
      total: matches.length,
    })
  } catch (error) {
    console.error("Error in smart matches API:", error)
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
