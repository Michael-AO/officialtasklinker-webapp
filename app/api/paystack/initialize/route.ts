import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { escrowId } = await request.json()

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecretKey) {
      throw new Error("Paystack secret key not configured")
    }

    // In a real app, fetch escrow details from database
    // For now, we'll use mock data
    const escrow = {
      id: escrowId,
      amount: 150000, // Amount in kobo
      clientEmail: "client@example.com",
      taskTitle: "Website Redesign Project",
    }

    const reference = `TL_PAY_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`

    const paystackData = {
      email: escrow.clientEmail,
      amount: escrow.amount,
      reference,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback?reference=${reference}`,
      metadata: {
        escrow_id: escrowId,
        task_title: escrow.taskTitle,
        custom_fields: [
          {
            display_name: "Escrow ID",
            variable_name: "escrow_id",
            value: escrowId,
          },
        ],
      },
    }

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paystackData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to initialize payment with Paystack")
    }

    const result = await response.json()

    return NextResponse.json({
      authorization_url: result.data.authorization_url,
      reference: result.data.reference,
    })
  } catch (error) {
    console.error("Error initializing payment:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to initialize payment" },
      { status: 500 },
    )
  }
}
