import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("=== DEBUG: Checking applications table")

    // Check if applications table exists and what columns it has
    const { data: tableInfo, error: tableError } = await supabase.from("applications").select("*").limit(1)

    console.log("=== DEBUG: Table check result:", { tableInfo, tableError })

    // Try to get table schema info
    const { data: schemaInfo, error: schemaError } = await supabase.rpc("get_table_columns", {
      table_name: "applications",
    })

    console.log("=== DEBUG: Schema info:", { schemaInfo, schemaError })

    return NextResponse.json({
      success: true,
      tableExists: !tableError,
      tableError: tableError?.message,
      sampleData: tableInfo,
      schemaInfo: schemaInfo,
      schemaError: schemaError?.message,
    })
  } catch (error) {
    console.error("=== DEBUG: Error checking table:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
