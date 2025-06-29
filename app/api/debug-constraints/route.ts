import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    console.log("=== DEBUG CONSTRAINTS API START ===")

    // Query to get foreign key constraints
    const { data, error } = await supabase.rpc('get_foreign_key_constraints')

    if (error) {
      console.error("❌ RPC error:", error)
      
      // Fallback: try a simple query to see what works
      const { data: simpleData, error: simpleError } = await supabase
        .from("applications")
        .select("id, task_id, freelancer_id")
        .limit(1)

      if (simpleError) {
        return NextResponse.json({ 
          success: false, 
          error: `Database error: ${simpleError.message}`,
          simpleError
        })
      }

      return NextResponse.json({
        success: true,
        message: "Simple query works, constraint names unknown",
        simpleData
      })
    }

    return NextResponse.json({
      success: true,
      constraints: data
    })

  } catch (error) {
    console.error("=== DEBUG CONSTRAINTS API ERROR ===")
    console.error("Unexpected error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
} 