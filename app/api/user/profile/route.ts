import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Helper function to validate UUID format
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

// Helper function to generate a UUID from a simple ID (for development)
function generateUUIDFromId(id: string): string {
  // Pad the ID to create a UUID-like format for development
  const paddedId = id.padStart(8, "0")
  return `${paddedId}-0000-4000-8000-000000000000`
}

export async function GET(request: NextRequest) {
  try {
    // Get user ID from headers (sent by the frontend)
    const rawUserId = request.headers.get("x-user-id")

    if (!rawUserId) {
      console.log("❌ No user ID provided")
      return NextResponse.json({ success: false, error: "User ID required" }, { status: 401 })
    }

    console.log("🔍 Raw user ID received:", rawUserId)

    // Handle different user ID formats
    let userId = rawUserId
    if (!isValidUUID(rawUserId)) {
      console.log("⚠️ User ID is not a valid UUID, attempting to handle...")

      // For development: try to find user by email or create a proper UUID
      if (rawUserId === "1" || !isNaN(Number(rawUserId))) {
        // This is likely a development scenario with simple numeric IDs
        console.log("🔧 Development mode: Converting simple ID to UUID format")
        userId = generateUUIDFromId(rawUserId)
        console.log("🔧 Generated UUID:", userId)
      } else {
        console.error("❌ Invalid user ID format:", rawUserId)
        return NextResponse.json({ success: false, error: "Invalid user ID format" }, { status: 400 })
      }
    }

    console.log("🔍 Fetching profile for user:", userId)

    // First, try to get user from users table
    const { data: user, error: userError } = await supabase
      .from("users")
      .select(`
        id,
        name,
        email,
        user_type,
        rating,
        completed_tasks,
        is_verified,
        created_at,
        total_earned
      `)
      .eq("id", userId)
      .single()

    if (userError) {
      console.error("❌ User fetch error:", userError)

      // If user doesn't exist, create a development profile
      if (userError.code === "PGRST116") {
        console.log("🔄 User not found in users table, creating development profile...")

        const newUserData = {
          id: userId,
          name: `User ${rawUserId}`,
          email: `user${rawUserId}@example.com`,
          user_type: "freelancer",
          created_at: new Date().toISOString(),
          rating: 0,
          completed_tasks: 0,
          is_verified: false,
          total_earned: 0,
        }

        const { data: newUser, error: createError } = await supabase.from("users").insert(newUserData).select().single()

        if (createError) {
          console.error("❌ Failed to create user:", createError)
          return NextResponse.json(
            {
              success: false,
              error: "Failed to create user profile",
              details: createError,
            },
            { status: 500 },
          )
        }

        console.log("✅ Created new development user profile:", newUser.name)

        // Return the new user with default values
        return NextResponse.json({
          success: true,
          data: {
            ...newUser,
            avatar_url: null,
            bio: null,
            location: null,
            hourly_rate: null,
            skills: [],
            join_date: newUser.created_at,
            last_active: newUser.created_at,
            phone: null,
          },
        })
      }

      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch profile",
          details: userError,
        },
        { status: 500 },
      )
    }

    if (!user) {
      console.log("❌ User not found")
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 })
    }

    console.log("✅ User found:", user.name)

    // Format the response data with safe defaults
    const formattedProfile = {
      id: user.id,
      name: user.name || "User",
      email: user.email || "",
      user_type: user.user_type || "freelancer",
      avatar_url: null, // Will be added when we implement avatar uploads
      bio: null, // Will be added when we implement bio editing
      location: null, // Will be added when we implement location
      hourly_rate: null, // Will be added when we implement rates
      skills: [], // Will be added when we implement skills
      rating: user.rating || 0,
      completed_tasks: user.completed_tasks || 0,
      total_earned: user.total_earned || 0,
      join_date: user.created_at,
      last_active: user.created_at,
      is_verified: user.is_verified || false,
      phone: null, // Will be added when we implement phone
    }

    console.log("✅ Profile formatted successfully for:", formattedProfile.name)

    return NextResponse.json({
      success: true,
      data: formattedProfile,
    })
  } catch (error) {
    console.error("❌ Profile API error:", error)
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
