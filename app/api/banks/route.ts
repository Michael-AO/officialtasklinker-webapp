import { type NextRequest, NextResponse } from "next/server"

// Nigerian banks list from Paystack
const NIGERIAN_BANKS = [
  { id: 1, name: "Access Bank", code: "044" },
  { id: 2, name: "Citibank Nigeria", code: "023" },
  { id: 3, name: "Diamond Bank", code: "063" },
  { id: 4, name: "Ecobank Nigeria", code: "050" },
  { id: 5, name: "Fidelity Bank", code: "070" },
  { id: 6, name: "First Bank of Nigeria", code: "011" },
  { id: 7, name: "First City Monument Bank", code: "214" },
  { id: 8, name: "Guaranty Trust Bank", code: "058" },
  { id: 9, name: "Heritage Bank", code: "030" },
  { id: 10, name: "Jaiz Bank", code: "301" },
  { id: 11, name: "Keystone Bank", code: "082" },
  { id: 12, name: "Polaris Bank", code: "076" },
  { id: 13, name: "Providus Bank", code: "101" },
  { id: 14, name: "Stanbic IBTC Bank", code: "221" },
  { id: 15, name: "Standard Chartered Bank", code: "068" },
  { id: 16, name: "Sterling Bank", code: "232" },
  { id: 17, name: "Union Bank of Nigeria", code: "032" },
  { id: 18, name: "United Bank For Africa", code: "033" },
  { id: 19, name: "Unity Bank", code: "215" },
  { id: 20, name: "Wema Bank", code: "035" },
  { id: 21, name: "Zenith Bank", code: "057" },
]

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: NIGERIAN_BANKS,
    })
  } catch (error) {
    console.error("Banks fetch error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
