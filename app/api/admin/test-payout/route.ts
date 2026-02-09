import { NextResponse } from "next/server"
import { ServerSessionManager } from "@/lib/server-session-manager"
import { paystackService } from "@/lib/paystack"
import { getBankCode } from "@/lib/paystack-config"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const devKey = process.env.TEST_PAYOUT_KEY
    const headerKey = request.headers.get("x-test-payout-key") ?? (body as any)?.testPayoutKey
    const isDevBypass = process.env.NODE_ENV === "development" && devKey && headerKey === devKey
    const isAdmin = isDevBypass || (await ServerSessionManager.isAdmin())
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 })
    }
    const accountNumber = String((body as any).accountNumber ?? (body as any).account_number ?? "").trim()
    const accountName = String((body as any).accountName ?? (body as any).account_name ?? "").trim()
    const bankName = (body as any).bankName ?? (body as any).bank_name ?? "Access Bank"
    const amountNaira = Number((body as any).amount) || 100

    if (!accountNumber || !accountName) {
      return NextResponse.json(
        { error: "accountNumber and accountName are required" },
        { status: 400 }
      )
    }

    const bankCode = (body as any).bankCode ?? (body as any).bank_code ?? getBankCode(bankName)

    const recipient = await paystackService.createTransferRecipient({
      type: "nuban",
      name: accountName,
      account_number: accountNumber,
      bank_code: bankCode,
      currency: "NGN",
    })

    if (!recipient.status || !recipient.data?.recipient_code) {
      return NextResponse.json(
        {
          error: "Failed to create transfer recipient",
          message: recipient.message,
          details: recipient,
        },
        { status: 400 }
      )
    }

    const transfer = await paystackService.initiateTransfer({
      source: "balance",
      amount: amountNaira,
      recipient: recipient.data.recipient_code,
      reason: "Tasklinkers test payout",
      reference: `TL_TEST_${Date.now()}`,
    })

    if (!transfer.status) {
      return NextResponse.json(
        {
          error: "Transfer failed",
          message: transfer.message,
          details: transfer,
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Test payout initiated",
      recipient_code: recipient.data.recipient_code,
      amount_naira: amountNaira,
      account: accountNumber,
      account_name: accountName,
      bank_code: bankCode,
      transfer: transfer.data,
    })
  } catch (error) {
    console.error("Test payout error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
