import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Helper function to convert simple IDs to UUID format
function convertToUUID(id: string): string {
  if (id.length === 36 && id.includes("-")) {
    return id // Already a UUID
  }
  // Convert simple ID like "1" to UUID format
  const paddedId = id.padStart(8, "0")
  return `${paddedId}-0000-4000-8000-000000000000`
}

export async function PUT(request: NextRequest) {
  try {
    console.log("=== UPDATE PROFILE API START ===")

    // Get user ID from headers
    const userId = request.headers.get("user-id")
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: "User ID required" 
      }, { status: 401 })
    }

    // Convert user ID to UUID format if needed
    let formattedUserId = userId
    if (userId.length < 36) {
      formattedUserId = convertToUUID(userId)
    }

    console.log("🔍 Updating profile for user:", formattedUserId)

    // Get the update data from request body
    const updateData = await request.json()
    
    console.log("📝 Update data:", updateData)

    // Validate required fields
    if (!updateData.name || updateData.name.trim() === "") {
      return NextResponse.json({ 
        success: false, 
        error: "Name is required" 
      }, { status: 400 })
    }

    // Update the user profile
    const { data: updatedUser, error } = await supabase
      .from("users")
      .update({
        name: updateData.name.trim(),
        bio: updateData.bio || null,
        location: updateData.location || null,
        hourly_rate: updateData.hourly_rate || null,
        skills: updateData.skills || [],
        updated_at: new Date().toISOString(),
      })
      .eq("id", formattedUserId)
      .select()
      .single()

    if (error) {
      console.error("❌ Update error:", error)
      return NextResponse.json({ 
        success: false, 
        error: `Failed to update profile: ${error.message}` 
      }, { status: 500 })
    }

    console.log("✅ Profile updated successfully:", updatedUser.name)

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        bio: updatedUser.bio,
        location: updatedUser.location,
        hourly_rate: updatedUser.hourly_rate,
        skills: updatedUser.skills,
        user_type: updatedUser.user_type,
      }
    })

  } catch (error) {
    console.error("=== UPDATE PROFILE API ERROR ===")
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