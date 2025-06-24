import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

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

    console.log("🔍 Fetching reviews for user:", user.id)

    // Get reviews from database
    const { data: reviews, error: reviewsError } = await supabase
      .from("user_reviews")
      .select(`
        *,
        reviewer:users!reviewer_id(name, avatar_url)
      `)
      .eq("reviewee_id", user.id)
      .order("created_at", { ascending: false })

    if (reviewsError) {
      console.error("❌ Reviews fetch error:", reviewsError)
      // If table doesn't exist, return empty array
      if (reviewsError.code === "42P01") {
        return NextResponse.json({
          success: true,
          data: [],
        })
      }
      return NextResponse.json(
        { success: false, error: "Failed to fetch reviews", details: reviewsError },
        { status: 500 },
      )
    }

    console.log("✅ Reviews fetched successfully:", reviews?.length || 0, "reviews")

    return NextResponse.json({
      success: true,
      data: reviews || [],
    })
  } catch (error) {
    console.error("❌ Reviews API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
