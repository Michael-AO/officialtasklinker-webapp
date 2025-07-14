import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Helper function to convert simple ID to UUID format
function convertToUUID(id: string): string {
  if (id.length === 1) {
    // Convert single digit to UUID format
    return `0000000${id}-0000-4000-8000-000000000000`
  }
  return id
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: taskId } = await params

    console.log("=== API: Fetching similar tasks for task ID:", taskId)

    if (!taskId || taskId === "undefined" || taskId === "null") {
      return NextResponse.json({ success: false, error: "Invalid task ID" }, { status: 400 })
    }

    // Get the current task to understand its category and skills
    const { data: currentTask, error: taskError } = await supabase
      .from("tasks")
      .select("category, skills_required, budget_type, budget_max")
      .eq("id", taskId)
      .single()

    if (taskError || !currentTask) {
      console.log("=== API: Current task not found:", taskError)
      return NextResponse.json({ success: true, similarTasks: [] })
    }

    // Find similar tasks based on category and skills
    const { data: similarTasks, error: similarError } = await supabase
      .from("tasks")
      .select(`
        id,
        title,
        description,
        budget_min,
        budget_max,
        budget_type,
        category,
        location,
        skills_required,
        created_at,
        applications_count,
        client:users!tasks_client_id_fkey (
          id,
          name,
          avatar_url,
          rating,
          reviews,
          is_verified
        )
      `)
      .eq("status", "open")
      .eq("category", currentTask.category)
      .neq("id", taskId)
      .order("created_at", { ascending: false })
      .limit(5)

    if (similarError) {
      console.log("=== API: Error fetching similar tasks:", similarError)
      return NextResponse.json({ success: true, similarTasks: [] })
    }

    // Transform the data to match the expected format
    const transformedTasks = (similarTasks || []).map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      budget_min: task.budget_min,
      budget_max: task.budget_max,
      budget_type: task.budget_type,
      category: task.category,
      location: task.location,
      skills_required: task.skills_required || [],
      created_at: task.created_at,
      applications_count: task.applications_count,
      client: {
        id: (task.client as any)?.id,
        name: (task.client as any)?.name || "Anonymous Client",
        avatar_url: (task.client as any)?.avatar_url || "/placeholder.svg",
        rating: (task.client as any)?.rating || 0,
        reviews: (task.client as any)?.reviews || 0,
        is_verified: (task.client as any)?.is_verified || false,
      },
    }))

    console.log("=== API: Found similar tasks:", transformedTasks.length)

    return NextResponse.json({
      success: true,
      similarTasks: transformedTasks,
    })
  } catch (error) {
    console.error("=== API: Similar tasks fetch error:", error)
    return NextResponse.json(
      {
        success: true,
        similarTasks: [],
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 200 },
    )
  }
}
