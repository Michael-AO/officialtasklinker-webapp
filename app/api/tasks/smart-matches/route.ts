import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Admin emails that can post tasks
const ADMIN_EMAILS = [
  "admin@tasklinkers.com",
  "michaelasereo@gmail.com", 
  "ceo@tasklinkers.com",
  "michael@tasklinkers.com"
]

function isVerifiedEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

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

    // Fetch latest active tasks with client info - only from admin emails
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select(`*, client:users!tasks_client_id_fkey(id, name, email, rating, avatar_url)`) // Include email for admin check
      .eq("status", "active")
      .order("created_at", { ascending: false }) // Get latest tasks first
      .limit(10)

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

    // Filter tasks to only include those posted by admin emails
    const adminTasks = (tasks || []).filter(task => {
      const clientEmail = task.client?.email
      return clientEmail && isVerifiedEmail(clientEmail)
    })

    console.log("=== Admin tasks found:", adminTasks.length)

    // Check for accepted applications and filter out tasks with accepted applicants
    const availableAdminTasks = await Promise.all(
      adminTasks.map(async (task) => {
        try {
          // Check if there's an accepted application for this task
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

          return task
        } catch (err) {
          console.warn("Error processing task", task.id, err)
          return task
        }
      })
    )

    // Filter out null values (tasks with accepted applications)
    const finalAdminTasks = availableAdminTasks.filter(task => task !== null)

    console.log("=== Available admin tasks (no accepted applications):", finalAdminTasks.length)

    // Build matches from available admin tasks only - latest tasks first
    const matches = finalAdminTasks.map((task, index) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      budget: `\u20a6${task.budget_min?.toLocaleString()} - \u20a6${task.budget_max?.toLocaleString()}`,
      budget_min: task.budget_min || 0,
      budget_max: task.budget_max || 0,
      client: task.client?.name || "Unknown",
      client_id: task.client_id,
      client_email: task.client?.email || "",
      client_avatar: task.client?.avatar_url || "/placeholder.svg",
      clientRating: task.client?.rating || 0,
      postedDate: task.created_at,
      matchScore: 100 - (index * 2), // Simple score based on recency
      matchReasons: ["Latest admin task", "Recently posted"], // Show as latest tasks
      urgency: task.urgency || "medium",
      skills: task.skills_required || [],
      location: task.location || "Remote",
      applications_count: task.applications_count || 0,
      views_count: task.views_count || 0,
      category: task.category || "General",
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
