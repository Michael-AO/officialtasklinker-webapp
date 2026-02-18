import { type NextRequest, NextResponse } from "next/server"

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_BASE = "https://api.paystack.co"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bankCode, accountNumber } = body

    if (!bankCode || !accountNumber) {
      return NextResponse.json(
        { error: "Bank code and account number are required" },
        { status: 400 },
      )
    }

    const trimmed = String(accountNumber).trim()
    if (trimmed.length !== 10) {
      return NextResponse.json(
        { error: "Account number must be 10 digits" },
        { status: 400 },
      )
    }

    if (!PAYSTACK_SECRET_KEY) {
      console.error("PAYSTACK_SECRET_KEY is not set")
      return NextResponse.json(
        { error: "Bank verification is not configured" },
        { status: 503 },
      )
    }

    const params = new URLSearchParams({
      account_number: trimmed,
      bank_code: String(bankCode),
    })
    const url = `${PAYSTACK_BASE}/bank/resolve?${params.toString()}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (!data.status || !data.data?.account_name) {
      const message = data.message || "Account verification failed"
      return NextResponse.json(
        { error: message, accountName: null },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      accountName: data.data.account_name,
      accountNumber: data.data.account_number || trimmed,
      bankCode,
    })
  } catch (error) {
    console.error("Account verification error:", error)
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 },
    )
  }
}
