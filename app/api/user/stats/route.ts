import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Helper function to validate UUID format
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

// Helper function to generate a UUID from a simple ID (for development)
function generateUUIDFromId(id: string): string {
  // Pad the ID to create a UUID-like format for development
  const paddedId = id.padStart(8, "0")
  return `${paddedId}-0000-4000-8000-000000000000`
}

export async function GET(request: NextRequest) {
  try {
    // Get user ID from headers (sent by the frontend)
    const rawUserId = request.headers.get("x-user-id")

    if (!rawUserId) {
      console.log("❌ No user ID provided")
      return NextResponse.json({ success: false, error: "User ID required" }, { status: 401 })
    }

    console.log("🔍 Raw user ID received:", rawUserId)

    // Handle different user ID formats
    let userId = rawUserId
    if (!isValidUUID(rawUserId)) {
      console.log("⚠️ User ID is not a valid UUID, attempting to handle...")

      // For development: try to find user by email or create a proper UUID
      if (rawUserId === "1" || !isNaN(Number(rawUserId))) {
        // This is likely a development scenario with simple numeric IDs
        console.log("🔧 Development mode: Converting simple ID to UUID format")
        userId = generateUUIDFromId(rawUserId)
        console.log("🔧 Generated UUID:", userId)
      } else {
        console.error("❌ Invalid user ID format:", rawUserId)
        return NextResponse.json({ success: false, error: "Invalid user ID format" }, { status: 400 })
      }
    }

    console.log("🔍 Fetching stats for user:", userId)

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
