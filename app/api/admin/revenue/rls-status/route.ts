import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
)

export async function GET() {
  try {
    console.log("🔍 Checking RLS status for admin_withdrawals table...")

    // Check if service role key is available
    const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY
    console.log("🔑 Service role key available:", hasServiceRole)

    // Test 1: Check RLS status
    const { data: rlsData, error: rlsError } = await supabaseAdmin.rpc("check_rls_status", {
      table_name: "admin_withdrawals",
    })

    let rlsStatus = "unknown"
    if (!rlsError && rlsData !== null) {
      rlsStatus = rlsData ? "enabled" : "disabled"
    }

    // Test 2: Try to access the table
    const {
      data: tableData,
      error: tableError,
      count,
    } = await supabaseAdmin.from("admin_withdrawals").select("*", { count: "exact" }).limit(3)

    // Test 3: Try to insert a test record
    const testRef = `RLS_TEST_${Date.now()}`
    const insertTest = { success: false, error: null }

    try {
      const { data: insertData, error: insertError } = await supabaseAdmin
        .from("admin_withdrawals")
        .insert({
          amount: 100,
          bank_name: "test-bank",
          account_number: "1234567890",
          account_name: "RLS Test",
          reference: testRef,
          status: "success",
          metadata: { test: true, rls_check: true },
        })
        .select()
        .single()

      if (!insertError) {
        insertTest.success = true
        // Clean up test record
        await supabaseAdmin.from("admin_withdrawals").delete().eq("reference", testRef)
      } else {
        insertTest.error = insertError.message
      }
    } catch (testError: any) {
      insertTest.error = testError.message
    }

    return NextResponse.json({
      success: !tableError,
      rls_status: rlsStatus,
      table_accessible: !tableError,
      total_records: count || 0,
      service_role_available: hasServiceRole,
      tests: {
        table_read: {
          success: !tableError,
          error: tableError?.message || null,
        },
        record_insert: insertTest,
      },
      sample_records:
        tableData?.map((record) => ({
          id: record.id,
          amount: record.amount,
          status: record.status,
          created_at: record.created_at,
        })) || [],
      recommendations: getRLSRecommendations(rlsStatus, !tableError, insertTest.success, hasServiceRole),
    })
  } catch (error: any) {
    console.error("❌ RLS status check failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: "Failed to check RLS status",
        suggestion: "Run scripts/41-admin-withdrawals-rls-fix.sql to fix database issues",
      },
      { status: 500 },
    )
  }
}

function getRLSRecommendations(
  rlsStatus: string,
  canRead: boolean,
  canInsert: boolean,
  hasServiceRole: boolean,
): string[] {
  const recommendations: string[] = []

  if (!hasServiceRole) {
    recommendations.push("⚠️ Add SUPABASE_SERVICE_ROLE_KEY to environment variables for admin operations")
  }

  if (rlsStatus === "enabled" && !canInsert) {
    recommendations.push("🔧 Run scripts/41-admin-withdrawals-rls-fix.sql to disable RLS on admin_withdrawals table")
  }

  if (!canRead) {
    recommendations.push("🔧 Table access issues - run the database setup script")
  }

  if (canRead && canInsert) {
    recommendations.push("✅ Everything looks good! Withdrawal system should work properly")
  }

  return recommendations
}
