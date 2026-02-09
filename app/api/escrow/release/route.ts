import { type NextRequest, NextResponse } from "next/server"
import { paystackService } from "@/lib/paystack"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { escrowId, freelancerBankDetails, amount: bodyAmount, reason, skipTransfer, milestone_id: milestoneId } = body

    if (!escrowId) {
      return NextResponse.json({ error: "escrowId is required" }, { status: 400 })
    }

    // Fetch escrow to get freelancer_id, amount, task_id
    const { data: escrow, error: escrowError } = await supabase
      .from("escrow_accounts")
      .select("id, task_id, freelancer_id, amount, status")
      .eq("id", escrowId)
      .single()

    if (escrowError || !escrow) {
      return NextResponse.json({ error: "Escrow not found" }, { status: 404 })
    }
    if (escrow.status === "released") {
      return NextResponse.json({ error: "Escrow already released" }, { status: 400 })
    }

    // Security guard: block release if any task_milestone for this task is DISPUTED
    if (escrow.task_id) {
      const { data: disputed } = await supabase
        .from("task_milestones")
        .select("id")
        .eq("task_id", escrow.task_id)
        .eq("status", "DISPUTED")
        .limit(1)
      if (disputed && disputed.length > 0) {
        return NextResponse.json(
          { error: "Cannot release funds while a milestone is in dispute" },
          { status: 400 },
        )
      }
    }

    const amount = bodyAmount ?? escrow.amount
    const freelancerId = escrow.freelancer_id

    let transferSuccess = false
    if (!skipTransfer && freelancerBankDetails && amount) {
      try {
        const recipient = await paystackService.createTransferRecipient({
          type: "nuban",
          name: freelancerBankDetails.accountName,
          account_number: freelancerBankDetails.accountNumber,
          bank_code: freelancerBankDetails.bankCode,
        })
        if (recipient.status) {
          const transfer = await paystackService.initiateTransfer({
            source: "balance",
            amount: Number(amount),
            recipient: recipient.data.recipient_code,
            reason: reason || "Escrow release payment",
            reference: `TL_REL_${Date.now()}_${escrowId}`,
          })
          transferSuccess = transfer.status
        }
      } catch (paystackError) {
        console.error("Paystack release error:", paystackError)
        return NextResponse.json(
          { error: "Transfer failed. For demo you can use skipTransfer: true to only update DB." },
          { status: 400 }
        )
      }
    } else {
      transferSuccess = true
    }

    if (!transferSuccess && !skipTransfer) {
      return NextResponse.json({ error: "Failed to initiate transfer" }, { status: 400 })
    }

    const now = new Date().toISOString()

    // Update escrow_accounts to released
    const { error: updateEscrowError } = await supabase
      .from("escrow_accounts")
      .update({ status: "released", updated_at: now })
      .eq("id", escrowId)

    if (updateEscrowError) {
      console.error("Escrow update error:", updateEscrowError)
      return NextResponse.json({ error: "Failed to update escrow status" }, { status: 500 })
    }

    // Update escrow_milestones to completed
    await supabase
      .from("escrow_milestones")
      .update({ status: "completed" })
      .eq("escrow_id", escrowId)

    // Update freelancer total_earned
    if (freelancerId && amount) {
      const { data: user } = await supabase
        .from("users")
        .select("total_earned")
        .eq("id", freelancerId)
        .single()
      const currentTotal = Number(user?.total_earned ?? 0)
      await supabase
        .from("users")
        .update({ total_earned: currentTotal + Number(amount), updated_at: now })
        .eq("id", freelancerId)
    }

    // If release is for a task_milestone, set milestone to RELEASED and record platform_ledger
    if (milestoneId) {
      const { data: milestone, error: milestoneErr } = await supabase
        .from("task_milestones")
        .select("id, amount, status")
        .eq("id", milestoneId)
        .single()
      if (!milestoneErr && milestone && milestone.status === "FUNDED") {
        await supabase
          .from("task_milestones")
          .update({ status: "RELEASED", updated_at: now })
          .eq("id", milestoneId)
        const totalAmount = Number(milestone.amount) || Number(amount)
        const platformFee = Math.round(totalAmount * 0.1 * 100) / 100
        const netPayout = Math.round((totalAmount - platformFee) * 100) / 100
        await supabase.from("platform_ledger").insert({
          milestone_id: milestoneId,
          total_amount: totalAmount,
          platform_fee: platformFee,
          net_payout: netPayout,
          transaction_type: "MILESTONE_RELEASE",
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        escrowId,
        status: "released",
        freelancerId,
      },
    })
  } catch (error) {
    console.error("Escrow release error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
