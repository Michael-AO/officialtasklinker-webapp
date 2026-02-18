/**
 * Admin login: email + password. Only allowed emails can sign in.
 * POST body: { email, password }
 * Allowed emails: asereopeyemimichael@gmail.com, ceo@tasklinkers.com
 * Password: ADMIN_PASSWORD env (default admin123 in dev)
 */
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { ServerSessionManager } from "@/lib/server-session-manager"

const ALLOWED_ADMIN_EMAILS = [
  "asereopeyemimichael@gmail.com",
  "ceo@tasklinkers.com",
].map((e) => e.toLowerCase())

function getAdminPassword(): string {
  const env = process.env.ADMIN_PASSWORD
  if (env) return env
  if (process.env.NODE_ENV !== "production") return "admin123"
  return ""
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
    const password = typeof body.password === "string" ? body.password : ""

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      )
    }

    if (!ALLOWED_ADMIN_EMAILS.includes(email)) {
      return NextResponse.json(
        { success: false, error: "This email is not authorized for admin access." },
        { status: 403 }
      )
    }

    const expectedPassword = getAdminPassword()
    if (!expectedPassword || password !== expectedPassword) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      )
    }

    const supabase = createServerClient()
    const { data: userRow, error: fetchError } = await supabase
      .from("users")
      .select("id, email, user_type, name, is_verified")
      .eq("email", email)
      .maybeSingle()

    if (fetchError) {
      console.error("[admin-login] DB error:", fetchError)
      return NextResponse.json(
        { success: false, error: "Unable to verify account." },
        { status: 500 }
      )
    }

    let userId: string
    let userType: "admin" = "admin"
    let name: string | null = null
    let is_verified = true

    if (userRow) {
      userId = userRow.id
      userType = (userRow.user_type as "admin") || "admin"
      name = userRow.name ?? null
      is_verified = userRow.is_verified ?? true
      if (userRow.user_type !== "admin") {
        await supabase.from("users").update({ user_type: "admin" }).eq("id", userId)
      }
    } else {
      const now = new Date()
      const displayName = email.split("@")[0] || "Admin"
      // Match columns expected by users table (see scripts/01-create-tables.sql); user_type must allow 'admin' (run scripts/33-allow-admin-user-type.sql if needed)
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert({
          email,
          name: displayName,
          user_type: "admin",
          is_verified: true,
          is_active: true,
          rating: 0,
          completed_tasks: 0,
          total_earned: 0,
          join_date: now.toISOString().slice(0, 10),
          skills: [],
          bio: "",
          location: "",
          hourly_rate: null,
          created_at: now.toISOString(),
        })
        .select("id, email, user_type, name, is_verified")
        .single()

      if (insertError || !newUser) {
        console.error("[admin-login] Insert error:", insertError)
        const hint =
          insertError?.code === "23514" || insertError?.message?.includes("check constraint")
            ? " Run scripts/33-allow-admin-user-type.sql in Supabase SQL Editor to allow admin user type."
            : ""
        return NextResponse.json(
          {
            success: false,
            error: "Unable to create admin account." + hint,
          },
          { status: 500 }
        )
      }
      userId = newUser.id
      name = newUser.name ?? null
    }

    const metadata = {
      ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    }
    const sessionToken = await ServerSessionManager.createSession(
      { id: userId, email, user_type: "admin", name: name ?? undefined, is_verified },
      metadata
    )

    const isProduction = process.env.NODE_ENV === "production"
    const res = NextResponse.json({ success: true, redirect: "/admin/dashboard" })
    // Do not set domain — let the cookie bind to the request host so it persists on reload
    res.cookies.set(ServerSessionManager.COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    })
    return res
  } catch (err) {
    console.error("[admin-login] Error:", err)
    return NextResponse.json(
      { success: false, error: "An error occurred. Please try again." },
      { status: 500 }
    )
  }
}
