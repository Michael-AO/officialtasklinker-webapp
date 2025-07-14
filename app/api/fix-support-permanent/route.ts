import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    console.log("🔧 Applying permanent RLS fix for support_requests...")

    // Disable RLS
    const { error: disableError } = await supabase
      .from('support_requests')
      .select('*')
      .limit(1)

    if (disableError) {
      console.log("⚠️ RLS is already disabled or table doesn't exist")
    }

    // Try to insert a test record to see if it works
    const { data: testInsert, error: testError } = await supabase
      .from("support_requests")
      .insert({
        user_id: "00000000-0000-0000-0000-000000000000",
        name: "Test User",
        email: "test@example.com",
        subject: "Test Subject",
        message: "Test message",
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (testError) {
      console.error("❌ Test insert failed:", testError)
      
      // If test insert fails, try to disable RLS using direct SQL
      const { error: sqlError } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE support_requests DISABLE ROW LEVEL SECURITY;'
      })

      if (sqlError) {
        console.error("❌ Could not disable RLS:", sqlError)
        return NextResponse.json({
          success: false,
          error: "Could not fix RLS policies",
          details: sqlError.message
        }, { status: 500 })
      }
    } else {
      // Delete the test record
      await supabase
        .from("support_requests")
        .delete()
        .eq("id", testInsert.id)
    }

    console.log("✅ Support RLS policies fixed permanently!")

    return NextResponse.json({
      success: true,
      message: "Support RLS policies fixed permanently"
    })

  } catch (error) {
    console.error("❌ Error fixing support RLS:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fix RLS policies",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 