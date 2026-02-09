import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { ServerSessionManager } from "@/lib/server-session-manager"

export async function POST(request: NextRequest) {
  try {
    console.log("=== TASK CREATION API START ===")

    const user = await ServerSessionManager.getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "User authentication required" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Request body received:", JSON.stringify(body, null, 2))

    // Extract task fields (no longer trust user_data from body)
    const { user_data, ...taskFields } = body
    const userId = user.id

    // Extract and validate task fields
    const {
      title,
      description,
      category,
      budget_type,
      budget_amount,
      budget_min,
      budget_max,
      total_budget,
      currency,
      duration,
      location = "Remote",
      skills_required = [],
      questions = [],
      requirements = [],
      visibility = "public",
      urgency = "normal",
      experience_level = "intermediate",
      milestones: milestonesInput = [],
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
    // Budget: support single amount or min/max range
    const hasRange = budget_min != null && budget_max != null
    const hasSingle = budget_amount != null && budget_amount !== ""
    if (!hasRange && !hasSingle) {
      return NextResponse.json({ success: false, error: "Budget amount or budget range (min and max) is required" }, { status: 400 })
    }
    let budgetMinVal: number
    let budgetMaxVal: number
    if (hasRange) {
      budgetMinVal = Number(budget_min)
      budgetMaxVal = Number(budget_max)
      if (Number.isNaN(budgetMinVal) || Number.isNaN(budgetMaxVal)) {
        return NextResponse.json({ success: false, error: "Budget min and max must be valid numbers" }, { status: 400 })
      }
      if (budgetMinVal > budgetMaxVal) {
        return NextResponse.json({ success: false, error: "Budget min must be less than or equal to budget max" }, { status: 400 })
      }
    } else {
      const amt = Number(budget_amount)
      if (Number.isNaN(amt) || amt < 0) {
        return NextResponse.json({ success: false, error: "Budget amount must be a valid positive number" }, { status: 400 })
      }
      budgetMinVal = amt
      budgetMaxVal = amt
    }
    if (!duration) {
      return NextResponse.json({ success: false, error: "Duration is required" }, { status: 400 })
    }

    // Milestones (optional): validate sum equals total budget
    const milestones = Array.isArray(milestonesInput) ? milestonesInput : []
    if (milestones.length > 0) {
      const totalBudgetForMilestones = total_budget != null ? Number(total_budget) : budgetMaxVal
      if (Number.isNaN(totalBudgetForMilestones) || totalBudgetForMilestones < 0) {
        return NextResponse.json(
          { success: false, error: "Total budget is required and must be a valid number when using milestones" },
          { status: 400 },
        )
      }
      const sum = milestones.reduce(
        (acc: number, m: { amount?: number }) => acc + (Number(m?.amount) || 0),
        0,
      )
      const tolerance = 0.01
      if (Math.abs(sum - totalBudgetForMilestones) > tolerance) {
        return NextResponse.json(
          {
            success: false,
            error: `Milestone amounts (${sum}) must equal total budget (${totalBudgetForMilestones})`,
          },
          { status: 400 },
        )
      }
    }

    console.log("Validation passed")

    // Ensure user exists in database and fetch user_type / is_verified for posting rule
    console.log("Checking/creating user in database...")
    const { data: existingUser, error: userCheckError } = await supabase
      .from("users")
      .select("id, name, email, user_type, is_verified")
      .eq("id", userId)
      .single()

    if (userCheckError && userCheckError.code === "PGRST116") {
      // User doesn't exist, create from session data
      console.log("User doesn't exist, creating from session data...")
      const { error: userCreateError } = await supabase.from("users").insert({
        id: userId,
        email: user.email,
        name: user.name || user.email,
        user_type: user.user_type || "client",
        is_verified: user.is_verified || false,
        rating: 0,
        completed_tasks: 0,
        total_earned: 0,
        join_date: new Date().toISOString(),
        is_active: true,
        skills: [],
        bio: "",
        location: "",
        hourly_rate: null,
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

    // Only verified clients can post tasks (resolve from DB for consistency)
    const { data: dbUser, error: dbUserError } = await supabase
      .from("users")
      .select("user_type, is_verified")
      .eq("id", userId)
      .single()
    if (dbUserError || !dbUser) {
      return NextResponse.json(
        { success: false, error: "Could not verify your account. Please try again." },
        { status: 500 },
      )
    }
    if (dbUser.user_type !== "client") {
      return NextResponse.json(
        { success: false, error: "Only clients can post tasks. Your account is not set as a client." },
        { status: 403 },
      )
    }

    // ✅ FIXED: Removed non-existent columns (has_escrow, escrow_amount)
    const taskData = {
      client_id: userId,
      title: title.trim(),
      description: description.trim(),
      category,
      budget_type: budget_type || "fixed",
      budget_min: budgetMinVal,
      budget_max: budgetMaxVal,
      currency: "NGN",
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

    // Insert task_milestones if provided
    if (milestones.length > 0 && task?.id) {
      const now = new Date().toISOString()
      const milestoneRows = milestones.map((m: { title?: string; description?: string; amount?: number; due_date?: string }) => ({
        task_id: task.id,
        title: String(m?.title ?? "Milestone").trim() || "Milestone",
        description: m?.description != null ? String(m.description).trim() : null,
        amount: Number(m?.amount) || 0,
        status: "PENDING",
        due_date: m?.due_date || null,
        created_at: now,
        updated_at: now,
      }))
      const { error: milestonesError } = await supabase.from("task_milestones").insert(milestoneRows)
      if (milestonesError) {
        console.error("Task milestones insertion failed:", milestonesError)
        return NextResponse.json(
          {
            success: false,
            error: `Task created but milestones failed: ${milestonesError.message}`,
          },
          { status: 500 },
        )
      }
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
