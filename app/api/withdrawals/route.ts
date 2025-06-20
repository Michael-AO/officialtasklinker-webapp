import { type NextRequest, NextResponse } from "next/server"
import { withdrawalService } from "@/lib/withdrawal-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case "verify_account":
        const verificationResult = await withdrawalService.verifyBankAccount(data)
        return NextResponse.json(verificationResult)

      case "initiate_withdrawal":
        // Validate user authentication and balance
        // const user = await getCurrentUser(request)
        // const balance = await getUserBalance(user.id)

        const withdrawalResult = await withdrawalService.initiateTransfer(data)
        return NextResponse.json(withdrawalResult)

      case "get_banks":
        const banks = await withdrawalService.getBanksList()
        return NextResponse.json({ success: true, data: banks })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Withdrawal API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
