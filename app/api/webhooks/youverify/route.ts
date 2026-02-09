/**
 * YouVerify webhook: receives verification.approved / success and failure events,
 * updates users (is_verified, kyc_status, youverify_id, kyc_last_checked, kyc_fail_reason).
 *
 * Security: User matching is userId-only. We only update when data.metadata.userId
 * is present and is a valid UUID. Email and youverify_id fallbacks were removed
 * to prevent identity-switch or wrong-user updates. Session generate sends
 * metadata: { userId, email } so YouVerify must include metadata.userId in webhook.
 */
import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { supabase } from "@/lib/supabase"

const SIGNATURE_HEADER = "x-youverify-signature"
const HMAC_ALGORITHM = "sha256"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isValidUserId(id: string | undefined): id is string {
  return typeof id === "string" && UUID_REGEX.test(id)
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get(SIGNATURE_HEADER) ?? request.headers.get("X-YouVerify-Signature")

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 })
    }

    const secret = process.env.YOUVERIFY_WEBHOOK_SECRET
    if (!secret) {
      console.error("[youverify] YOUVERIFY_WEBHOOK_SECRET not set")
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
    }

    const expected = crypto.createHmac(HMAC_ALGORITHM, secret).update(rawBody).digest("hex")
    if (expected.length !== signature.length || expected.length === 0) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }
    try {
      if (!crypto.timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(signature, "utf8"))) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    } catch {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    let event: {
      event?: string
      data?: {
        status?: string
        customerId?: string
        id?: string
        metadata?: { userId?: string; email?: string }
        reason?: string
        message?: string
      }
    }
    try {
      event = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const eventType = event?.event ?? event?.data?.status
    const data = event?.data ?? event
    const metadata = data?.metadata ?? {}
    const userId = metadata?.userId
    const customerId = data?.customerId ?? data?.id
    const now = new Date().toISOString()

    if (eventType === "verification.approved" || data?.status === "approved" || eventType === "success") {
      if (!isValidUserId(userId)) {
        console.warn("[youverify] Approved event missing valid metadata.userId; skipping user update")
        return NextResponse.json({ received: true })
      }
      const updates: { is_verified: boolean; kyc_status: string; youverify_id?: string; kyc_last_checked: string; kyc_fail_reason?: null; updated_at: string } = {
        is_verified: true,
        kyc_status: "VERIFIED",
        kyc_last_checked: now,
        kyc_fail_reason: null,
        updated_at: now,
      }
      if (customerId) updates.youverify_id = String(customerId)
      const { error } = await supabase.from("users").update(updates).eq("id", userId)
      if (error) console.error("[youverify] Update by userId failed:", error)
    } else if (
      eventType === "verification.rejected" ||
      eventType === "verification.failed" ||
      data?.status === "failed" ||
      data?.status === "rejected"
    ) {
      if (!isValidUserId(userId)) {
        console.warn("[youverify] Failure event missing valid metadata.userId; skipping user update")
        return NextResponse.json({ received: true })
      }
      const failReason = data?.reason ?? data?.message ?? "Verification failed"
      const { error } = await supabase
        .from("users")
        .update({
          kyc_status: "FAILED",
          kyc_fail_reason: String(failReason).slice(0, 500),
          updated_at: now,
        })
        .eq("id", userId)
      if (error) console.error("[youverify] Failure update by userId failed:", error)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[youverify] Webhook error:", error)
    return NextResponse.json({ error: "Processing failed" }, { status: 500 })
  }
}
