import { type NextRequest, NextResponse } from "next/server"
import { ServerSessionManager } from "@/lib/server-session-manager"
import { withdrawalService } from "@/lib/withdrawal-service"

/**
 * GET /api/withdrawals
 * Returns withdrawal history for the current user.
 * Returns empty array until a withdrawals table exists.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await ServerSessionManager.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({
      success: true,
      withdrawals: [],
    })
  } catch (error) {
    console.error("Withdrawals GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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
