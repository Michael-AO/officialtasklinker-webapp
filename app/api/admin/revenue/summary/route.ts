import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data: rows, error } = await supabase
      .from("platform_ledger")
      .select("platform_fee, created_at")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Admin revenue summary error:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const total = (rows || []).reduce((sum, r) => sum + Number(r.platform_fee ?? 0), 0)
    const today = new Date().toISOString().slice(0, 10)
    const todaySum = (rows || [])
      .filter((r) => r.created_at && r.created_at.startsWith(today))
      .reduce((sum, r) => sum + Number(r.platform_fee ?? 0), 0)

    return NextResponse.json({
      success: true,
      totalPlatformFee: Math.round(total * 100) / 100,
      todayPlatformFee: Math.round(todaySum * 100) / 100,
      transactionCount: (rows || []).length,
    })
  } catch (error) {
    console.error("Admin revenue summary error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
