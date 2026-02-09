import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { ServerSessionManager } from "@/lib/server-session-manager"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: applicationId } = await params
    const body = await request.json()
    const { progress_type } = body

    console.log("=== API: Updating progress for application ID:", applicationId)
    console.log("=== API: Progress type:", progress_type)

    // Validate required fields
    if (!applicationId || applicationId === "undefined" || applicationId === "null") {
      return NextResponse.json({ success: false, error: "Invalid application ID" }, { status: 400 })
    }

    if (!progress_type || !["first_contact", "project_kickoff", "midpoint", "completed"].includes(progress_type)) {
      return NextResponse.json({ success: false, error: "Invalid progress type" }, { status: 400 })
    }

    const user = await ServerSessionManager.getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "User authentication required" }, { status: 401 })
    }
    const userId = user.id

    // First, get the application to verify the user is the task owner
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select(`
        id,
        task_id,
        status,
        tasks!inner (
          client_id
        )
      `)
      .eq("id", applicationId)
      .single()

    if (appError || !application) {
      console.log("=== API: Application not found:", appError)
      return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 })
    }

    // Verify the user is the task owner (client)
    if ((application.tasks as any).client_id !== userId) {
      console.log("=== API: User not authorized to update this application")
      return NextResponse.json({ success: false, error: "Not authorized to update this application" }, { status: 403 })
    }

    // Verify the application is accepted
    if (application.status !== "accepted") {
      return NextResponse.json({ success: false, error: "Can only update progress for accepted applications" }, { status: 400 })
    }

    // Prepare the update data
    const updateData: any = {}
    updateData[`progress_${progress_type}`] = true

    // Update the application progress
    const { data: updatedApplication, error: updateError } = await supabase
      .from("applications")
      .update(updateData)
      .eq("id", applicationId)
      .select("*")
      .single()

    if (updateError) {
      console.log("=== API: Error updating progress:", updateError)
      return NextResponse.json({ success: false, error: "Failed to update progress" }, { status: 500 })
    }

    console.log("=== API: Progress updated successfully")

    return NextResponse.json({
      success: true,
      application: updatedApplication,
      message: `Progress marked as ${progress_type.replace("_", " ")}`,
    })
  } catch (error) {
    console.error("=== API: Progress update error:", error)
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

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: applicationId } = await params

    console.log("=== API: Getting progress for application ID:", applicationId)

    // Validate the application ID
    if (!applicationId || applicationId === "undefined" || applicationId === "null") {
      return NextResponse.json({ success: false, error: "Invalid application ID" }, { status: 400 })
    }

    const user = await ServerSessionManager.getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "User authentication required" }, { status: 401 })
    }
    const userId = user.id

    // Get the application with progress data
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select(`
        id,
        task_id,
        freelancer_id,
        status,
        progress_first_contact,
        progress_project_kickoff,
        progress_midpoint,
        progress_completed,
        progress_updated_at,
        tasks!inner (
          client_id
        )
      `)
      .eq("id", applicationId)
      .single()

    if (appError || !application) {
      console.log("=== API: Application not found:", appError)
      return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 })
    }

    // Verify the user is either the task owner (client) or the freelancer
    if ((application.tasks as any).client_id !== userId && application.freelancer_id !== userId) {
      console.log("=== API: User not authorized to view this application")
      return NextResponse.json({ success: false, error: "Not authorized to view this application" }, { status: 403 })
    }

    console.log("=== API: Progress retrieved successfully")

    return NextResponse.json({
      success: true,
      progress: {
        first_contact: application.progress_first_contact,
        project_kickoff: application.progress_project_kickoff,
        midpoint: application.progress_midpoint,
        completed: application.progress_completed,
        updated_at: application.progress_updated_at,
      },
    })
  } catch (error) {
    console.error("=== API: Progress retrieval error:", error)
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