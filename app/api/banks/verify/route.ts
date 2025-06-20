import { type NextRequest, NextResponse } from "next/server"
import { paystackService } from "@/lib/paystack"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { account_number, bank_code } = body

    const verification = await paystackService.verifyBankAccount({
      account_number,
      bank_code,
    })

    if (!verification.status) {
      return NextResponse.json({ 
        success: false, 
        error: "Account verification failed" 
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: {
        account_name: verification.data.account_name,
        account_number: verification.data.account_number,
      },
    })
  } catch (error) {
    console.error("Bank verification error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 })
  }
}