import { type NextRequest, NextResponse } from "next/server"
import { paystackService } from "@/lib/paystack"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reference } = body

    // Verify transaction with Paystack
    const verification = await paystackService.verifyTransaction(reference)

    if (!verification.status || verification.data.status !== "success") {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
    }

    // Here you would update your database to mark the escrow as funded
    // For now, we'll return the verification data
    return NextResponse.json({
      success: true,
      data: {
        status: verification.data.status,
        reference: verification.data.reference,
        amount: verification.data.amount,
        paid_at: verification.data.paid_at,
        metadata: verification.data.metadata,
      },
    })
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
