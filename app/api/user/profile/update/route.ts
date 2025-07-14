import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

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
      console.error("❌ No user ID provided in headers")
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
      console.error("❌ Name is required but not provided")
      return NextResponse.json({ 
        success: false, 
        error: "Name is required" 
      }, { status: 400 })
    }

    // Calculate profile completion percentage
    let completed = 0
    const total = 3 // Core profile sections (bio, skills, location)

    if (updateData.bio && updateData.bio.trim()) completed++
    if (updateData.skills && updateData.skills.length > 0) completed++
    if (updateData.location && updateData.location.trim()) completed++

    const profileCompletion = Math.round((completed / total) * 100)

    // Prepare update object
    const updateObject: any = {
      name: updateData.name.trim(),
      bio: updateData.bio || null,
      location: updateData.location || null,
      hourly_rate: updateData.hourly_rate || null,
      skills: updateData.skills || [],
      profile_completion: profileCompletion,
      updated_at: new Date().toISOString(),
    }

    // Handle avatar URL update if provided
    if (updateData.avatar_url) {
      updateObject.avatar_url = updateData.avatar_url
      console.log("🖼️ Updating avatar URL:", updateData.avatar_url)
    }

    console.log("📝 Final update object:", updateObject)

    // Create server-side client with service role key
    const supabase = createServerClient()

    // Update the user profile
    const { data: updatedUser, error } = await supabase
      .from("users")
      .update(updateObject)
      .eq("id", formattedUserId)
      .select()
      .single()

    if (error) {
      console.error("❌ Update error:", error)
      console.error("❌ Update error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
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
        avatar_url: updatedUser.avatar_url,
      }
    })

  } catch (error) {
    console.error("=== UPDATE PROFILE API ERROR ===")
    console.error("Unexpected error:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")

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