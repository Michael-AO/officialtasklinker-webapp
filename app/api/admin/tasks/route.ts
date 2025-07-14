import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    // Fetch all tasks
    const { data: tasks, error } = await supabase
      .from("tasks")
      .select(`
        id,
        title,
        description,
        budget,
        status,
        client_id,
        created_at,
        updated_at
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching tasks:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch tasks" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      tasks: tasks || []
    })
  } catch (error) {
    console.error("Admin tasks fetch error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
} 