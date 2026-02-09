/**
 * Dev only: create a session for a test user and redirect to a page (e.g. YouVerify test).
 * GET /api/debug/login-as-test?redirect=/dashboard/youverify-test
 * Optional: ?email=user@example.com to log in as a specific user (must exist in users table).
 */
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { ServerSessionManager } from "@/lib/server-session-manager"

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 404 })
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const redirectTo = searchParams.get("redirect") || "/dashboard/youverify-test"
    const email = searchParams.get("email")

    const supabase = createServerClient()
    let user: { id: string; email: string; user_type: string; name?: string; is_verified?: boolean } | null

    if (email) {
      const { data, error } = await supabase
        .from("users")
        .select("id, email, user_type, name, is_verified")
        .eq("email", email)
        .single()
      if (error || !data) {
        return NextResponse.json(
          { error: "User not found. Use ?email= to specify an existing user." },
          { status: 404 }
        )
      }
      user = data
    } else {
      const { data, error } = await supabase
        .from("users")
        .select("id, email, user_type, name, is_verified")
        .limit(1)
        .single()
      if (error || !data) {
        return NextResponse.json(
          { error: "No users in database. Sign up first or use ?email=your@email.com" },
          { status: 404 }
        )
      }
      user = data
    }

    const sessionToken = await ServerSessionManager.createSession(
      {
        id: user.id,
        email: user.email,
        user_type: user.user_type as "freelancer" | "client" | "admin",
        name: user.name,
        is_verified: user.is_verified,
      },
      {
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      }
    )

    const url = new URL(redirectTo.startsWith("/") ? redirectTo : `/${redirectTo}`, request.url)
    const res = NextResponse.redirect(url)
    res.cookies.set(ServerSessionManager.COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    })
    return res
  } catch (err) {
    console.error("[debug/login-as-test]", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create session" },
      { status: 500 }
    )
  }
}
