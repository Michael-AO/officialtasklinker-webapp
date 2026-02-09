/**
 * YouVerify Nigeria NIN (National Identification Number) verification.
 * POST body: { nin, premiumNin?, validations? }.
 * Calls YouVerify POST /v2/api/identity/ng/nin. Requires auth.
 * On success: updates users.name (official name from YouVerify) and users.is_verified.
 */
import { NextResponse } from "next/server"
import { ServerSessionManager } from "@/lib/server-session-manager"
import { supabase } from "@/lib/supabase"

// ==================== CONFIG ====================
const getValidatedBaseUrl = (url: string): string => {
  try {
    const cleanUrl = url.replace(/\/+$/, "")
    const parsed = new URL(cleanUrl)
    if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") {
      throw new Error("Insecure protocol (HTTPS required in production)")
    }
    return parsed.origin
  } catch {
    if (process.env.NODE_ENV === "production") {
      throw new Error("YOUVERIFY_BASE_URL must be a valid HTTPS URL in production")
    }
    return "https://api.sandbox.youverify.co"
  }
}

// In development always use sandbox; in production use YOUVERIFY_BASE_URL or production API
const YOUVERIFY_BASE_URL = getValidatedBaseUrl(
  process.env.NODE_ENV === "production"
    ? (process.env.YOUVERIFY_BASE_URL || "https://api.youverify.co")
    : "https://api.sandbox.youverify.co"
)

const YOUVERIFY_TOKEN =
  process.env.YOUVERIFY_API_KEY ||
  process.env.YOUVERIFY_API_SECRET ||
  process.env.YOUVERIFY_API_TOKEN

const NIN_PATH = "/v2/api/identity/ng/nin"
const TIMEOUT_MS = 15000

async function youverifyNinFetch(
  payload: { id: string; isSubjectConsent: boolean; premiumNin?: boolean; validations?: unknown }
): Promise<{ response: Response; data: unknown }> {
  const url = `${YOUVERIFY_BASE_URL}${NIN_PATH}`
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        token: YOUVERIFY_TOKEN || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    let data: unknown
    try {
      data = await response.json()
    } catch {
      data = { _raw: await response.text() }
    }

    return { response, data }
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("TIMEOUT")
    }
    throw new Error("NETWORK_ERROR")
  }
}

const NIN_11_DIGITS = /^\d{11}$/

/** Parse official full name from YouVerify NIN response (supports multiple shapes). */
function parseOfficialName(data: unknown): string | null {
  if (data == null || typeof data !== "object") return null
  const o = data as Record<string, unknown>
  // Nested: data.data.firstName etc.
  const inner = o.data != null && typeof o.data === "object" ? (o.data as Record<string, unknown>) : o
  const first = (inner.firstName ?? inner.first_name) as string | undefined
  const last = (inner.lastName ?? inner.last_name) as string | undefined
  if (typeof first === "string" || typeof last === "string") {
    const parts = [first?.trim(), last?.trim()].filter(Boolean)
    if (parts.length) return parts.join(" ")
  }
  const full = (inner.fullName ?? inner.full_name ?? o.fullName ?? o.full_name) as string | undefined
  if (typeof full === "string" && full.trim()) return full.trim()
  return null
}

export async function POST(request: Request) {
  const requestId = Date.now().toString(36) + Math.random().toString(36).substring(2)
  if (process.env.NODE_ENV === "production") {
    console.log(`[youverify-nin][${requestId}] Request`)
  } else {
    console.log(`[youverify-nin][${requestId}] NIN verify request`)
  }

  try {
    const user = await ServerSessionManager.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!YOUVERIFY_TOKEN) {
      return NextResponse.json(
        {
          error: "Verification service is not configured.",
          message: "Verification service is not configured. Please contact support.",
        },
        { status: 503 }
      )
    }

    let body: { nin?: string; premiumNin?: boolean; validations?: unknown }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body", message: "Invalid JSON body" },
        { status: 400 }
      )
    }

    const nin = typeof body.nin === "string" ? body.nin.trim().replace(/\s/g, "") : ""
    if (!nin || !NIN_11_DIGITS.test(nin)) {
      return NextResponse.json(
        { error: "Invalid NIN", message: "NIN must be an 11-digit number." },
        { status: 400 }
      )
    }

    const payload: { id: string; isSubjectConsent: boolean; premiumNin?: boolean; validations?: unknown } = {
      id: nin,
      isSubjectConsent: true,
    }
    if (body.premiumNin === true) {
      payload.premiumNin = true
    }
    if (body.validations != null && typeof body.validations === "object") {
      payload.validations = body.validations
    }

    const { response, data } = await youverifyNinFetch(payload)

    if (response.ok) {
      const officialName = parseOfficialName(data)
      const now = new Date().toISOString()
      const updates: { is_verified: boolean; updated_at: string; name?: string } = {
        is_verified: true,
        updated_at: now,
      }
      if (officialName) updates.name = officialName

      const { error: updateError } = await supabase
        .from("users")
        .update(updates)
        .eq("id", user.id)

      if (updateError) {
        console.error(`[youverify-nin][${requestId}] User update failed:`, updateError)
        // Still return success so client knows NIN verified; name/flag may sync later
      }

      return NextResponse.json(data)
    }

    const msg = (data as { message?: string })?.message

    switch (response.status) {
      case 402:
        return NextResponse.json(
          { error: "Insufficient funds in YouVerify wallet", message: msg || "Insufficient funds in YouVerify wallet." },
          { status: 402 }
        )
      case 403:
        return NextResponse.json(
          { error: "Invalid YouVerify API token", message: msg || "Invalid YouVerify API token." },
          { status: 502 }
        )
      case 401:
        return NextResponse.json(
          { error: "Verification service configuration error.", message: msg || "Verification service configuration error. Please contact support." },
          { status: 502 }
        )
      case 404:
        return NextResponse.json(
          {
            error: "NIN endpoint not found. Check YOUVERIFY_BASE_URL and API key.",
            message: msg || "Verification endpoint not found.",
          },
          { status: 502 }
        )
      case 429:
        return NextResponse.json(
          { error: "Too many requests.", message: msg || "Too many requests. Please try again in a moment." },
          { status: 429 }
        )
      default:
        return NextResponse.json(
          { error: "Verification failed", message: msg || "Verification failed. Please try again." },
          { status: 502 }
        )
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "UNKNOWN"
    console.error(`[youverify-nin][${requestId}] Failed:`, errMsg)

    if (errMsg === "TIMEOUT") {
      return NextResponse.json(
        { error: "Verification service is temporarily unavailable.", message: "Verification service is temporarily unavailable. Please try again." },
        { status: 504 }
      )
    }
    return NextResponse.json(
      { error: "Unable to reach verification service.", message: "Unable to reach verification service. Please try again." },
      { status: 502 }
    )
  }
}
