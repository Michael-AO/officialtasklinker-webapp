import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Helper function to convert simple IDs to UUID format
function convertToUUID(id: string): string {
  if (id.length === 36 && id.includes("-")) {
    return id // Already a UUID
  }
  // Convert simple ID like "1" to UUID format
  const paddedId = id.padStart(8, "0")
  return `${paddedId}-0000-4000-8000-000000000000`
}

export async function GET(request: NextRequest) {
  try {
    console.log("=== DEBUG USER API START ===")

    // Try to get user ID from headers first
    let userId = request.headers.get("user-id")
    
    // If no header, try query parameter
    if (!userId) {
      const { searchParams } = new URL(request.url)
      const rawUserId = searchParams.get("user_id")
      if (rawUserId) {
        userId = convertToUUID(rawUserId)
      }
    }

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: "No user ID provided",
        message: "Add user-id header or user_id query parameter to see user data",
        example: "https://www.tasklinkers.com/api/debug-user?user_id=1"
      })
    }

    console.log(`Debugging user ID: ${userId}`)

    // Get user profile
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (userError) {
      console.error("User query error:", userError)
      return NextResponse.json({ 
        success: false, 
        error: `User not found: ${userError.message}`,
        userId: userId
      })
    }

    // Get user's tasks
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("id, title, client_id, status, created_at")
      .eq("client_id", userId)
      .order("created_at", { ascending: false })

    if (tasksError) {
      console.error("Tasks query error:", tasksError)
      return NextResponse.json({ 
        success: false, 
        error: `Failed to fetch tasks: ${tasksError.message}`,
        user: user
      })
    }

    console.log(`Found ${tasks?.length || 0} tasks for user ${userId}`)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        user_type: user.user_type,
        created_at: user.created_at
      },
      tasks: tasks || [],
      taskCount: tasks?.length || 0
    })

  } catch (error) {
    console.error("=== DEBUG USER API ERROR ===")
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