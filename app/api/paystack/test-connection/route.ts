import { NextResponse } from "next/server"
import { PAYSTACK_CONFIG } from "@/lib/paystack-config"

export async function GET() {
  try {
    if (!PAYSTACK_CONFIG.isConfigured()) {
      return NextResponse.json({
        success: false,
        message: "Paystack not configured",
        configured: false,
      })
    }

    // Test Paystack connection by fetching banks
    const response = await fetch(`${PAYSTACK_CONFIG.baseUrl}/bank`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_CONFIG.secretKey}`,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (data.status) {
      return NextResponse.json({
        success: true,
        message: `✅ Paystack ${PAYSTACK_CONFIG.isLive() ? "LIVE" : "TEST"} connection successful!`,
        configured: true,
        mode: PAYSTACK_CONFIG.isLive() ? "live" : "test",
        banks_count: data.data?.length || 0,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: `❌ Paystack connection failed: ${data.message}`,
          configured: true,
          error: data.message,
        },
        { status: 400 },
      )
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: `❌ Connection error: ${error.message}`,
        configured: true,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
