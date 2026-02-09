import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { ServerSessionManager } from "@/lib/server-session-manager"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    console.log("=== ADMIN API: Deleting task:", id)

    // Validate the ID format
    if (!id || id === "undefined" || id === "null") {
      console.log("=== ADMIN API: Invalid task ID:", id)
      return NextResponse.json({ success: false, error: "Invalid task ID" }, { status: 400 })
    }

    const adminUser = await ServerSessionManager.getCurrentUser()
    if (!adminUser || !(await ServerSessionManager.isAdmin())) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Start a transaction to delete all related data
    const { error: deleteError } = await supabase.rpc("delete_task_cascade", {
      task_id: id,
    })

    if (deleteError) {
      console.error("=== ADMIN API: Error deleting task:", deleteError)

      // If the function doesn't exist, do manual deletion
      if (deleteError.code === "42883") {
        console.log("=== ADMIN API: Function doesn't exist, doing manual deletion")

        // Delete in order: escrow_milestones -> escrow_transactions -> escrow_accounts -> applications -> tasks
        await supabase.from("escrow_milestones").delete().eq("escrow_account_id", id)
        await supabase.from("escrow_transactions").delete().eq("escrow_account_id", id)
        await supabase.from("escrow_accounts").delete().eq("task_id", id)
        await supabase.from("applications").delete().eq("task_id", id)

        const { error: taskDeleteError } = await supabase.from("tasks").delete().eq("id", id)

        if (taskDeleteError) {
          console.error("=== ADMIN API: Error deleting task:", taskDeleteError)
          return NextResponse.json(
            { success: false, error: "Failed to delete task", details: taskDeleteError.message },
            { status: 500 },
          )
        }
      } else {
        return NextResponse.json(
          { success: false, error: "Failed to delete task", details: deleteError.message },
          { status: 500 },
        )
      }
    }

    console.log("=== ADMIN API: Task deleted successfully:", id)

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully",
    })
  } catch (error) {
    console.error("=== ADMIN API: Task deletion error:", error)
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

// Optional: Add a GET method to fetch single task details for admin
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const { data: task, error } = await supabase
      .from("tasks")
      .select(`
        *,
        profiles:client_id (
          id,
          full_name,
          email
        ),
        applications (
          count
        ),
        escrow_accounts (
          id,
          amount,
          status,
          payment_reference
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, task })
  } catch (error) {
    console.error("=== ADMIN API: Task fetch error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
