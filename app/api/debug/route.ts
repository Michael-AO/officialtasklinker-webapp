import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("Debug API: Starting environment check...")
    
    // Check environment variables
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "MISSING",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "MISSING",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "MISSING",
      NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ? "SET" : "MISSING",
      NEXT_PUBLIC_BREVO_API_KEY: process.env.NEXT_PUBLIC_BREVO_API_KEY ? "SET" : "MISSING",
    }
    
    console.log("Debug API: Environment variables:", envVars)
    
    // Test Supabase connection
    let supabaseTest = "NOT_TESTED"
    let supabaseError = null
    
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createServerClient()
        console.log("Debug API: Testing Supabase connection...")
        
        // Try a simple query
        const { data, error } = await supabase
          .from("tasks")
          .select("count", { count: "exact", head: true })
        
        if (error) {
          supabaseTest = "FAILED"
          supabaseError = error.message
          console.error("Debug API: Supabase test failed:", error)
        } else {
          supabaseTest = "SUCCESS"
          console.log("Debug API: Supabase test successful")
        }
      } catch (error) {
        supabaseTest = "FAILED"
        supabaseError = error instanceof Error ? error.message : "Unknown error"
        console.error("Debug API: Supabase connection error:", error)
      }
    } else {
      supabaseTest = "SKIPPED - Missing env vars"
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: envVars,
      supabase: {
        test: supabaseTest,
        error: supabaseError
      }
    })
  } catch (error) {
    console.error("Debug API error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 })
  }
} 