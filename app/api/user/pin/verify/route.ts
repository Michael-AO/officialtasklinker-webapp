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
    const { pin } = await request.json()

    // Hash the provided PIN
    const hashedPin = await hashPin(pin)

    // In a real app, you would:
    // 1. Get current user from session/token
    // 2. Get stored hashed PIN from database
    // 3. Compare hashed PINs

    // For demo purposes, we'll simulate a successful verification
    const isValid = pin.length === 4 // Simple validation

    if (isValid) {
      return NextResponse.json({
        success: true,
        message: "PIN verified successfully",
      })
    } else {
      return NextResponse.json({ error: "Invalid PIN" }, { status: 400 })
    }
  } catch (error) {
    console.error("PIN verification error:", error)
    return NextResponse.json({ error: "Failed to verify PIN" }, { status: 500 })
  }
}
