import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { reference, taskId, userId } = await request.json()

    console.log("🔍 Verifying Paystack payment:", { reference, taskId, userId })

    // Verify payment with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })

    const paystackData = await paystackResponse.json()
    console.log("📊 Paystack verification response:", paystackData)

    if (!paystackData.status || paystackData.data.status !== "success") {
      return NextResponse.json({ success: false, error: "Payment verification failed" }, { status: 400 })
    }

    // Payment verified successfully
    const amountPaid = paystackData.data.amount / 100 // Convert from kobo to naira

    // Create escrow record
    const { data: escrow, error: escrowError } = await supabase
      .from("escrows")
      .insert({
        task_id: taskId,
        client_id: userId,
        amount: amountPaid,
        status: "funded",
        payment_reference: reference,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (escrowError) {
      console.error("❌ Escrow creation error:", escrowError)
      return NextResponse.json({ success: false, error: "Failed to create escrow record" }, { status: 500 })
    }

    // Update task status to make it active and visible
    const { data: updatedTask, error: taskError } = await supabase
      .from("tasks")
      .update({
        status: "active", // Make task active so it shows in browse
        has_escrow: true,
        escrow_amount: amountPaid,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)
      .select()
      .single()

    if (taskError) {
      console.error("❌ Task update error:", taskError)
      return NextResponse.json({ success: false, error: "Failed to update task status" }, { status: 500 })
    }

    console.log("✅ Task activated and escrow created:", { task: updatedTask, escrow })

    return NextResponse.json({
      success: true,
      escrow: escrow,
      task: updatedTask,
      payment: paystackData.data,
      message: "Payment verified, escrow funded, and task activated successfully!",
    })
  } catch (error) {
    console.error("❌ Payment verification error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
