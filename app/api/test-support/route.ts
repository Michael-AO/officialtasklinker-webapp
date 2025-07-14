import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    // Test if we can access the support_requests table
    const { data, error } = await supabase
      .from("support_requests")
      .select("id, name, email, subject, status, created_at")
      .limit(5)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ Support table access error:", error)
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details
      }, { status: 500 })
    }

    console.log("✅ Support table access successful:", data?.length || 0, "records found")

    return NextResponse.json({
      success: true,
      message: "Support table is accessible",
      count: data?.length || 0,
      data: data || []
    })
  } catch (error) {
    console.error("❌ Test support API error:", error)
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 })
  }
} 