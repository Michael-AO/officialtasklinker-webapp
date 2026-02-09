import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { ServerSessionManager } from "@/lib/server-session-manager"

export async function GET(request: NextRequest) {
  try {
    console.log("=== Smart matches API called")

    const user = await ServerSessionManager.getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User ID required" },
        { status: 401 },
      )
    }

    const userId = user.id
    console.log("=== Fetching smart matches for user:", userId)

    // Fetch current user's skills from DB (for MATCH-01: filter by skill match)
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("skills")
      .eq("id", userId)
      .single()

    const userSkills: string[] = Array.isArray(profile?.skills) ? profile.skills : []
    if (profileError) {
      console.warn("Could not load user skills:", profileError.message)
    }

    // Fetch latest active tasks with client info (no admin-email filter; any task from any client)
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select(`*, client:users!tasks_client_id_fkey(id, name, email, rating, avatar_url)`)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(50)

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

    // Filter out tasks that already have an accepted application
    const tasksWithoutAccepted = await Promise.all(
      (tasks || []).map(async (task) => {
        const { data: acceptedApp, error: acceptedError } = await supabase
          .from("applications")
          .select("id")
          .eq("task_id", task.id)
          .eq("status", "accepted")
          .single()

        if (acceptedError && acceptedError.code !== "PGRST116") {
          console.warn("Error checking accepted application for task", task.id, acceptedError)
        }
        if (acceptedApp) return null
        return task
      }),
    )

    const availableTasks = tasksWithoutAccepted.filter((t): t is NonNullable<typeof t> => t !== null)

    // MATCH-01: Filter by skill match — keep tasks where user.skills and task.skills_required overlap
    const taskSkills = (t: { skills_required?: string[] | null }) =>
      Array.isArray(t.skills_required) ? t.skills_required : []
    const normalized = (arr: string[]) => arr.map((s) => String(s).toLowerCase().trim())

    const userSkillsNorm = new Set(normalized(userSkills))
    const skillMatchedTasks = availableTasks.filter((task) => {
      const required = taskSkills(task)
      if (required.length === 0) return true // No required skills → include
      const requiredNorm = normalized(required)
      const hasMatch = requiredNorm.some((s) => userSkillsNorm.has(s))
      return hasMatch
    })

    // Optional: rank by number of matching skills (more overlap = higher score)
    const withScore = skillMatchedTasks.map((task) => {
      const required = taskSkills(task)
      const requiredNorm = new Set(normalized(required))
      let matchCount = 0
      userSkillsNorm.forEach((s) => {
        if (requiredNorm.has(s)) matchCount++
      })
      return { task, matchCount }
    })
    withScore.sort((a, b) => b.matchCount - a.matchCount)

    const orderedTasks = withScore.map(({ task }) => task).slice(0, 10)

    const matches = orderedTasks.map((task, index) => ({
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
      matchScore: 100 - index * 5,
      matchReasons: ["Skill match", "Recently posted"],
      urgency: task.urgency || "normal",
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
