import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bankCode, accountNumber } = body

    // Validate input
    if (!bankCode || !accountNumber) {
      return NextResponse.json(
        {
          error: "Bank code and account number are required",
        },
        { status: 400 },
      )
    }

    if (accountNumber.length !== 10) {
      return NextResponse.json(
        {
          error: "Account number must be 10 digits",
        },
        { status: 400 },
      )
    }

    // In production, you would call Paystack's account verification API
    // For now, we'll simulate the verification
    await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate API delay

    // Mock verification - in production, use Paystack API
    const mockAccountNames = ["John Doe", "Jane Smith", "Michael Johnson", "Sarah Williams", "David Brown"]

    const randomName = mockAccountNames[Math.floor(Math.random() * mockAccountNames.length)]

    return NextResponse.json({
      success: true,
      accountName: randomName,
      accountNumber,
      bankCode,
    })
  } catch (error) {
    console.error("Account verification error:", error)
    return NextResponse.json(
      {
        error: "Verification failed",
      },
      { status: 500 },
    )
  }
}
