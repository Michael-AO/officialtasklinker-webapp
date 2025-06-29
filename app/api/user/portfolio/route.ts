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

export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    console.log("🔍 Creating portfolio item for user:", user.id)

    // Get the portfolio data from request body
    const portfolioData = await request.json()

    // Validate required fields
    if (!portfolioData.title || !portfolioData.description) {
      return NextResponse.json({ 
        success: false, 
        error: "Title and description are required" 
      }, { status: 400 })
    }

    // Create portfolio item
    const { data: newItem, error: createError } = await supabase
      .from("portfolio_items")
      .insert({
        user_id: user.id,
        title: portfolioData.title,
        description: portfolioData.description,
        image_url: portfolioData.image || null,
        project_url: portfolioData.url || null,
        file_url: portfolioData.file_url || null,
        file_type: portfolioData.file_type || null,
        file_name: portfolioData.file_name || null,
        file_size: portfolioData.file_size || null,
        is_featured: portfolioData.is_featured || false,
      })
      .select()
      .single()

    if (createError) {
      console.error("❌ Portfolio creation error:", createError)
      return NextResponse.json(
        { success: false, error: "Failed to create portfolio item", details: createError },
        { status: 500 },
      )
    }

    console.log("✅ Portfolio item created successfully:", newItem.id)

    return NextResponse.json({
      success: true,
      message: "Portfolio item created successfully",
      data: newItem,
    })
  } catch (error) {
    console.error("❌ Portfolio API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
