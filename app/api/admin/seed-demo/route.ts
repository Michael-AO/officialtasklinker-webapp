import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { ServerSessionManager } from "@/lib/server-session-manager"

const LAUNCH_SMOKE_TEST_TITLE = "Launch smoke test – 2 milestones"

const DEMO_TASKS = [
  { title: "Landing page design", description: "Need a modern landing page for our SaaS product.", category: "Web Development", budget: 150000 },
  { title: "Mobile app UI", description: "Design screens for a fitness tracking app.", category: "Design", budget: 200000 },
  { title: "Blog content series", description: "10 SEO-optimized articles about remote work.", category: "Writing", budget: 80000 },
  { title: "Data pipeline setup", description: "ETL pipeline with Python and PostgreSQL.", category: "Data Science", budget: 250000 },
  { title: "Social media graphics", description: "Monthly social media asset pack.", category: "Marketing", budget: 60000 },
]

export async function POST() {
  try {
    const isAdmin = await ServerSessionManager.isAdmin()
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 })
    }

    const { data: clients } = await supabase
      .from("users")
      .select("id")
      .eq("user_type", "client")
      .limit(1)
    const { data: freelancers } = await supabase
      .from("users")
      .select("id")
      .eq("user_type", "freelancer")
      .limit(1)

    const clientId = clients?.[0]?.id
    const freelancerId = freelancers?.[0]?.id

    if (!clientId) {
      return NextResponse.json(
        { error: "No client user found. Create a client account first." },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()
    const taskInserts = DEMO_TASKS.map((t) => ({
      client_id: clientId,
      title: t.title,
      description: t.description,
      category: t.category,
      budget_type: "fixed" as const,
      budget_min: t.budget,
      budget_max: t.budget,
      currency: "NGN",
      duration: "2-4 weeks",
      location: "Remote",
      experience_level: "intermediate",
      urgency: "normal",
      status: "active" as const,
      visibility: "public" as const,
      skills_required: [],
      questions: [],
      requirements: [],
      applications_count: 0,
      views_count: 0,
      created_at: now,
      updated_at: now,
    }))

    const { data: insertedTasks, error: tasksError } = await supabase
      .from("tasks")
      .insert(taskInserts)
      .select("id")

    if (tasksError) {
      console.error("Seed tasks error:", tasksError)
      return NextResponse.json({ error: "Failed to create tasks", details: tasksError.message }, { status: 500 })
    }

    const taskIds = (insertedTasks || []).map((t) => t.id)
    const releasedCount = Math.min(3, taskIds.length)
    const escrowInserts = taskIds.slice(0, releasedCount).map((task_id, i) => ({
      task_id,
      client_id: clientId,
      freelancer_id: freelancerId || null,
      amount: DEMO_TASKS[i].budget,
      currency: "NGN",
      status: "released" as const,
      payment_reference: `TL_DEMO_${Date.now()}_${i}`,
      created_at: now,
      updated_at: now,
    }))

    if (escrowInserts.length > 0) {
      const { error: escrowError } = await supabase.from("escrow_accounts").insert(escrowInserts)
      if (escrowError) {
        console.error("Seed escrows error:", escrowError)
      }
    }

    // Launch checklist smoke test: one task with 2 milestones + accepted application + optional escrow (idempotent)
    let launchTaskId: string | null = null
    let milestonesCreated = 0
    let applicationId: string | null = null
    let escrowCreated = false

    const { data: existingLaunch } = await supabase
      .from("tasks")
      .select("id")
      .eq("title", LAUNCH_SMOKE_TEST_TITLE)
      .limit(1)
      .maybeSingle()

    if (!existingLaunch?.id && freelancerId) {
      const launchTask = {
        client_id: clientId,
        title: LAUNCH_SMOKE_TEST_TITLE,
        description: "Use this task to run the Launch Readiness Checklist: Fund Milestone (Paystack Test), Release, and Raise Dispute.",
        category: "General",
        budget_type: "fixed" as const,
        budget_min: 10000,
        budget_max: 10000,
        currency: "NGN",
        duration: "2-4 weeks",
        location: "Remote",
        experience_level: "intermediate",
        urgency: "normal",
        status: "assigned" as const,
        visibility: "public" as const,
        skills_required: [],
        questions: [],
        requirements: [],
        applications_count: 1,
        views_count: 0,
        created_at: now,
        updated_at: now,
      }
      const { data: insertedLaunch, error: launchTaskError } = await supabase
        .from("tasks")
        .insert(launchTask)
        .select("id")
        .single()

      if (!launchTaskError && insertedLaunch?.id) {
        launchTaskId = insertedLaunch.id
        const { error: milestonesError } = await supabase.from("task_milestones").insert([
          { task_id: launchTaskId, title: "Milestone 1", description: "First deliverable", amount: 5000, status: "PENDING", created_at: now, updated_at: now },
          { task_id: launchTaskId, title: "Milestone 2", description: "Second deliverable", amount: 5000, status: "PENDING", created_at: now, updated_at: now },
        ])
        if (!milestonesError) milestonesCreated = 2

        const { data: insertedApp, error: appError } = await supabase
          .from("applications")
          .insert({
            task_id: launchTaskId,
            freelancer_id: freelancerId,
            proposed_budget: 10000,
            budget_type: "fixed",
            estimated_duration: "2-4 weeks",
            cover_letter: "Seed application for launch checklist smoke test.",
            attachments: [],
            status: "accepted",
            created_at: now,
            updated_at: now,
          })
          .select("id")
          .single()
        if (!appError && insertedApp?.id) applicationId = insertedApp.id

        const { error: escrowLaunchError } = await supabase.from("escrow_accounts").insert({
          task_id: launchTaskId,
          client_id: clientId,
          freelancer_id: freelancerId,
          amount: 10000,
          currency: "NGN",
          status: "funded",
          payment_reference: `TL_SEED_${Date.now()}`,
          created_at: now,
          updated_at: now,
        })
        if (!escrowLaunchError) escrowCreated = true
      }
    } else if (existingLaunch?.id) {
      launchTaskId = existingLaunch.id
    }

    return NextResponse.json({
      success: true,
      message: "Demo data seeded",
      tasksCreated: taskIds.length,
      paidTransactionsCreated: escrowInserts.length,
      launchTaskId: launchTaskId ?? undefined,
      milestonesCreated: launchTaskId ? milestonesCreated : undefined,
      applicationId: applicationId ?? undefined,
      escrowCreated: escrowCreated || undefined,
    })
  } catch (error) {
    console.error("Seed demo error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
