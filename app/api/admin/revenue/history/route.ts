import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("📊 Fetching withdrawal history...")

    const { data: withdrawals, error } = await supabase
      .from("admin_withdrawals")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      console.error("❌ Error fetching withdrawals:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch withdrawal history",
          error: error.message,
        },
        { status: 500 },
      )
    }

    console.log(`✅ Found ${withdrawals?.length || 0} withdrawal records`)

    return NextResponse.json({
      success: true,
      withdrawals: withdrawals || [],
      count: withdrawals?.length || 0,
    })
  } catch (error: any) {
    console.error("❌ Unexpected error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch withdrawal history",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
