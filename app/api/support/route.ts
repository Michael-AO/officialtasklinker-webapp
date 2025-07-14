import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json()

    console.log("🔍 Support request received:", {
      name,
      email,
      subject,
      message: message?.substring(0, 100) + "..."
    })

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Insert support request into database without user_id (anonymous support)
    const { data, error } = await supabase
      .from("support_requests")
      .insert({
        name,
        email,
        subject,
        message,
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error("❌ Database error:", error)
      return NextResponse.json(
        { success: false, error: "Failed to create support request" },
        { status: 500 }
      )
    }

    console.log("✅ Support request created successfully:", data)

    return NextResponse.json({
      success: true,
      message: "Support request submitted successfully",
      data
    })
  } catch (error) {
    console.error("❌ Support request error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
} 