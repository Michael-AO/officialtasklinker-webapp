import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { ServerSessionManager } from "@/lib/server-session-manager"

export async function GET(request: NextRequest) {
  try {
    const user = await ServerSessionManager.getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "User authentication required" }, { status: 401 })
    }

    const userId = user.id

    // Get applications where user is the freelancer (only)
    const { data: freelancerApplications, error: freelancerError } = await supabase
      .from("applications")
      .select(`
        id,
        task_id,
        proposed_budget,
        cover_letter,
        status,
        created_at,
        tasks!inner(
          id,
          title,
          budget_min,
          budget_max,
          client_id
        )
      `)
      .eq("freelancer_id", userId)
      .order("created_at", { ascending: false })
      .limit(5)

    if (freelancerError) {
      console.error("Error fetching freelancer applications:", freelancerError)
    }

    // Get client information for freelancer applications
    let clientProfiles: any[] = []
    
    if ((freelancerApplications || []).length > 0) {
      const clientIds = (freelancerApplications || []).map((app: any) => app.tasks.client_id)
      const { data: clients, error: clientsError } = await supabase
        .from("users")
        .select("id, name, email")
        .in("id", clientIds)
      
      if (!clientsError && clients) {
        clientProfiles = clients
      }
    }

    // Transform freelancer applications
    const transformedApplications = (freelancerApplications || []).map((app: any) => {
      const clientProfile = clientProfiles.find((client: any) => client.id === app.tasks.client_id)
      return {
        id: app.id,
        task_id: app.task_id,
        task_title: app.tasks.title,
        proposed_budget: app.proposed_budget,
        cover_letter: app.cover_letter,
        status: app.status,
        applied_date: app.created_at,
        role: "freelancer" as const,
        client_name: clientProfile?.name || "Unknown Client",
        client_email: clientProfile?.email || "",
        task_budget_min: app.tasks.budget_min,
        task_budget_max: app.tasks.budget_max,
      }
    })

    // Sort by date
    const allApplications = transformedApplications
      .sort((a, b) => new Date(b.applied_date).getTime() - new Date(a.applied_date).getTime())
      .slice(0, 5)

    return NextResponse.json({
      success: true,
      applications: allApplications,
    })
  } catch (error) {
    console.error("Recent applications fetch error:", error)
    return NextResponse.json(
      {
        success: false,
        applications: [],
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
} 