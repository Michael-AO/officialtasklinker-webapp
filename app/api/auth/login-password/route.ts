/**
 * Password login (temporary: hardcoded password "tasklinkers" while email is unavailable).
 * POST body: { email, password, user_type?: 'freelancer' | 'client' }
 * Only allows login if email exists in users table.
 */
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { ServerSessionManager } from "@/lib/server-session-manager"

const HARDCODED_PASSWORD = "tasklinkers"
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
    const password = typeof body.password === "string" ? body.password : ""
    const userType = body.user_type === "client" || body.user_type === "freelancer" ? body.user_type : undefined

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

    await ServerSessionManager.createSession(
      {
        id: user.id,
        email: user.email,
        user_type: user.user_type as "freelancer" | "client" | "admin",
        name: user.name ?? undefined,
        is_verified: user.is_verified ?? false,
      },
      metadata
    )

    const redirect = user.user_type === "admin" ? "/admin/dashboard" : "/dashboard"
    return NextResponse.json({ success: true, redirect })
  } catch (error) {
    console.error("[login-password] error:", error)
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    )
  }
}
