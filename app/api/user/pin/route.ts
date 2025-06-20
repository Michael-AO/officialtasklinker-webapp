import { type NextRequest, NextResponse } from "next/server"

async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(pin)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

export async function POST(request: NextRequest) {
  try {
    const { pin, action } = await request.json()

    // Hash the PIN using Web Crypto API
    const hashedPin = await hashPin(pin)

    // In a real app, you would:
    // 1. Get current user from session/token
    // 2. Save hashed PIN to database
    // 3. Handle different actions (setup, change)

    return NextResponse.json({
      success: true,
      message: "PIN setup successful",
    })
  } catch (error) {
    console.error("PIN setup error:", error)
    return NextResponse.json({ error: "Failed to setup PIN" }, { status: 500 })
  }
}
