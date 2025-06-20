import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bankName, bankCode, accountNumber, accountName } = body

    // In a real app, you would save this to your database
    // For now, we'll just return success
    const bankAccountId = `bank_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    return NextResponse.json({
      success: true,
      data: {
        id: bankAccountId,
        bankName,
        bankCode,
        accountNumber,
        accountName,
        isDefault: false,
        isVerified: true,
        addedDate: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Bank account creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // In a real app, you would fetch from your database
    // For now, return mock data
    const mockBankAccounts = [
      {
        id: "bank_001",
        bankName: "GTBank",
        bankCode: "058",
        accountNumber: "0123456789",
        accountName: "John Doe",
        isDefault: true,
        isVerified: true,
        addedDate: "2024-11-15T10:00:00Z",
      },
      {
        id: "bank_002",
        bankName: "Access Bank",
        bankCode: "044",
        accountNumber: "0987654321",
        accountName: "John Doe",
        isDefault: false,
        isVerified: true,
        addedDate: "2024-11-20T14:30:00Z",
      },
    ]

    return NextResponse.json({
      success: true,
      data: mockBankAccounts,
    })
  } catch (error) {
    console.error("Bank accounts fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}