/**
 * Debug only: send a signed payload to the YouVerify webhook so you can test
 * the webhook handler and see errors (missing signature, invalid JSON, etc.).
 * Body: { payload: object } — will be JSON stringified, signed with YOUVERIFY_WEBHOOK_SECRET,
 * and POSTed to /api/webhooks/youverify.
 */
import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

const HMAC_ALGORITHM = "sha256"
const SIGNATURE_HEADER = "x-youverify-signature"

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.YOUVERIFY_WEBHOOK_SECRET
    if (!secret) {
      return NextResponse.json(
        { error: "YOUVERIFY_WEBHOOK_SECRET not set" },
        { status: 503 }
      )
    }

    const body = await request.json()
    const payload = body?.payload
    if (payload === undefined) {
      return NextResponse.json(
        { error: "Body must be { payload: object }" },
        { status: 400 }
      )
    }

    const rawBody = JSON.stringify(payload)
    const signature = crypto
      .createHmac(HMAC_ALGORITHM, secret)
      .update(rawBody)
      .digest("hex")

    const origin = request.nextUrl.origin
    const webhookUrl = `${origin}/api/webhooks/youverify`

    const webhookRes = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [SIGNATURE_HEADER]: signature,
      },
      body: rawBody,
    })

    let responseBody: unknown
    try {
      responseBody = await webhookRes.json()
    } catch {
      responseBody = { _raw: await webhookRes.text() }
    }

    return NextResponse.json({
      webhookStatus: webhookRes.status,
      webhookOk: webhookRes.ok,
      webhookBody: responseBody,
    })
  } catch (error) {
    console.error("[youverify-webhook-test]", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Request failed",
      },
      { status: 500 }
    )
  }
}
