import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: taskId } = params

    console.log("=== API: Fetching applications for task ID:", taskId)

    // Validate the task ID
    if (!taskId || taskId === "undefined" || taskId === "null") {
      return NextResponse.json({ success: false, error: "Invalid task ID" }, { status: 400 })
    }

    // Get user ID from headers
    const userId = request.headers.get("user-id")
    const authHeader = request.headers.get("authorization")

    console.log("=== API: User ID from headers:", userId)
    console.log("=== API: Auth header present:", !!authHeader)

    if (!userId) {
      return NextResponse.json({ success: false, error: "User authentication required" }, { status: 401 })
    }

    // First verify the task exists and get its details
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("id, client_id, title, status")
      .eq("id", taskId)
      .single()

    if (taskError || !task) {
      console.log("=== API: Task not found:", taskError)
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 })
    }

    console.log("=== API: Task found:", { id: task.id, client_id: task.client_id, title: task.title })

    // Check if user owns this task
    if (task.client_id !== userId) {
      console.log("=== API: User doesn't own this task. Task client:", task.client_id, "Request user:", userId)
      return NextResponse.json(
        { success: false, error: "You can only view applications for your own tasks" },
        { status: 403 },
      )
    }

    // Get applications for this task
    const { data: applications, error: appsError } = await supabase
      .from("applications")
      .select(`
        id,
        freelancer_id,
        proposed_budget,
        cover_letter,
        status,
        created_at
      `)
      .eq("task_id", taskId)
      .order("created_at", { ascending: false })

    if (appsError) {
      console.log("=== API: Error fetching applications:", appsError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch applications",
          details: appsError.message,
        },
        { status: 500 },
      )
    }

    console.log("=== API: Found applications:", applications?.length || 0)

    // Get freelancer profiles for the applications
    const freelancerIds = applications?.map((app) => app.freelancer_id) || []
    let freelancerProfiles: any[] = []

    if (freelancerIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from("users")
        .select("id, name, avatar_url")
        .in("id", freelancerIds)

      if (!profilesError && profiles) {
        freelancerProfiles = profiles
      }
    }

    // Transform applications with profile data
    const transformedApplications = (applications || []).map((app) => {
      const profile = freelancerProfiles.find((p) => p.id === app.freelancer_id)

      return {
        id: app.id,
        freelancer_id: app.freelancer_id,
        freelancer_name: profile?.name || "Anonymous Freelancer",
        freelancer_avatar: profile?.avatar_url || "/placeholder.svg?height=40&width=40",
        proposed_budget: app.proposed_budget,
        cover_letter: app.cover_letter,
        status: app.status,
        applied_date: app.created_at,
      }
    })

    console.log("=== API: Transformed applications:", transformedApplications.length)

    return NextResponse.json({
      success: true,
      applications: transformedApplications,
      task: {
        id: task.id,
        title: task.title,
      },
    })
  } catch (error) {
    console.error("=== API: Applications fetch error:", error)
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
