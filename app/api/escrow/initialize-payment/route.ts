import { type NextRequest, NextResponse } from "next/server"
import { paystackService } from "@/lib/paystack"
import { ServerSessionManager } from "@/lib/server-session-manager"

/**
 * Initialize Paystack payment for escrow. Returns authorization_url for redirect.
 * Body: { taskId: string, amount: number } (amount in Naira).
 */
export async function POST(request: NextRequest) {
  try {
    const user = await ServerSessionManager.getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const taskId = body.taskId
    const amountNaira = typeof body.amount === "number" ? body.amount : Number(body.amount)
    const freelancerId = body.freelancerId ?? null

    if (!taskId) {
      return NextResponse.json({ success: false, error: "taskId is required" }, { status: 400 })
    }
    if (!Number.isFinite(amountNaira) || amountNaira <= 0) {
      return NextResponse.json({ success: false, error: "Valid amount is required" }, { status: 400 })
    }

    const amountKobo = Math.round(amountNaira * 100)
    const reference = `TL_ESCROW_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
    let callbackUrl = `${baseUrl.replace(/\/$/, "")}/payments/callback?reference=${encodeURIComponent(reference)}&taskId=${encodeURIComponent(taskId)}&amount=${encodeURIComponent(amountNaira)}`
    if (freelancerId) {
      callbackUrl += `&freelancerId=${encodeURIComponent(freelancerId)}`
    }

    const result = await paystackService.initializeTransaction({
      email: user.email,
      amount: amountKobo,
      currency: "NGN",
      reference,
      callback_url: callbackUrl,
      metadata: {
        task_id: taskId,
        custom_fields: [
          { display_name: "Task ID", variable_name: "task_id", value: taskId },
          { display_name: "Reference", variable_name: "reference", value: reference },
        ],
      },
    })

    if (!result.status || !result.data?.authorization_url) {
      return NextResponse.json(
        { success: false, error: result.message || "Failed to initialize payment" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      authorization_url: result.data.authorization_url,
      reference: result.data.reference,
    })
  } catch (error) {
    console.error("Escrow initialize payment error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to initialize payment" },
      { status: 500 }
    )
  }
}
