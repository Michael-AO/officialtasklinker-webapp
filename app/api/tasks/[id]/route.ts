import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { ServerSessionManager } from "@/lib/server-session-manager"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Validate the ID format
    if (!id || id === "undefined" || id === "null") {
      return NextResponse.json({ success: false, error: "Invalid task ID" }, { status: 400 })
    }

    const user = await ServerSessionManager.getCurrentUser()
    const userId = user?.id ?? null

    // Fetch the task from the database
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select(`
        *,
        users!tasks_client_id_fkey (
          name,
          email,
          rating,
          completed_tasks,
          is_verified,
          avatar_url
        )
      `)
      .eq("id", id)
      .single()

    if (taskError || !task) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 })
    }

    // Fetch accepted application for this task
    const { data: acceptedApp, error: appError } = await supabase
      .from("applications")
      .select("*")
      .eq("task_id", id)
      .eq("status", "accepted")
      .single()

    // Fetch task_milestones (Phase 3)
    const { data: taskMilestones = [] } = await supabase
      .from("task_milestones")
      .select("id, title, description, amount, status, paystack_reference, due_date, created_at, updated_at")
      .eq("task_id", id)
      .order("created_at", { ascending: true })

    // Fetch accepted freelancer profile when there is an accepted application
    let acceptedFreelancer: { id: string; name: string; avatar_url: string | null; completed_tasks: number } | null = null
    if (acceptedApp?.freelancer_id) {
      const { data: freelancer } = await supabase
        .from("users")
        .select("id, name, avatar_url, completed_tasks")
        .eq("id", acceptedApp.freelancer_id)
        .single()
      if (freelancer) {
        acceptedFreelancer = {
          id: freelancer.id,
          name: freelancer.name ?? "Freelancer",
          avatar_url: freelancer.avatar_url ?? null,
          completed_tasks: Number(freelancer.completed_tasks ?? 0),
        }
      }
    }

    // Determine access level
    let access = "none"
    if (userId === task.client_id) {
      access = "owner"
    } else if (acceptedApp && userId === acceptedApp.freelancer_id) {
      access = "accepted_freelancer"
    }

    // Always return the task, plus access info and milestones
    return NextResponse.json({
      success: true,
      task: {
        ...task,
        client: task.users || null,
        milestones: taskMilestones,
        accepted_freelancer: acceptedFreelancer,
      },
      access,
    })
  } catch (err) {
    return NextResponse.json({ success: false, error: "Unexpected error" })
  }
}
