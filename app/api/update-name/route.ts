import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    console.log("=== UPDATE NAME API START ===")

    // Get the new name from request body or query parameter
    let name: string
    
    try {
      const body = await request.json()
      name = body.name
    } catch {
      // If no JSON body, try query parameter
      const { searchParams } = new URL(request.url)
      name = searchParams.get("name") || ""
    }
    
    if (!name || name.trim() === "") {
      return NextResponse.json({ 
        success: false, 
        error: "Name is required. Use ?name=YourName or send JSON body with name field" 
      }, { status: 400 })
    }

    // Update user with ID "00000001-0000-4000-8000-000000000000" (User 1)
    const userId = "00000001-0000-4000-8000-000000000000"
    
    console.log("🔍 Updating name for user:", userId, "to:", name)

    const { data: updatedUser, error } = await supabase
      .from("users")
      .update({
        name: name.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      console.error("❌ Update error:", error)
      return NextResponse.json({ 
        success: false, 
        error: `Failed to update name: ${error.message}` 
      }, { status: 500 })
    }

    console.log("✅ Name updated successfully:", updatedUser.name)

    return NextResponse.json({
      success: true,
      message: "Name updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
      }
    })

  } catch (error) {
    console.error("=== UPDATE NAME API ERROR ===")
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