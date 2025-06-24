import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { paystackService } from "@/lib/paystack"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reference, taskId, freelancerId, amount, paymentType, milestones } = body

    console.log("🔄 Starting escrow creation with data:", {
      reference,
      taskId,
      freelancerId,
      amount,
      paymentType,
      milestonesCount: milestones?.length || 0,
    })

    // Verify payment with Paystack (only if not a test reference)
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
        console.log("✅ Payment verified successfully")
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

    // Handle both mock data and real UUIDs
    let clientId: string
    let freelancerUuid: string

    // Check if we're dealing with mock data (non-UUID format)
    const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)

    if (isUUID(freelancerId)) {
      // Real UUID from database
      freelancerUuid = freelancerId
      console.log("✅ Using real freelancer UUID:", freelancerUuid)
    } else {
      // Mock data - find or create a real user
      console.log("🔄 Converting mock freelancer ID to real UUID...")

      // Try to find an existing user or use the first available user
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id, email, name")
        .eq("user_type", "freelancer")
        .limit(1)

      if (usersError || !users || users.length === 0) {
        console.log("⚠️ No freelancers found, creating test user...")
        // Create a test freelancer user
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
            {
              success: false,
              error: "Failed to create test user",
              details: createError?.message || "User creation failed",
            },
            { status: 500 },
          )
        }
        freelancerUuid = newUser.id
      } else {
        freelancerUuid = users[0].id
      }
      console.log("✅ Using freelancer UUID:", freelancerUuid)
    }

    // Get client ID from task or use first available client
    const { data: task, error: taskError } = await supabase.from("tasks").select("client_id").eq("id", taskId).single()

    if (taskError || !task) {
      console.log("⚠️ Task not found, using first available client...")
      const { data: clients, error: clientsError } = await supabase
        .from("users")
        .select("id")
        .eq("user_type", "client")
        .limit(1)

      if (clientsError || !clients || clients.length === 0) {
        // Create a test client
        const { data: newClient, error: createClientError } = await supabase
          .from("users")
          .insert({
            email: "test.client@example.com",
            name: "Test Client",
            user_type: "client",
            created_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (createClientError || !newClient) {
          return NextResponse.json(
            {
              success: false,
              error: "Failed to create test client",
              details: createClientError?.message || "Client creation failed",
            },
            { status: 500 },
          )
        }
        clientId = newClient.id
      } else {
        clientId = clients[0].id
      }
    } else {
      clientId = task.client_id
    }

    console.log("✅ Using client UUID:", clientId)

    // Create escrow record with proper UUID format
    const escrowData = {
      task_id: taskId,
      client_id: clientId,
      freelancer_id: freelancerUuid,
      amount: Number.parseInt(amount.toString()),
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

    // Create milestones if milestone-based payment
    if (paymentType === "milestones" && milestones && milestones.length > 0) {
      console.log("📝 Creating milestones...")

      const milestoneData = milestones.map((milestone: any, index: number) => ({
        escrow_id: insertedEscrow.id,
        title: milestone.title,
        description: milestone.description,
        amount: milestone.amount,
        due_date: milestone.dueDate,
        order_index: index + 1,
        status: "pending",
        created_at: new Date().toISOString(),
      }))

      const { data: createdMilestones, error: milestonesError } = await supabase
        .from("escrow_milestones")
        .insert(milestoneData)
        .select()

      if (milestonesError) {
        console.error("❌ Milestones creation error:", milestonesError)
      } else {
        console.log("✅ Milestones created:", createdMilestones?.length)
      }
    }

    // Update task status
    console.log("📝 Updating task status...")
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

    // Update application status (only if real application exists)
    if (isUUID(freelancerId)) {
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
    } else {
      console.log("⚠️ Skipping application update for mock data")
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
        freelancer_id: freelancerUuid,
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
