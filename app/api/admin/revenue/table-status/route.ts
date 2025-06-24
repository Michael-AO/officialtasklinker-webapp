import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("🔍 Checking admin_withdrawals table status...")

    // Test 1: Check if table exists and is accessible
    const {
      data: tableData,
      error: tableError,
      count,
    } = await supabase.from("admin_withdrawals").select("*", { count: "exact" }).limit(5)

    if (tableError) {
      return NextResponse.json({
        success: false,
        table_exists: false,
        error: tableError.message,
        code: tableError.code,
        message: "Table is not accessible or does not exist",
        suggestion: "Run scripts/40-admin-withdrawals-safe.sql to create the table",
      })
    }

    // Test 2: Try a simple insert/delete to test permissions
    const testRef = `TEST_${Date.now()}`
    let canInsert = false
    let canDelete = false

    try {
      const { data: insertData, error: insertError } = await supabase
        .from("admin_withdrawals")
        .insert({
          amount: 100,
          bank_name: "test",
          account_number: "1234567890",
          account_name: "Test",
          reference: testRef,
          status: "success",
        })
        .select()
        .single()

      if (!insertError) {
        canInsert = true
        console.log("✅ Insert test passed")

        // Try to delete the test record
        const { error: deleteError } = await supabase.from("admin_withdrawals").delete().eq("reference", testRef)

        if (!deleteError) {
          canDelete = true
          console.log("✅ Delete test passed")
        }
      }
    } catch (testError) {
      console.warn("⚠️ Permission test failed:", testError)
    }

    // Get some sample records
    const sampleRecords = tableData?.slice(0, 3) || []

    return NextResponse.json({
      success: true,
      table_exists: true,
      total_records: count || 0,
      permissions: {
        can_read: true,
        can_insert: canInsert,
        can_delete: canDelete,
      },
      sample_records: sampleRecords.map((record) => ({
        id: record.id,
        amount: record.amount,
        bank_name: record.bank_name,
        status: record.status,
        created_at: record.created_at,
        reference: record.reference,
      })),
      message: "✅ Table is accessible and working",
    })
  } catch (error: any) {
    console.error("❌ Table status check failed:", error)
    return NextResponse.json(
      {
        success: false,
        table_exists: false,
        error: error.message,
        message: "Failed to check table status",
        suggestion: "Run scripts/40-admin-withdrawals-safe.sql to set up the table",
      },
      { status: 500 },
    )
  }
}
