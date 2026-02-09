/**
 * Start YouVerify verification: returns SDK session ID for the YouVerify Web SDK.
 * Production-only: requires YOUVERIFY_API_KEY, YOUVERIFY_API_SECRET, or YOUVERIFY_API_TOKEN.
 *
 * API key must match environment: use Sandbox key from YVOS Sandbox when base URL is Sandbox;
 * use Production key from YVOS Production when base URL is Production.
 */
import { NextResponse } from "next/server"
import { ServerSessionManager } from "@/lib/server-session-manager"

// ==================== CONFIG VALIDATION ====================
const getValidatedBaseUrl = (url: string): string => {
  try {
    const cleanUrl = url.replace(/\/+$/, "")
    const parsed = new URL(cleanUrl)
    if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") {
      throw new Error("Insecure protocol (HTTPS required in production)")
    }
    return parsed.origin
  } catch (error) {
    console.error("[youverify] CRITICAL CONFIG ERROR:", {
      error: error instanceof Error ? error.message : "Invalid URL",
      providedUrl: url ? `${url.substring(0, 50)}...` : "EMPTY",
      environment: process.env.NODE_ENV,
    })
    if (process.env.NODE_ENV === "production") {
      throw new Error("YOUVERIFY_BASE_URL must be a valid HTTPS URL in production")
    }
    console.warn("[youverify] Falling back to sandbox URL")
    return "https://api.sandbox.youverify.co"
  }
}

const YOUVERIFY_BASE_URL = getValidatedBaseUrl(
  process.env.YOUVERIFY_BASE_URL || "https://api.sandbox.youverify.co"
)

const YOUVERIFY_TOKEN =
  process.env.YOUVERIFY_API_KEY ||
  process.env.YOUVERIFY_API_SECRET ||
  process.env.YOUVERIFY_API_TOKEN

if (!YOUVERIFY_TOKEN) {
  console.error("[youverify] MISSING API TOKEN - Check your .env file")
}

const SESSION_GENERATE_PATH = "/v2/api/identity/sdk/liveness/session/generate"
const LIVENESS_TOKEN_PATH = "/v2/api/identity/sdk/liveness/token"

// ==================== API CLIENT ====================
const TIMEOUT_MS = 15000

async function youverifyFetch(
  endpoint: string,
  options: RequestInit & { body?: string } = {}
): Promise<{ response: Response; data: unknown }> {
  const url = `${YOUVERIFY_BASE_URL}${endpoint}`
  const headers: Record<string, string> = {
    token: YOUVERIFY_TOKEN || "",
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (response.status === 429) {
      console.warn("[youverify] Rate limit exceeded")
      throw new Error("RATE_LIMIT")
    }

    let data: unknown
    try {
      data = await response.json()
    } catch {
      data = { _raw: await response.text() }
    }

    if (!response.ok) {
      const errorInfo = {
        status: response.status,
        statusText: response.statusText,
        endpoint,
        errorCode: (data as { error?: { code?: string }; code?: string })?.error?.code ?? (data as { code?: string })?.code,
        errorType: (data as { error?: { type?: string }; error?: string })?.error?.type ?? (data as { error?: string })?.error,
      }
      console.error(`[youverify] API Error ${response.status}:`, errorInfo)

      if (response.status === 401) throw new Error("AUTH_ERROR")
      if (response.status === 404) throw new Error("ENDPOINT_NOT_FOUND")
      throw new Error("NETWORK_ERROR")
    }

    return { response, data }
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        console.error("[youverify] Request timeout (15s) exceeded")
        throw new Error("TIMEOUT")
      }
      if (error.message === "RATE_LIMIT") throw new Error("RATE_LIMIT")
      if (error.message === "AUTH_ERROR") throw new Error("AUTH_ERROR")
      if (error.message === "ENDPOINT_NOT_FOUND") throw new Error("ENDPOINT_NOT_FOUND")
    }
    console.error("[youverify] Network/Unknown Error:", {
      error: error instanceof Error ? error.message : "Unknown",
      endpoint,
    })
    throw new Error("NETWORK_ERROR")
  }
}

// ==================== HANDLERS ====================

export async function POST() {
  const requestId = Date.now().toString(36) + Math.random().toString(36).substring(2)
  console.log(`[youverify][${requestId}] Starting verification session`)

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

    let sessionId: string | undefined
    let expiresAt: string | undefined

    const publicMerchantId = process.env.NEXT_PUBLIC_YOUVERIFY_MERCHANT_KEY
    if (publicMerchantId) {
      try {
        const { data } = await youverifyFetch(LIVENESS_TOKEN_PATH, {
          method: "POST",
          body: JSON.stringify({ publicMerchantID: publicMerchantId }),
        })
        const d = data as { data?: { sessionId?: string; expiresAt?: string } }
        sessionId = d?.data?.sessionId
        expiresAt = d?.data?.expiresAt
      } catch (err) {
        const msg = err instanceof Error ? err.message : ""
        if (msg !== "ENDPOINT_NOT_FOUND" && msg !== "RATE_LIMIT" && msg !== "AUTH_ERROR") {
          // 404 is expected when token endpoint not enabled; continue to session/generate
        }
      }
    }

    if (!sessionId) {
      const { data } = await youverifyFetch(SESSION_GENERATE_PATH, {
        method: "POST",
        body: JSON.stringify({
          ttlSeconds: 300,
          metadata: { userId: user.id, email: user.email },
        }),
      })
      const d = data as { data?: { sessionId?: string; expiresAt?: string } }
      sessionId = d?.data?.sessionId
      expiresAt = d?.data?.expiresAt
    }

    if (!sessionId) {
      console.error(`[youverify][${requestId}] Invalid session response (no sessionId)`)
      return NextResponse.json(
        {
          error: "Invalid session response from YouVerify",
          message: "Invalid session response from YouVerify",
        },
        { status: 502 }
      )
    }

    console.log(`[youverify][${requestId}] Session created successfully`)
    return NextResponse.json({ sessionId, expiresAt })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "UNKNOWN"
    console.error(`[youverify][${requestId}] Failed:`, errorMessage)

    switch (errorMessage) {
      case "RATE_LIMIT":
        return NextResponse.json(
          { error: "Too many requests. Please try again in a moment.", message: "Too many requests. Please try again in a moment." },
          { status: 429 }
        )
      case "TIMEOUT":
        return NextResponse.json(
          { error: "Verification service is temporarily unavailable. Please try again.", message: "Verification service is temporarily unavailable. Please try again." },
          { status: 504 }
        )
      case "AUTH_ERROR":
        return NextResponse.json(
          { error: "Verification service configuration error. Please contact support.", message: "Verification service configuration error. Please contact support." },
          { status: 502 }
        )
      case "ENDPOINT_NOT_FOUND":
        return NextResponse.json(
          {
            error: "Verification endpoint not found. Check YOUVERIFY_BASE_URL (Sandbox: https://api.sandbox.youverify.co, Production: https://api.youverify.co) and API key from YVOS.",
            message: "Verification endpoint not found. Check YOUVERIFY_BASE_URL and API key from YVOS.",
          },
          { status: 502 }
        )
      case "NETWORK_ERROR":
        return NextResponse.json(
          { error: "Unable to reach verification service. Please try again.", message: "Unable to reach verification service. Please try again." },
          { status: 502 }
        )
      default:
        return NextResponse.json(
          { error: "Failed to create verification session", message: "Failed to create verification session" },
          { status: 500 }
        )
    }
  }
}

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    baseUrl: YOUVERIFY_BASE_URL.replace(/^https?:\/\//, "***://"),
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
}
