import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    console.log("=== DEBUG APPLICATIONS API START ===")

    // Get all applications with task and user details
    const { data: applications, error } = await supabase
      .from("applications")
      .select(`
        id,
        task_id,
        freelancer_id,
        proposed_budget,
        status,
        created_at,
        task:tasks (
          id,
          title,
          client_id
        ),
        freelancer:users!applications_freelancer_id_fkey (
          id,
          name
        ),
        client:users!tasks_client_id_fkey (
          id,
          name
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ Database error:", error)
      return NextResponse.json({ 
        success: false, 
        error: `Database error: ${error.message}` 
      })
    }

    console.log("✅ Found applications:", applications?.length || 0)

    return NextResponse.json({
      success: true,
      applications: applications || [],
      count: applications?.length || 0
    })

  } catch (error) {
    console.error("=== DEBUG APPLICATIONS API ERROR ===")
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