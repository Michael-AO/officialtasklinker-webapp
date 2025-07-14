import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    // Fetch all applications
    const { data: applications, error } = await supabase
      .from("applications")
      .select(`
        id,
        task_id,
        freelancer_id,
        proposed_budget,
        cover_letter,
        status,
        created_at,
        updated_at
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching applications:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch applications" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      applications: applications || []
    })
  } catch (error) {
    console.error("Admin applications fetch error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
} 