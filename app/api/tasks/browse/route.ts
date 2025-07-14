import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    console.log("=== BROWSE TASKS API START ===")

    const { searchParams } = new URL(request.url)

    // Get filters from query params
    const category = searchParams.get("category")
    const budget_min = searchParams.get("budget_min")
    const budget_max = searchParams.get("budget_max")
    const location = searchParams.get("location")
    const search = searchParams.get("search")
    const skills = searchParams.get("skills")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    // Build query for active tasks only
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
          is_verified,
          avatar_url
        )
      `)
      .eq("status", "active")
      .eq("visibility", "public")
      .order("created_at", { ascending: false })

    // Apply filters
    if (category && category !== "all") {
      query = query.eq("category", category)
    }

    if (budget_min) {
      query = query.gte("budget_min", Number.parseInt(budget_min))
    }

    if (budget_max) {
      query = query.lte("budget_max", Number.parseInt(budget_max))
    }

    if (location && location !== "all") {
      query = query.eq("location", location)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (skills) {
      const skillsArray = skills.split(",").map((s) => s.trim())
      query = query.overlaps("skills_required", skillsArray)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: tasks, error: tasksError, count } = await query

    if (tasksError) {
      console.error("Tasks query error:", tasksError)
      return NextResponse.json({ success: false, error: `Database error: ${tasksError.message}` }, { status: 500 })
    }

    console.log(`Found ${tasks?.length || 0} tasks`)

    // Get application counts and check for accepted applications for each task
    const tasksWithCounts = await Promise.all(
      (tasks || []).map(async (task) => {
        try {
          // Get total application count
          const { count: appCount, error: countError } = await supabase
            .from("applications")
            .select("*", { count: "exact", head: true })
            .eq("task_id", task.id)

          if (countError) {
            console.warn("Error getting application count for task", task.id, countError)
          }

          // Check if there's an accepted application
          const { data: acceptedApp, error: acceptedError } = await supabase
            .from("applications")
            .select("id")
            .eq("task_id", task.id)
            .eq("status", "accepted")
            .single()

          if (acceptedError && acceptedError.code !== 'PGRST116') { // PGRST116 is "not found"
            console.warn("Error checking accepted application for task", task.id, acceptedError)
          }

          // If there's an accepted application, exclude this task
          if (acceptedApp) {
            return null
          }

          return {
            ...task,
            applications_count: appCount || 0,
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

    // Filter out null values (tasks with accepted applications)
    const availableTasks = tasksWithCounts.filter(task => task !== null)

    console.log(`Available tasks (no accepted applications): ${availableTasks.length}`)
    console.log("=== BROWSE TASKS API SUCCESS ===")

    return NextResponse.json({
      success: true,
      tasks: availableTasks,
      pagination: {
        page,
        limit,
        total: availableTasks.length,
        totalPages: Math.ceil(availableTasks.length / limit),
      },
    })
  } catch (error) {
    console.error("=== BROWSE TASKS API ERROR ===")
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
