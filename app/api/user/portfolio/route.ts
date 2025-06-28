import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    console.log("🔍 Fetching portfolio for user:", user.id)

    // Get portfolio items from database
    const { data: portfolio, error: portfolioError } = await supabase
      .from("portfolio_items")
      .select("*")
      .eq("user_id", user.id)
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })

    if (portfolioError) {
      console.error("❌ Portfolio fetch error:", portfolioError)
      // If table doesn't exist, return empty array
      if (portfolioError.code === "42P01") {
        return NextResponse.json({
          success: true,
          data: [],
        })
      }
      return NextResponse.json(
        { success: false, error: "Failed to fetch portfolio", details: portfolioError },
        { status: 500 },
      )
    }

    console.log("✅ Portfolio fetched successfully:", portfolio?.length || 0, "items")

    return NextResponse.json({
      success: true,
      data: portfolio || [],
    })
  } catch (error) {
    console.error("❌ Portfolio API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
