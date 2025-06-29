import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    console.log("=== DEBUG TRIGGERS API START ===")

    // Check if triggers exist
    const { data: triggers, error: triggersError } = await supabase
      .from('information_schema.triggers')
      .select('trigger_name, event_manipulation, action_statement')
      .eq('trigger_schema', 'public')
      .like('trigger_name', '%app_count%')

    if (triggersError) {
      console.error("❌ Error checking triggers:", triggersError)
    } else {
      console.log("📋 Database triggers found:", triggers)
    }

    // Check current applications count for a sample task
    const { data: sampleTask, error: taskError } = await supabase
      .from("tasks")
      .select("id, title, applications_count")
      .limit(1)
      .single()

    if (taskError) {
      console.error("❌ Error fetching sample task:", taskError)
    } else {
      console.log("📊 Sample task:", sampleTask)
    }

    // Count actual applications for the sample task
    if (sampleTask) {
      const { count: actualCount, error: countError } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("task_id", sampleTask.id)

      if (countError) {
        console.error("❌ Error counting applications:", countError)
      } else {
        console.log("🔢 Actual applications count:", actualCount)
        console.log("📊 Stored applications_count:", sampleTask.applications_count)
        console.log("✅ Counts match:", actualCount === sampleTask.applications_count)
      }
    }

    return NextResponse.json({
      success: true,
      triggers: triggers || [],
      sampleTask: sampleTask || null,
      actualApplicationsCount: sampleTask ? await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("task_id", sampleTask.id)
        .then(result => result.count) : null,
      message: "Check console for detailed trigger information"
    })

  } catch (error) {
    console.error("=== DEBUG TRIGGERS API ERROR ===")
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