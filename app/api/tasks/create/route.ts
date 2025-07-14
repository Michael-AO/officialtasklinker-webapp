import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { isVerifiedEmail } from "@/lib/utils"

// Helper function to convert simple IDs to UUID format
function convertToUUID(id: string): string {
  if (id.length === 36 && id.includes("-")) {
    return id // Already a UUID
  }
  // Convert simple ID like "1" to UUID format
  const paddedId = id.padStart(8, "0")
  return `${paddedId}-0000-4000-8000-000000000000`
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== TASK CREATION API START ===")

    const body = await request.json()
    console.log("Request body received:", JSON.stringify(body, null, 2))

    // Extract user information from request body
    const { user_data, ...taskFields } = body

    if (!user_data || !user_data.id) {
      console.error("No user data provided")
      return NextResponse.json({ success: false, error: "User authentication required" }, { status: 401 })
    }

    // Check if user email is admin (only admin emails can post tasks)
    if (!user_data.email || !isVerifiedEmail(user_data.email)) {
      console.error("User email not admin for task posting:", user_data.email)
      return NextResponse.json(
        { 
          success: false, 
          error: "Only admin accounts can post tasks. Please contact support for admin access." 
        }, 
        { status: 403 }
      )
    }

    // Convert user ID to UUID format
    const rawUserId = user_data.id
    const userId = convertToUUID(rawUserId)
    console.log(`User ID conversion: ${rawUserId} -> ${userId}`)

    // Extract and validate task fields
    const {
      title,
      description,
      category,
      budget_type,
      budget_amount,
      currency = "NGN",
      duration,
      location = "Remote",
      skills_required = [],
      questions = [],
      requirements = [],
      visibility = "public",
      urgency = "normal",
      experience_level = "intermediate",
    } = taskFields

    // Validate required fields
    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }
    if (!title || !description) {
      return NextResponse.json({ success: false, error: "Title and description are required" }, { status: 400 })
    }
    if (!category) {
      return NextResponse.json({ success: false, error: "Category is required" }, { status: 400 })
    }
    if (!budget_amount) {
      return NextResponse.json({ success: false, error: "Budget amount is required" }, { status: 400 })
    }
    if (!duration) {
      return NextResponse.json({ success: false, error: "Duration is required" }, { status: 400 })
    }

    console.log("Validation passed")

    // Ensure user exists in database
    console.log("Checking/creating user in database...")
    const { data: existingUser, error: userCheckError } = await supabase
      .from("users")
      .select("id, name, email")
      .eq("id", userId)
      .single()

    if (userCheckError && userCheckError.code === "PGRST116") {
      // User doesn't exist, create from provided data
      console.log("User doesn't exist, creating from auth data...")
      const { error: userCreateError } = await supabase.from("users").insert({
        id: userId,
        email: user_data.email,
        name: user_data.name,
        user_type: user_data.userType || "client",
        is_verified: user_data.isVerified || false,
        rating: 0,
        completed_tasks: 0,
        total_earned: 0,
        join_date: new Date().toISOString(),
        is_active: true,
        skills: user_data.skills || [],
        bio: user_data.bio || "",
        location: user_data.location || "",
        hourly_rate: user_data.hourlyRate || null,
      })

      if (userCreateError) {
        console.error("User creation failed:", userCreateError)
        return NextResponse.json(
          { success: false, error: `Failed to create user: ${userCreateError.message}` },
          { status: 500 },
        )
      }
      console.log("User created successfully")
    } else if (userCheckError) {
      console.error("User check failed:", userCheckError)
      return NextResponse.json(
        { success: false, error: `User verification failed: ${userCheckError.message}` },
        { status: 500 },
      )
    } else {
      console.log("User exists:", existingUser)
    }

    // ✅ FIXED: Removed non-existent columns (has_escrow, escrow_amount)
    const taskData = {
      client_id: userId,
      title: title.trim(),
      description: description.trim(),
      category,
      budget_type,
      budget_min: Number(budget_amount),
      budget_max: Number(budget_amount),
      currency,
      duration,
      location,
      skills_required: Array.isArray(skills_required) ? skills_required : [],
      questions: Array.isArray(questions) ? questions : [],
      requirements: Array.isArray(requirements) ? requirements : [],
      visibility,
      urgency,
      experience_level,
      status: "active", // ✅ POSTS IMMEDIATELY AS ACTIVE
      applications_count: 0,
      views_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log("Task data prepared:", JSON.stringify(taskData, null, 2))

    // Insert task
    console.log("Inserting task into database...")
    const { data: task, error: insertError } = await supabase.from("tasks").insert(taskData).select().single()

    if (insertError) {
      console.error("Task insertion failed:", insertError)
      return NextResponse.json(
        {
          success: false,
          error: `Database error: ${insertError.message}`,
          details: insertError.details,
          hint: insertError.hint,
        },
        { status: 500 },
      )
    }

    console.log("Task created successfully and is now ACTIVE:", task)
    console.log("=== TASK CREATION API SUCCESS ===")

    return NextResponse.json({
      success: true,
      task,
      message: "Task posted successfully and is now visible to freelancers!",
    })
  } catch (error) {
    console.error("=== TASK CREATION API ERROR ===")
    console.error("Unexpected error:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack")

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
