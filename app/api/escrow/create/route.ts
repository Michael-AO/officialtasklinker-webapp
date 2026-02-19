import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { paystackService } from "@/lib/paystack"
import { ServerSessionManager } from "@/lib/server-session-manager"

export async function POST(request: NextRequest) {
  try {
    const user = await ServerSessionManager.getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { reference, taskId, freelancerId, amount, paymentType, milestones } = body

    if (!taskId) {
      return NextResponse.json({ success: false, error: "taskId is required" }, { status: 400 })
    }
    if (!reference) {
      return NextResponse.json({ success: false, error: "reference is required" }, { status: 400 })
    }

    const { data: task, error: taskError } = await supabase.from("tasks").select("client_id").eq("id", taskId).single()
    if (taskError || !task) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 })
    }
    if (task.client_id !== user.id) {
      return NextResponse.json({ success: false, error: "Only the task client can create escrow for this task" }, { status: 403 })
    }

    console.log("🔄 Starting escrow creation with data:", {
      reference,
      taskId,
      freelancerId,
      amount,
      paymentType,
      milestonesCount: milestones?.length || 0,
    })

    // Verify payment with Paystack (only if not a test reference) and get amount if not provided
    let verifiedAmountNaira: number | null = null
    if (!reference.startsWith("TEST_")) {
      console.log("💳 Verifying payment with Paystack...")
      try {
        const verification = await paystackService.verifyTransaction(reference)

        if (!verification.status || verification.data.status !== "success") {
          console.error("❌ Payment verification failed:", verification)
          return NextResponse.json(
            {
              success: false,
              error: "Payment verification failed",
              details: verification.message || "Payment not successful",
            },
            { status: 400 },
          )
        }
        // Paystack amount is in kobo; store Naira in DB
        verifiedAmountNaira = verification.data.amount / 100
        console.log("✅ Payment verified successfully, amount (NGN):", verifiedAmountNaira)
      } catch (verifyError) {
        console.error("❌ Payment verification error:", verifyError)
        return NextResponse.json(
          {
            success: false,
            error: "Payment verification failed",
            details: verifyError instanceof Error ? verifyError.message : "Verification error",
          },
          { status: 400 },
        )
      }
    } else {
      console.log("🧪 Skipping payment verification for test reference")
    }

    const amountNaira = typeof amount === "number" && amount > 0
      ? amount
      : typeof amount === "string" && Number(amount) > 0
        ? Number(amount)
        : verifiedAmountNaira
    if (amountNaira == null || amountNaira <= 0) {
      return NextResponse.json({ success: false, error: "Valid amount is required" }, { status: 400 })
    }

    // Handle both mock data and real UUIDs; allow null freelancer (setup before assigning freelancer)
    let clientId: string
    let freelancerUuid: string | null = null

    const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)

    if (freelancerId != null && freelancerId !== "") {
      if (isUUID(freelancerId)) {
        freelancerUuid = freelancerId
        console.log("✅ Using real freelancer UUID:", freelancerUuid)
      } else {
        // Mock data - find or create a real user
        console.log("🔄 Converting mock freelancer ID to real UUID...")
        const { data: users, error: usersError } = await supabase
          .from("users")
          .select("id, email, name")
          .eq("user_type", "freelancer")
          .limit(1)

        if (usersError || !users || users.length === 0) {
          const { data: newUser, error: createError } = await supabase
            .from("users")
            .insert({
              email: "test.freelancer@example.com",
              name: "Test Freelancer",
              user_type: "freelancer",
              created_at: new Date().toISOString(),
            })
            .select()
            .single()

          if (createError || !newUser) {
            return NextResponse.json(
              { success: false, error: "Failed to create test user", details: createError?.message },
              { status: 500 },
            )
          }
          freelancerUuid = newUser.id
        } else {
          freelancerUuid = users[0].id
        }
        console.log("✅ Using freelancer UUID:", freelancerUuid)
      }
    } else {
      console.log("✅ No freelancer yet; escrow will be assigned later")
    }

    clientId = user.id
    console.log("✅ Using client UUID:", clientId)

    const escrowData = {
      task_id: taskId,
      client_id: clientId,
      freelancer_id: freelancerUuid,
      amount: Number(amountNaira.toFixed(2)),
      currency: "NGN",
      status: "funded",
      payment_reference: reference,
    }

    console.log("📝 Attempting to insert escrow data:", escrowData)

    const { data: insertedEscrow, error: escrowError } = await supabase
      .from("escrow_accounts")
      .insert(escrowData)
      .select()
      .single()

    if (escrowError) {
      console.error("❌ Escrow insertion failed:", {
        error: escrowError,
        message: escrowError.message,
        details: escrowError.details,
        hint: escrowError.hint,
        code: escrowError.code,
      })

      return NextResponse.json(
        {
          success: false,
          error: "Database insertion failed",
          details: escrowError.message,
          code: escrowError.code,
          hint: escrowError.hint,
        },
        { status: 500 },
      )
    }

    console.log("✅ Escrow created successfully:", insertedEscrow)

    // Create escrow_milestones: from request body or from task_milestones
    type EscrowMilestoneRow = { escrow_id: string; title: string; description: string | null; amount: number; due_date: string | null; status: string }
    let milestonesToInsert: EscrowMilestoneRow[] = []
    if (paymentType === "milestones" && milestones && milestones.length > 0) {
      milestonesToInsert = milestones.map((milestone: any) => ({
        escrow_id: insertedEscrow.id,
        title: milestone.title ?? "Milestone",
        description: milestone.description ?? null,
        amount: Number(milestone.amount) || 0,
        due_date: milestone.dueDate ?? milestone.due_date ?? null,
        status: "pending",
      }))
    } else {
      const { data: taskMilestones } = await supabase
        .from("task_milestones")
        .select("id, title, description, amount, due_date")
        .eq("task_id", taskId)
        .order("created_at", { ascending: true })
      if (taskMilestones && taskMilestones.length > 0) {
        console.log("📝 Creating escrow_milestones from task_milestones:", taskMilestones.length)
        milestonesToInsert = taskMilestones.map((m: any) => ({
          escrow_id: insertedEscrow.id,
          title: m.title ?? "Milestone",
          description: m.description ?? null,
          amount: Number(m.amount) || 0,
          due_date: m.due_date ?? null,
          status: "pending",
        }))
      }
    }
    if (milestonesToInsert.length > 0) {
      const { error: milestonesError } = await supabase.from("escrow_milestones").insert(milestonesToInsert)
      if (milestonesError) {
        console.error("❌ Escrow milestones creation error:", milestonesError)
      } else {
        console.log("✅ Escrow milestones created:", milestonesToInsert.length)
      }
    }

    // Update task status and assigned freelancer only when we have a freelancer
    if (freelancerUuid) {
      console.log("📝 Updating task status and assigned freelancer...")
      const { error: taskUpdateError } = await supabase
        .from("tasks")
        .update({
          status: "in_progress",
          assigned_freelancer_id: freelancerUuid,
        })
        .eq("id", taskId)

      if (taskUpdateError) {
        console.error("❌ Task update failed:", taskUpdateError)
      } else {
        console.log("✅ Task updated successfully")
      }

      if (freelancerId != null && isUUID(freelancerId)) {
        console.log("📝 Updating application status...")
        const { error: appUpdateError } = await supabase
          .from("applications")
          .update({
            status: "accepted",
            accepted_at: new Date().toISOString(),
          })
          .eq("task_id", taskId)
          .eq("freelancer_id", freelancerUuid)

        if (appUpdateError) {
          console.error("❌ Application update failed:", appUpdateError)
        } else {
          console.log("✅ Application updated successfully")
        }
      }
    } else {
      console.log("⚠️ Skipping task/application update (no freelancer assigned yet)")
    }

    // Activate task after escrow is funded (job goes live)
    const { error: activateError } = await supabase
      .from("tasks")
      .update({ status: "active", requires_escrow: true, updated_at: new Date().toISOString() })
      .eq("id", taskId)
    if (activateError) {
      console.error("❌ Task activation failed:", activateError)
    } else {
      console.log("✅ Task activated (visible to freelancers)")
    }

    return NextResponse.json({
      success: true,
      data: {
        escrow_id: insertedEscrow.id,
        amount: insertedEscrow.amount,
        status: insertedEscrow.status,
        payment_reference: reference,
        milestones_count: paymentType === "milestones" ? milestones?.length || 0 : 0,
        client_id: clientId,
        freelancer_id: freelancerUuid ?? undefined,
      },
    })
  } catch (error) {
    console.error("❌ Unexpected error in escrow creation:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Unexpected server error",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        type: typeof error,
      },
      { status: 500 },
    )
  }
}
