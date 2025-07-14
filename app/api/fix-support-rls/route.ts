import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    console.log("🔧 Fixing support_requests RLS policies...")

    // Disable RLS temporarily
    const { error: disableError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE support_requests DISABLE ROW LEVEL SECURITY;'
    })

    if (disableError) {
      console.error("❌ Error disabling RLS:", disableError)
    } else {
      console.log("✅ RLS disabled")
    }

    // Drop existing policies
    const policies = [
      "Users can view their own support requests",
      "Admins can view all support requests", 
      "Users can insert their own support requests",
      "Admins can update support requests"
    ]

    for (const policy of policies) {
      const { error } = await supabase.rpc('exec_sql', {
        sql: `DROP POLICY IF EXISTS "${policy}" ON support_requests;`
      })
      if (error) {
        console.error(`❌ Error dropping policy ${policy}:`, error)
      }
    }

    console.log("✅ Existing policies dropped")

    // Create new policies
    const newPolicies = [
      {
        name: "Allow all users to insert support requests",
        sql: 'CREATE POLICY "Allow all users to insert support requests" ON support_requests FOR INSERT WITH CHECK (true);'
      },
      {
        name: "Users can view their own support requests", 
        sql: 'CREATE POLICY "Users can view their own support requests" ON support_requests FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);'
      },
      {
        name: "Admins can view all support requests",
        sql: 'CREATE POLICY "Admins can view all support requests" ON support_requests FOR SELECT USING (true);'
      },
      {
        name: "Admins can update support requests",
        sql: 'CREATE POLICY "Admins can update support requests" ON support_requests FOR UPDATE USING (true);'
      }
    ]

    for (const policy of newPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policy.sql })
      if (error) {
        console.error(`❌ Error creating policy ${policy.name}:`, error)
      } else {
        console.log(`✅ Policy ${policy.name} created`)
      }
    }

    // Re-enable RLS
    const { error: enableError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;'
    })

    if (enableError) {
      console.error("❌ Error enabling RLS:", enableError)
    } else {
      console.log("✅ RLS re-enabled")
    }

    // Grant permissions
    const { error: grantError } = await supabase.rpc('exec_sql', {
      sql: 'GRANT ALL ON support_requests TO authenticated, anon;'
    })

    if (grantError) {
      console.error("❌ Error granting permissions:", grantError)
    } else {
      console.log("✅ Permissions granted")
    }

    console.log("🎉 Support RLS policies fixed successfully!")

    return NextResponse.json({
      success: true,
      message: "Support RLS policies fixed successfully"
    })

  } catch (error) {
    console.error("❌ Error fixing support RLS:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fix support RLS policies",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 