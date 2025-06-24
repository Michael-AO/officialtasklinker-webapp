import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function GET(request: NextRequest) {
  try {
    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    console.log("🔍 Fetching stats for user:", user.id)

    // Get active tasks count (tasks created by user)
    const { count: activeTasks } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("client_id", user.id)
      .in("status", ["active", "in_progress"])

    // Get pending applications count (applications by user)
    const { count: pendingApplications } = await supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("freelancer_id", user.id)
      .eq("status", "pending")

    // Get completed tasks count
    const { count: completedTasks } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("client_id", user.id)
      .eq("status", "completed")

    // Calculate completion rate
    const totalTasks = (activeTasks || 0) + (completedTasks || 0)
    const completionRate = totalTasks > 0 ? Math.round(((completedTasks || 0) / totalTasks) * 100) : 0

    const stats = {
      activeTasks: activeTasks || 0,
      pendingApplications: pendingApplications || 0,
      completionRate,
      responseTime: "< 2 hours", // This could be calculated from actual data
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
