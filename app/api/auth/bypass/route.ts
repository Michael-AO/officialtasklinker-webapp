/**
 * Bypass auth: log in by email only (no password). For now always enabled; only checks that the email exists.
 * Allowed email: asereope@gmail.com only.
 */
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { ServerSessionManager, getCookieDomain } from "@/lib/server-session-manager"

const BYPASS_ALLOWED_EMAIL = "asereope@gmail.com"

function isBypassEnabled(): boolean {
  return true
}

export async function GET(request: NextRequest) {
  if (!isBypassEnabled()) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const email = request.nextUrl.searchParams.get("email")?.trim().toLowerCase()
  if (email !== BYPASS_ALLOWED_EMAIL) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("error", "Bypass only allowed for the configured email.")
    return NextResponse.redirect(loginUrl)
  }

  const supabase = createServerClient()
  const { data: user, error } = await supabase
    .from("users")
    .select("id, email, user_type, name, is_verified, is_active")
    .eq("email", email)
    .maybeSingle()

  if (error || !user) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("error", "User not found. Sign up first.")
    return NextResponse.redirect(loginUrl)
  }

  if (user.is_active === false) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("error", "Account is deactivated.")
    return NextResponse.redirect(loginUrl)
  }

  const metadata = {
    ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
    userAgent: request.headers.get("user-agent") || "unknown",
  }

  const sessionToken = await ServerSessionManager.createSession(
    {
      id: user.id,
      email: user.email,
      user_type: user.user_type as "freelancer" | "client" | "admin",
      name: user.name ?? undefined,
      is_verified: user.is_verified ?? false,
    },
    metadata
  )

  const isProduction = process.env.NODE_ENV === "production"
  const cookieDomain = getCookieDomain()
  const canonicalOrigin = isProduction
    ? (process.env.NEXT_PUBLIC_APP_URL || "https://tasklinkers.com").replace(/\/$/, "")
    : request.nextUrl.origin
  const nextPath = request.nextUrl.searchParams.get("next")?.trim()
  const path = nextPath?.startsWith("/") ? nextPath : "/dashboard"
  const redirectUrl = new URL(path, canonicalOrigin)
  const redirectHref = redirectUrl.toString().replace(/&/g, "&amp;").replace(/"/g, "&quot;")
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${redirectHref}"></head><body>Redirecting to dashboard…</body></html>`
  const res = new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  })
  res.cookies.set(ServerSessionManager.COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
    ...(cookieDomain && { domain: cookieDomain }),
  })
  return res
}
