import { type NextRequest, NextResponse } from "next/server"
import { paystackService } from "@/lib/paystack"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { escrowId, freelancerBankDetails, amount, reason } = body

    // Create transfer recipient
    const recipient = await paystackService.createTransferRecipient({
      type: "nuban",
      name: freelancerBankDetails.accountName,
      account_number: freelancerBankDetails.accountNumber,
      bank_code: freelancerBankDetails.bankCode,
    })

    if (!recipient.status) {
      return NextResponse.json({ error: "Failed to create transfer recipient" }, { status: 400 })
    }

    // Initiate transfer
    const transfer = await paystackService.initiateTransfer({
      source: "balance",
      amount: amount, // amount in kobo
      recipient: recipient.data.recipient_code,
      reason: reason || "Escrow release payment",
      reference: `TL_REL_${Date.now()}_${escrowId}`,
    })

    if (!transfer.status) {
      return NextResponse.json({ error: "Failed to initiate transfer" }, { status: 400 })
    }

    // Here you would update your database to mark the escrow as released
    return NextResponse.json({
      success: true,
      data: {
        transfer_code: transfer.data.transfer_code,
        reference: transfer.data.reference,
        status: transfer.data.status,
      },
    })
  } catch (error) {
    console.error("Escrow release error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
