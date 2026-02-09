import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getDefaultAvatar } from "@/lib/avatar-utils"
import { ServerSessionManager } from "@/lib/server-session-manager"

export async function GET(request: NextRequest) {
  try {
    const user = await ServerSessionManager.getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "User ID required" }, { status: 401 })
    }

    const userId = user.id
    console.log("🔍 Fetching profile for user:", userId)

    // First, try to get user from users table
    const { data: dbUser, error: userError } = await supabase
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
        total_earned,
        bio,
        location,
        hourly_rate,
        skills,
        phone,
        avatar_url,
        profile_completion
      `)
      .eq("id", userId)
      .single()

    if (userError) {
      console.error("❌ User fetch error:", userError)

      // If dbUser doesn't exist, create a development profile
      if (userError.code === "PGRST116") {
        console.log("🔄 User not found in users table, creating development profile...")

        const newUserData = {
          id: userId,
          name: `User ${userId}`,
          email: `user${userId}@example.com`,
          user_type: "freelancer",
          created_at: new Date().toISOString(),
          rating: 0,
          completed_tasks: 0,
          is_verified: false,
          total_earned: 0,
          bio: null,
          location: null,
          hourly_rate: null,
          skills: [],
          phone: null,
          avatar_url: getDefaultAvatar(userId),
          profile_completion: 0,
        }

        const { data: createdUser, error: createError } = await supabase.from("users").insert(newUserData).select().single()

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

        console.log("✅ Created new development user profile:", createdUser?.name)

        // Return the new user with default values
        return NextResponse.json({
          success: true,
          data: {
            ...createdUser,
            avatar_url: createdUser?.avatar_url || null,
            bio: createdUser?.bio || null,
            location: createdUser?.location || null,
            hourly_rate: createdUser?.hourly_rate || null,
            skills: createdUser?.skills || [],
            join_date: createdUser?.created_at,
            last_active: createdUser?.created_at,
            phone: createdUser?.phone || null,
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

    if (!dbUser) {
      console.log("❌ User not found")
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 })
    }

    console.log("✅ User found:", dbUser.name)

    // Format the response data with safe defaults
    const formattedProfile = {
      id: dbUser.id,
      name: dbUser.name || "User",
      email: dbUser.email || "",
      user_type: dbUser.user_type || "freelancer",
      avatar_url: dbUser.avatar_url || null,
      bio: dbUser.bio || null,
      location: dbUser.location || null,
      hourly_rate: dbUser.hourly_rate || null,
      skills: dbUser.skills || [],
      rating: dbUser.rating || 0,
      completed_tasks: dbUser.completed_tasks || 0,
      total_earned: dbUser.total_earned || 0,
      join_date: dbUser.created_at,
      last_active: dbUser.created_at,
      is_verified: dbUser.is_verified || false,
      phone: dbUser.phone || null,
      profile_completion: dbUser.profile_completion || 0,
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
