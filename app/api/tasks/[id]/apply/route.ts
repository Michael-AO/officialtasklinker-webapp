import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { ServerSessionManager } from "@/lib/server-session-manager"

function isValidUrl(s: string): boolean {
  try {
    const u = new URL(s)
    return u.protocol === "http:" || u.protocol === "https:"
  } catch {
    return false
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: taskId } = await params
    const body = await request.json()
    const user = await ServerSessionManager.getCurrentUser()

    console.log("=== API: Application submission for task:", taskId)

    if (!taskId || taskId === "undefined" || taskId === "null") {
      return NextResponse.json({ success: false, error: "Invalid task ID" }, { status: 400 })
    }

    if (!user) {
      return NextResponse.json({ success: false, error: "User authentication required" }, { status: 401 })
    }

    const userId = user.id

    // Require freelancer role (from DB)
    const { data: dbUser, error: userError } = await supabase
      .from("users")
      .select("user_type")
      .eq("id", userId)
      .single()

    if (userError || !dbUser) {
      return NextResponse.json({ success: false, error: "Could not verify your account." }, { status: 500 })
    }
    if (dbUser.user_type !== "freelancer") {
      return NextResponse.json(
        { success: false, error: "Only freelancers can apply to tasks. Your account is not set as a freelancer." },
        { status: 403 },
      )
    }

    // Check if user has already applied to this task
    const { data: existingApplication, error: checkError } = await supabase
      .from("applications")
      .select("id")
      .eq("task_id", taskId)
      .eq("freelancer_id", userId)
      .single()

    if (existingApplication) {
      return NextResponse.json({ success: false, error: "You have already applied to this task" }, { status: 400 })
    }

    // Load task to get required screening questions
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("id, questions")
      .eq("id", taskId)
      .single()

    if (taskError || !task) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 })
    }

    const taskQuestions: string[] = Array.isArray(task.questions) ? task.questions : []
    const screeningAnswers = body.questions_answers ?? body.screening_answers ?? {}

    // Require an answer for every screening question
    for (let i = 0; i < taskQuestions.length; i++) {
      const q = taskQuestions[i]
      const answer = screeningAnswers[i] ?? screeningAnswers[String(i)] ?? screeningAnswers[q]
      if (answer == null || String(answer).trim() === "") {
        return NextResponse.json(
          { success: false, error: `Please answer all screening questions. Missing answer for question ${i + 1}.` },
          { status: 400 },
        )
        }
    }

    // Optional portfolio links → attachments (validate URLs)
    let attachments: string[] = []
    const rawAttachments = body.attachments ?? body.portfolio_links ?? []
    if (Array.isArray(rawAttachments)) {
      attachments = rawAttachments.filter((link: unknown) => {
        if (typeof link !== "string") return false
        return isValidUrl(link)
      })
    } else if (typeof rawAttachments === "string" && isValidUrl(rawAttachments)) {
      attachments = [rawAttachments]
    }

    const proposedBudget = Number(body.proposed_budget)
    if (Number.isNaN(proposedBudget) || proposedBudget < 0) {
      return NextResponse.json({ success: false, error: "Proposed budget must be a valid positive number" }, { status: 400 })
    }

    const coverLetter = body.cover_letter != null ? String(body.cover_letter).trim() : ""
    if (!coverLetter) {
      return NextResponse.json({ success: false, error: "Cover letter is required" }, { status: 400 })
    }

    const budgetType = body.budget_type === "hourly" ? "hourly" : "fixed"
    const estimatedDuration = body.estimated_duration != null && String(body.estimated_duration).trim() !== ""
      ? String(body.estimated_duration).trim()
      : "Not specified"

    // Create the application
    const { data: application, error: createError } = await supabase
      .from("applications")
      .insert({
        task_id: taskId,
        freelancer_id: userId,
        proposed_budget: proposedBudget,
        budget_type: budgetType,
        estimated_duration: estimatedDuration,
        cover_letter: coverLetter,
        attachments,
        status: "pending",
      })
      .select()
      .single()

    if (createError) {
      console.error("=== API: Application creation error:", createError)
      return NextResponse.json({ success: false, error: "Failed to submit application" }, { status: 500 })
    }

    // Persist screening question answers (application_answers table)
    if (taskQuestions.length > 0) {
      const answerRows = taskQuestions.map((question, i) => {
        const answer = screeningAnswers[i] ?? screeningAnswers[String(i)] ?? screeningAnswers[question]
        return { application_id: application.id, question, answer: String(answer).trim() }
      })
      const { error: answersError } = await supabase.from("application_answers").insert(answerRows)
      if (answersError) {
        console.error("=== API: Application answers insert error:", answersError)
        // Do not fail the request; application is already created. Log for fix.
      }
    }

    console.log("=== API: Application created successfully:", application.id)

    return NextResponse.json({ success: true, application })
  } catch (error) {
    console.error("=== API: Application submission error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
