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

export async function GET(request: NextRequest) {
  try {
    console.log("=== MY TASKS API START ===")

    const { searchParams } = new URL(request.url)
    const rawUserId = searchParams.get("user_id")

    if (!rawUserId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    // Convert user ID to UUID format
    const userId = convertToUUID(rawUserId)
    console.log(`User ID conversion: ${rawUserId} -> ${userId}`)

    // Get filters from query params
    const status = searchParams.get("status")
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    // Build query
    let query = supabase
      .from("tasks")
      .select(`
        id,
        title,
        description,
        budget_min,
        budget_max,
        budget_type,
        status,
        category,
        skills_required,
        created_at,
        updated_at,
        deadline,
        urgency,
        location,
        currency,
        views_count,
        client_id,
        users!tasks_client_id_fkey (
          name,
          email,
          rating,
          completed_tasks,
          is_verified
        )
      `)
      .eq("client_id", userId)
      .order("created_at", { ascending: false })

    // Apply filters
    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    if (category && category !== "all") {
      query = query.eq("category", category)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: tasks, error: tasksError } = await query

    if (tasksError) {
      console.error("Tasks query error:", tasksError)
      return NextResponse.json({ success: false, error: `Database error: ${tasksError.message}` }, { status: 500 })
    }

    console.log(`Found ${tasks?.length || 0} tasks for user ${userId}`)

    // Get application counts for each task
    const tasksWithCounts = await Promise.all(
      (tasks || []).map(async (task) => {
        try {
          const { count, error: countError } = await supabase
            .from("applications")
            .select("*", { count: "exact", head: true })
            .eq("task_id", task.id)

          if (countError) {
            console.warn("Error getting application count for task", task.id, countError)
          }

          return {
            ...task,
            applications_count: count || 0,
            skills_required: task.skills_required || [],
            views_count: task.views_count || 0,
            client: task.users || null,
          }
        } catch (err) {
          console.warn("Error processing task", task.id, err)
          return {
            ...task,
            applications_count: 0,
            skills_required: task.skills_required || [],
            views_count: task.views_count || 0,
            client: task.users || null,
          }
        }
      }),
    )

    console.log("=== MY TASKS API SUCCESS ===")

    return NextResponse.json({
      success: true,
      tasks: tasksWithCounts,
      total: tasksWithCounts.length,
    })
  } catch (error) {
    console.error("=== MY TASKS API ERROR ===")
    console.error("Unexpected error:", error)

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
