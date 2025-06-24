import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Admin revenue API is working",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    paystack_configured: !!process.env.PAYSTACK_SECRET_KEY,
    paystack_key_type: process.env.PAYSTACK_SECRET_KEY?.startsWith("sk_live") ? "live" : "test",
  })
}
