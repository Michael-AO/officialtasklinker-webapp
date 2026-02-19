/**
 * Password login: validate "tasklinkers" password and look up user by email.
 * POST body: { email, password, user_type?: 'freelancer' | 'client', redirect?: string }
 */
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { ServerSessionManager } from "@/lib/server-session-manager"

const HARDCODED_PASSWORD = "tasklinkers"
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isSafeRedirect(path: string): boolean {
  return path.startsWith("/") && !path.includes("//")
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
    const password = typeof body.password === "string" ? body.password : ""
    const userType = body.user_type === "client" || body.user_type === "freelancer" ? body.user_type : undefined
    const redirectParam = typeof body.redirect === "string" ? body.redirect.trim() : ""

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required." },
        { status: 400 }
      )
    }
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format." },
        { status: 400 }
      )
    }
    if (password !== HARDCODED_PASSWORD) {
      return NextResponse.json(
        { success: false, error: "Invalid password." },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("id, email, user_type, name, is_verified, is_active")
      .eq("email", email)
      .maybeSingle()

    if (fetchError) {
      console.error("[login-password] DB error:", fetchError)
      return NextResponse.json(
        { success: false, error: "Unable to verify account. Please try again." },
        { status: 500 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "No account found with this email. Please sign up first." },
        { status: 400 }
      )
    }

    if (user.is_active === false) {
      return NextResponse.json(
        { success: false, error: "Your account has been deactivated. Please contact support." },
        { status: 400 }
      )
    }

    if (userType && user.user_type !== userType) {
      return NextResponse.json(
        {
          success: false,
          error: `This email is registered as a ${user.user_type}. Please use the correct account type.`,
        },
        { status: 400 }
      )
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

    let redirectPath = user.user_type === "admin" ? "/admin/dashboard" : "/dashboard"
    if (redirectParam && isSafeRedirect(redirectParam)) {
      redirectPath = redirectParam
    }
    const isProduction = process.env.NODE_ENV === "production"

    // 200 HTML redirect so browser persists Set-Cookie before navigation (fixes production redirect-back-to-login)
    const canonicalOrigin =
      isProduction
        ? (process.env.NEXT_PUBLIC_APP_URL || "https://tasklinkers.com").replace(/\/$/, "")
        : null
    const redirectUrl = canonicalOrigin
      ? new URL(redirectPath, canonicalOrigin)
      : new URL(redirectPath, request.nextUrl.origin)
    const redirectHref = redirectUrl.toString().replace(/&/g, "&amp;").replace(/"/g, "&quot;")
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${redirectHref}"></head><body>Redirecting to dashboard…</body></html>`
    const res = new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Redirect-To": redirectPath,
      },
    })
    // Omit domain so cookie is host-only (fixes "coming back to login" when domain was set)
    res.cookies.set(ServerSessionManager.COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    })
    return res
  } catch (error) {
    console.error("[login-password] error:", error)
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    )
  }
}
