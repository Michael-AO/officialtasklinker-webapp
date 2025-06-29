import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    console.log("Debug User API: Starting...")
    
    // Get user ID from headers
    const userId = request.headers.get("user-id")
    const authHeader = request.headers.get("authorization")
    
    console.log("Debug User API: User ID from headers:", userId)
    console.log("Debug User API: Auth header present:", !!authHeader)
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: "No user ID provided",
        message: "Add user-id header to see user data"
      })
    }
    
    // Get user profile
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single()
    
    if (userError) {
      console.error("Debug User API: User not found:", userError)
      return NextResponse.json({
        success: false,
        error: "User not found in database",
        userId: userId
      })
    }
    
    // Get user's tasks
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("id, title, client_id, status")
      .eq("client_id", userId)
    
    if (tasksError) {
      console.error("Debug User API: Error fetching tasks:", tasksError)
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        user_type: user.user_type
      },
      tasks: tasks || [],
      taskCount: tasks?.length || 0
    })
    
  } catch (error) {
    console.error("Debug User API error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 })
  }
} 