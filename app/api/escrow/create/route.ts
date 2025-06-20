import { type NextRequest, NextResponse } from "next/server"
import { paystackService } from "@/lib/paystack"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { taskId, amount, clientEmail, milestones } = body

    // Generate unique reference
    const reference = `TL_ESC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Initialize Paystack transaction
    const paystackResponse = await paystackService.initializeTransaction({
      email: clientEmail,
      amount: amount, // amount should already be in kobo
      reference,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/escrow/callback`,
      metadata: {
        taskId,
        type: "escrow_funding",
        milestones: milestones || [],
      },
    })

    if (!paystackResponse.status) {
      return NextResponse.json({ error: "Failed to initialize payment" }, { status: 400 })
    }

    // Here you would typically save the escrow record to your database
    // For now, we'll return the payment URL
    return NextResponse.json({
      success: true,
      data: {
        authorization_url: paystackResponse.data.authorization_url,
        reference: paystackResponse.data.reference,
        access_code: paystackResponse.data.access_code,
      },
    })
  } catch (error) {
    console.error("Escrow creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
