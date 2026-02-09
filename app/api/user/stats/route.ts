import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { ServerSessionManager } from "@/lib/server-session-manager"

export async function GET(request: NextRequest) {
  try {
    const user = await ServerSessionManager.getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "User ID required" }, { status: 401 })
    }

    const userId = user.id
    console.log("🔍 Fetching stats for user:", userId)

    // Get user profile for totalEarnings and completedTasks
    const { data: profile } = await supabase
      .from("users")
      .select("total_earned, completed_tasks")
      .eq("id", userId)
      .single()

    // Get active tasks count (tasks created by user)
    const { count: activeTasks } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("client_id", userId)
      .in("status", ["active", "in_progress"])

    // Get pending applications count (applications by user)
    const { count: pendingApplications } = await supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("freelancer_id", userId)
      .eq("status", "pending")

    // Get completed tasks count
    const { count: completedTasks } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("client_id", userId)
      .eq("status", "completed")

    // Completion rate: use profile completed_tasks vs (active + completed) or profile only
    const completed = profile?.completed_tasks ?? completedTasks ?? 0
    const active = activeTasks || 0
    const totalTasks = active + (completedTasks || 0)
    const completionRate = totalTasks > 0 ? Math.round(((completedTasks || 0) / totalTasks) * 100) : 0

    const stats = {
      activeTasks: activeTasks || 0,
      pendingApplications: pendingApplications || 0,
      totalEarnings: profile?.total_earned ?? 0,
      completedTasks: profile?.completed_tasks ?? completedTasks ?? 0,
      completionRate,
      responseTime: "< 2 hours",
    }

    console.log("✅ Stats fetched successfully:", stats)

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error("❌ Stats API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
