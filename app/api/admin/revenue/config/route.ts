import { NextResponse } from "next/server"
import { PAYSTACK_CONFIG } from "@/lib/paystack-config"

export async function GET() {
  const config = {
    paystack_configured: PAYSTACK_CONFIG.isConfigured(),
    paystack_mode: PAYSTACK_CONFIG.isLive() ? "live" : "test",
    environment: process.env.NODE_ENV || "development",
    app_url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    testing_mode: process.env.NODE_ENV === "development",
    secret_key_present: !!PAYSTACK_CONFIG.secretKey,
    public_key_present: !!PAYSTACK_CONFIG.publicKey,
    keys_from_env: !!(process.env.PAYSTACK_SECRET_KEY && process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY),
  }

  let message = "⚠️ Paystack not configured - using simulation mode"

  if (config.paystack_configured) {
    message = `✅ Paystack ${config.paystack_mode.toUpperCase()} mode is configured and ready`
  }

  return NextResponse.json({
    success: true,
    config,
    message,
    recommendations: config.paystack_configured
      ? [
          "✅ Paystack is properly configured",
          `✅ Running in ${config.paystack_mode.toUpperCase()} mode`,
          "✅ Ready for real withdrawals",
        ]
      : [
          "Add PAYSTACK_SECRET_KEY to environment variables",
          "Add NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY to environment variables",
          "Restart the application after adding keys",
        ],
  })
}
