import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Get total pending revenue from escrow fees
    const { data, error } = await supabase.from("company_revenue").select("amount").eq("status", "pending")

    if (error) {
      console.error("Error fetching pending revenue:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const totalAmount = data?.reduce((sum, record) => sum + (record.amount || 0), 0) || 0

    return NextResponse.json({
      success: true,
      amount: totalAmount,
      count: data?.length || 0,
    })
  } catch (error) {
    console.error("Error in pending revenue API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
