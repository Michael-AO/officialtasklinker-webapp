import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("🔍 Testing admin_withdrawals table...")

    // Test 1: Check if table exists
    const { data: tableData, error: tableError } = await supabase.from("admin_withdrawals").select("*").limit(5)

    if (tableError) {
      console.error("❌ Table error:", tableError)
      return NextResponse.json({
        success: false,
        message: "Table access failed",
        error: tableError,
        tests: {
          tableExists: false,
          canRead: false,
          canWrite: false,
        },
      })
    }

    console.log("✅ Table exists and readable")
    console.log("📊 Existing records:", tableData?.length || 0)

    // Test 2: Try to insert a test record
    const testReference = `TEST_${Date.now()}`
    const { data: insertData, error: insertError } = await supabase
      .from("admin_withdrawals")
      .insert({
        amount: 1000,
        bank_name: "test-bank",
        account_number: "1234567890",
        account_name: "Test Account",
        reference: testReference,
        paystack_reference: `sim_${testReference}`,
        status: "test",
        metadata: { test: true },
      })
      .select()
      .single()

    if (insertError) {
      console.error("❌ Insert error:", insertError)
      return NextResponse.json({
        success: false,
        message: "Insert test failed",
        error: insertError,
        tests: {
          tableExists: true,
          canRead: true,
          canWrite: false,
        },
      })
    }

    console.log("✅ Insert test successful:", insertData)

    // Test 3: Clean up test record
    await supabase.from("admin_withdrawals").delete().eq("reference", testReference)

    return NextResponse.json({
      success: true,
      message: "All tests passed!",
      tests: {
        tableExists: true,
        canRead: true,
        canWrite: true,
      },
      existingRecords: tableData?.length || 0,
      testRecord: insertData,
    })
  } catch (error: any) {
    console.error("❌ Test error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Test failed",
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
