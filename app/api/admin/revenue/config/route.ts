import { NextResponse } from "next/server"

export async function GET() {
  try {
    const config = {
      paystack_configured: !!(process.env.PAYSTACK_SECRET_KEY && process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY),
      paystack_mode: process.env.NODE_ENV === "production" ? "live" : "test",
      environment: process.env.NODE_ENV || "development",
      app_url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      testing_mode: process.env.NODE_ENV !== "production",
      secret_key_present: !!process.env.PAYSTACK_SECRET_KEY,
      public_key_present: !!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      keys_from_env: !!(process.env.PAYSTACK_SECRET_KEY && process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY),
    }

    return NextResponse.json({
      success: true,
      config,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load configuration",
      },
      { status: 500 },
    )
  }
}
