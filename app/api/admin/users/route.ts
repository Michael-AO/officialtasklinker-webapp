import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    // Fetch all users
    const { data: users, error } = await supabase
      .from("users")
      .select(`
        id,
        name,
        email,
        avatar_url,
        created_at,
        updated_at
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching users:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      users: users || []
    })
  } catch (error) {
    console.error("Admin users fetch error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
} 