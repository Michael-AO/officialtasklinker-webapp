import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function GET(request: NextRequest) {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase.from("user_privacy_settings").select("*").eq("user_id", user.id).single()

    if (error && error.code === "PGRST116") {
      // No record found, return defaults
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error: any) {
    console.error("Error fetching privacy settings:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
