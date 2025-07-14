import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import fs from "fs"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    console.log("🔧 Applying simple RLS fix for support_requests...")

    // Read the SQL script
    const sqlPath = path.join(process.cwd(), "scripts", "17-fix-support-rls-simple.sql")
    const sqlScript = fs.readFileSync(sqlPath, "utf8")

    // Split the script into individual statements
    const statements = sqlScript
      .split(";")
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith("--"))

    console.log(`📝 Executing ${statements.length} SQL statements...`)

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        console.log(`🔧 Executing statement ${i + 1}: ${statement.substring(0, 50)}...`)
        
        const { data, error } = await supabase.rpc("exec_sql", { sql: statement })
        
        if (error) {
          console.log(`❌ Error in statement ${i + 1}:`, error)
          // Continue with other statements
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`)
        }
      }
    }

    // Test if the fix worked by trying to insert a test record
    console.log("🧪 Testing support request insertion...")
    
    const testData = {
      id: crypto.randomUUID(),
      user_id: "276fce70-33ec-49d2-a08e-3ce33d5a975e",
      name: "Test User",
      email: "test@example.com",
      subject: "Test Subject",
      message: "Test message content",
      status: "pending",
      created_at: new Date().toISOString()
    }

    const { data: insertResult, error: insertError } = await supabase
      .from("support_requests")
      .insert(testData)

    if (insertError) {
      console.log("❌ Test insert failed:", insertError)
      return NextResponse.json({
        success: false,
        error: "RLS fix failed - test insert failed",
        details: insertError
      }, { status: 500 })
    }

    console.log("✅ Test insert successful!")

    // Clean up test record
    await supabase
      .from("support_requests")
      .delete()
      .eq("id", testData.id)

    // Get current count
    const { count } = await supabase
      .from("support_requests")
      .select("*", { count: "exact", head: true })

    console.log("🎉 Simple RLS fix applied successfully!")
    console.log(`📊 Current support requests count: ${count}`)

    return NextResponse.json({
      success: true,
      message: "Support RLS policies fixed successfully",
      currentCount: count
    })

  } catch (error) {
    console.error("❌ Error applying simple RLS fix:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to apply RLS fix",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 