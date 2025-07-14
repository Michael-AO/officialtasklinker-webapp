import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: taskId } = await params

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
      // Instead of 404, return success with empty applications
      return NextResponse.json({ success: true, applications: [], task: null })
    }

    console.log("=== API: Task found:", { id: task.id, client_id: task.client_id, title: task.title })

    // Get applications for this task
    const { data: applications, error: appsError } = await supabase
      .from("applications")
      .select(`
        id,
        freelancer_id,
        proposed_budget,
        cover_letter,
        status,
        created_at,
        updated_at
      `)
      .eq("task_id", taskId)
      .order("created_at", { ascending: false })

    if (appsError) {
      console.log("=== API: Error fetching applications:", appsError)
      // Instead of 500, return success with empty applications
      return NextResponse.json({ success: true, applications: [], task: { id: task.id, title: task.title } })
    }

    console.log("=== API: Found applications:", applications?.length || 0)

    // Get freelancer profiles for the applications
    const freelancerIds = applications?.map((app) => app.freelancer_id) || []
    let freelancerProfiles: any[] = []

    if (freelancerIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from("users")
        .select("id, name, avatar_url, email")
        .in("id", freelancerIds)

      if (!profilesError && profiles) {
        freelancerProfiles = profiles
      }
    }

    // Transform applications with profile data
    const transformedApplications = await Promise.all((applications || []).map(async (app) => {
      const profile = freelancerProfiles.find((p) => p.id === app.freelancer_id)

      // Get portfolio for this freelancer
      const { data: portfolio } = await supabase
        .from("portfolio_items")
        .select("id, title, description, file_url")
        .eq("user_id", app.freelancer_id)

      // Get application answers if they exist
      const { data: answers } = await supabase
        .from("application_answers")
        .select("question, answer")
        .eq("application_id", app.id)

      return {
        id: app.id,
        user_id: app.freelancer_id,
        task_id: taskId,
        freelancer_id: app.freelancer_id,
        freelancer_name: profile?.name || "Anonymous Freelancer",
        freelancer_avatar: profile?.avatar_url || "/placeholder.svg?height=40&width=40",
        freelancer_email: profile?.email || "",
        proposed_budget: app.proposed_budget,
        proposed_timeline: 14, // Default timeline since column doesn't exist
        cover_letter: app.cover_letter,
        status: app.status,
        applied_date: app.created_at,
        created_at: app.created_at,
        updated_at: app.updated_at,
        freelancer: {
          id: app.freelancer_id,
          name: profile?.name || "Anonymous Freelancer",
          email: profile?.email || "",
          avatar_url: profile?.avatar_url || "/placeholder.svg?height=40&width=40",
        },
        portfolio: portfolio || [],
        answers: answers || [],
      }
    }))

    console.log("=== API: Transformed applications:", transformedApplications.length)

    // Allow if user is client or accepted freelancer
    const acceptedApplication = (applications || []).find(
      (app) => app.status === "accepted" && app.freelancer_id === userId
    )
    if (task.client_id !== userId && !acceptedApplication) {
      console.log("=== API: User is not client or accepted freelancer. Task client:", task.client_id, "Request user:", userId)
      return NextResponse.json(
        { success: false, error: "You can only view applications for your own tasks or if you are the accepted freelancer" },
        { status: 403 },
      )
    }

    return NextResponse.json({
      success: true,
      applications: transformedApplications,
      task: {
        id: task.id,
        title: task.title,
        client_id: task.client_id,
      },
    })
  } catch (error) {
    console.error("=== API: Applications fetch error:", error)
    // Instead of 500, return success with empty applications
    return NextResponse.json(
      {
        success: true,
        applications: [],
        task: null,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 200 },
    )
  }
}
