import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Helper function to convert simple IDs to UUID format
function convertToUUID(id: string): string {
  // Remove any non-numeric characters
  const cleanId = id.replace(/\D/g, '')
  
  if (!cleanId) {
    throw new Error("Invalid user ID - must contain numbers")
  }
  
  if (id.length === 36 && id.includes("-")) {
    return id // Already a UUID
  }
  
  // Convert simple ID like "1" to UUID format
  const paddedId = cleanId.padStart(8, "0")
  return `${paddedId}-0000-4000-8000-000000000000`
}

export async function GET(request: NextRequest) {
  try {
    console.log("=== DEBUG USER API START ===")

    // Get user ID from headers
    const userId = request.headers.get("user-id")
    const authHeader = request.headers.get("authorization")

    console.log("🔍 User ID from headers:", userId)
    console.log("🔍 Authorization header:", authHeader)

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: "No user ID provided in headers" 
      }, { status: 400 })
    }

    // Get user profile
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single()

    if (userError) {
      console.error("❌ User fetch error:", userError)
      return NextResponse.json({ 
        success: false, 
        error: `User not found: ${userError.message}` 
      }, { status: 404 })
    }

    console.log("✅ User found:", user)

    // Get tasks created by this user
    const { data: userTasks, error: tasksError } = await supabase
      .from("tasks")
      .select("*")
      .eq("client_id", userId)

    if (tasksError) {
      console.error("❌ Tasks fetch error:", tasksError)
    } else {
      console.log(`✅ Found ${userTasks?.length || 0} tasks created by user`)
      if (userTasks && userTasks.length > 0) {
        console.log("📋 User's tasks:", userTasks.map(t => ({ id: t.id, title: t.title, status: t.status })))
      }
    }

    // Get ALL tasks in database (for debugging)
    const { data: allTasks, error: allTasksError } = await supabase
      .from("tasks")
      .select("id, title, client_id, status, created_at")

    if (allTasksError) {
      console.error("❌ All tasks fetch error:", allTasksError)
    } else {
      console.log(`📊 Total tasks in database: ${allTasks?.length || 0}`)
      if (allTasks && allTasks.length > 0) {
        console.log("📋 All tasks in database:", allTasks.map(t => ({ 
          id: t.id, 
          title: t.title, 
          client_id: t.client_id, 
          status: t.status 
        })))
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        user_type: user.user_type,
        is_verified: user.is_verified
      },
      userTasks: userTasks || [],
      totalTasksInDatabase: allTasks?.length || 0,
      allTasks: allTasks || []
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