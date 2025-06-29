import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    console.log("=== DEBUG USERS API START ===")

    // Get all users from the database
    const { data: users, error } = await supabase
      .from("users")
      .select("id, email, name, user_type, created_at")
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      console.error("❌ Database error:", error)
      return NextResponse.json({ 
        success: false, 
        error: `Database error: ${error.message}` 
      })
    }

    console.log("✅ Found users:", users?.length || 0)

    return NextResponse.json({
      success: true,
      users: users || [],
      count: users?.length || 0
    })

  } catch (error) {
    console.error("=== DEBUG USERS API ERROR ===")
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