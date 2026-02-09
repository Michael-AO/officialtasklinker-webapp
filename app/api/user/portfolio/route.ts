import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { ServerSessionManager } from "@/lib/server-session-manager"

export async function GET(request: NextRequest) {
  try {
    const user = await ServerSessionManager.getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "User authentication required" }, { status: 401 })
    }

    const userId = user.id
    console.log("🔍 Fetching portfolio for user:", userId)

    // Get portfolio items from database using service role (bypass RLS)
    const { data: portfolio, error: portfolioError } = await supabase
      .from("portfolio_items")
      .select("*")
      .eq("user_id", userId)
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })

    console.log("📊 Portfolio query result:", { 
      count: portfolio?.length || 0, 
      error: portfolioError?.message || null,
      items: portfolio?.map(item => ({ id: item.id, title: item.title })) || []
    })

    if (portfolioError) {
      console.error("❌ Portfolio fetch error:", portfolioError)
      // If table doesn't exist, return empty array
      if (portfolioError.code === "42P01" || portfolioError.message.includes("Could not find")) {
        return NextResponse.json({
          success: true,
          data: [],
          message: "Portfolio table not found. Please run the portfolio table creation script."
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
    const user = await ServerSessionManager.getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "User authentication required" }, { status: 401 })
    }

    const userId = user.id
    console.log("🔍 Creating portfolio item for user:", userId)

    // Get the portfolio data from request body
    const portfolioData = await request.json()
    
    console.log("📝 Portfolio data received:", portfolioData)

    // Validate required fields
    if (!portfolioData.title || !portfolioData.description) {
      console.error("❌ Missing required fields:", { title: !!portfolioData.title, description: !!portfolioData.description })
      return NextResponse.json({ 
        success: false, 
        error: "Title and description are required" 
      }, { status: 400 })
    }

    // Create portfolio item using service role (bypass RLS)
    const { data: newItem, error: createError } = await supabase
      .from("portfolio_items")
      .insert({
        user_id: userId,
        title: portfolioData.title,
        description: portfolioData.description,
        image_url: portfolioData.image_url || null,
        project_url: portfolioData.project_url || null,
        file_url: portfolioData.file_url || null,
        file_type: portfolioData.file_type || null,
        file_name: portfolioData.file_name || null,
        file_size: portfolioData.file_size || null,
        is_featured: false,
      })
      .select()
      .single()

    if (createError) {
      console.error("❌ Portfolio creation error:", createError)
      console.error("❌ Portfolio creation error details:", {
        message: createError.message,
        code: createError.code,
        details: createError.details,
        hint: createError.hint
      })
      
      // Check if the error is due to missing table
      if (createError.code === "PGRST204" || createError.message.includes("Could not find")) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Portfolio table not found. Please run the portfolio table creation script in your Supabase SQL Editor.",
            details: "The portfolio_items table needs to be created. Run the create-portfolio-table.sql script in your Supabase dashboard."
          },
          { status: 500 },
        )
      }
      
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
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
