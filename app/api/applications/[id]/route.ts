import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: applicationId } = await params
    const userId = request.headers.get("x-user-id")

    console.log("=== API: Fetching application details for ID:", applicationId)
    console.log("=== API: User ID:", userId)

    if (!applicationId || applicationId === "undefined" || applicationId === "null") {
      return NextResponse.json({ success: false, error: "Invalid application ID" }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: "User authentication required" }, { status: 401 })
    }

    // Get the application with task details
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select(`
        id,
        task_id,
        freelancer_id,
        proposed_budget,
        cover_letter,
        status,
        created_at,
        tasks (
          id,
          title,
          description,
          budget_min,
          budget_max,
          budget_type,
          client_id,
          users!tasks_client_id_fkey (
            id,
            name,
            email,
            avatar_url
          )
        )
      `)
      .eq("id", applicationId)
      .single()

    if (appError || !application) {
      console.log("=== API: Application not found:", appError)
      return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 })
    }

    console.log("=== API: Application found:", { id: application.id, status: application.status })

    // Check if user is the freelancer who applied or the task owner
    if (application.freelancer_id !== userId && (application.tasks as any).client_id !== userId) {
      return NextResponse.json(
        { success: false, error: "You can only view your own applications or applications for your tasks" },
        { status: 403 }
      )
    }

    // Get freelancer details
    const { data: freelancer, error: freelancerError } = await supabase
      .from("users")
      .select("id, name, email, avatar_url")
      .eq("id", application.freelancer_id)
      .single()

    if (freelancerError) {
      console.log("=== API: Error fetching freelancer:", freelancerError)
    }

    const result = {
      id: application.id,
      task_id: application.task_id,
      freelancer: freelancer || null,
      proposed_budget: application.proposed_budget,
      cover_letter: application.cover_letter,
      status: application.status,
      applied_date: application.created_at,
      task: application.tasks,
    }

    console.log("=== API: Application details returned successfully")

    return NextResponse.json({
      success: true,
      application: result,
    })
  } catch (error) {
    console.error("=== API: Application details error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: applicationId } = await params
    const userId = request.headers.get("x-user-id")

    console.log("=== API: Withdrawing application ID:", applicationId)
    console.log("=== API: User ID:", userId)

    if (!applicationId || applicationId === "undefined" || applicationId === "null") {
      return NextResponse.json({ success: false, error: "Invalid application ID" }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: "User authentication required" }, { status: 401 })
    }

    // Get the application to verify ownership
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select("id, freelancer_id, status")
      .eq("id", applicationId)
      .single()

    if (appError || !application) {
      console.log("=== API: Application not found:", appError)
      return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 })
    }

    // Check if user is the freelancer who applied
    if (application.freelancer_id !== userId) {
      return NextResponse.json(
        { success: false, error: "You can only withdraw your own applications" },
        { status: 403 }
      )
    }

    // Check if application can be withdrawn (only pending applications)
    if (application.status !== "pending") {
      return NextResponse.json(
        { success: false, error: "Only pending applications can be withdrawn" },
        { status: 400 }
      )
    }

    // Delete the application
    const { error: deleteError } = await supabase
      .from("applications")
      .delete()
      .eq("id", applicationId)

    if (deleteError) {
      console.log("=== API: Error deleting application:", deleteError)
      return NextResponse.json(
        { success: false, error: "Failed to withdraw application" },
        { status: 500 }
      )
    }

    console.log("=== API: Application withdrawn successfully")

    return NextResponse.json({
      success: true,
      message: "Application withdrawn successfully",
    })
  } catch (error) {
    console.error("=== API: Application withdrawal error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
} 