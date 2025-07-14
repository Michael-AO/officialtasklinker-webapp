import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: applicationId } = params
    const userId = request.headers.get("x-user-id")

    console.log("=== API: Withdrawing application ID:", applicationId)
    console.log("=== API: User ID:", userId)

    if (!userId) {
      return NextResponse.json({ success: false, error: "User authentication required" }, { status: 401 })
    }

    if (!applicationId || applicationId === "undefined" || applicationId === "null") {
      return NextResponse.json({ success: false, error: "Invalid application ID" }, { status: 400 })
    }

    // First, verify the application exists and belongs to the user
    const { data: application, error: fetchError } = await supabase
      .from("applications")
      .select("id, freelancer_id, status")
      .eq("id", applicationId)
      .single()

    if (fetchError || !application) {
      console.log("=== API: Application not found:", fetchError)
      return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 })
    }

    // Verify the user owns this application
    if (application.freelancer_id !== userId) {
      console.log("=== API: User not authorized to withdraw this application")
      return NextResponse.json({ success: false, error: "Not authorized to withdraw this application" }, { status: 403 })
    }

    // Check if application can be withdrawn (only pending applications)
    if (application.status !== "pending") {
      console.log("=== API: Application cannot be withdrawn, status:", application.status)
      return NextResponse.json({ 
        success: false, 
        error: "Application cannot be withdrawn. Only pending applications can be withdrawn." 
      }, { status: 400 })
    }

    // Update the application status to withdrawn
    const { data: updatedApplication, error: updateError } = await supabase
      .from("applications")
      .update({ 
        status: "withdrawn",
        updated_at: new Date().toISOString()
      })
      .eq("id", applicationId)
      .select()
      .single()

    if (updateError) {
      console.log("=== API: Failed to withdraw application:", updateError)
      return NextResponse.json({ success: false, error: "Failed to withdraw application" }, { status: 500 })
    }

    console.log("=== API: Application withdrawn successfully:", updatedApplication.id)

    return NextResponse.json({
      success: true,
      message: "Application withdrawn successfully",
      application: updatedApplication,
    })
  } catch (error) {
    console.error("=== API: Application withdrawal error:", error)
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