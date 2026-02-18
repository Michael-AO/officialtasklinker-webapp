/**
 * Password signup (temporary: hardcoded password "tasklinkers" while email is unavailable).
 * POST body: { email, password, user_type: 'freelancer' | 'client', first_name?: string, last_name?: string }
 * Creates user only if email is not in database; new users have is_verified: false so dashboard shows verification modal.
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
    const userType = body.user_type === "client" || body.user_type === "freelancer" ? body.user_type : null
    const firstName = typeof body.first_name === "string" ? body.first_name.trim() : ""
    const lastName = typeof body.last_name === "string" ? body.last_name.trim() : ""

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
    if (!userType) {
      return NextResponse.json(
        { success: false, error: "Please choose Freelancer or Client." },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists. Please log in instead." },
        { status: 400 }
      )
    }

    const fullName = [firstName, lastName].filter(Boolean).join(" ") || "User"
    const now = new Date()

    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({
        email,
        user_type: userType,
        name: fullName,
        is_verified: false,
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
      .select("id, email, user_type, name")
      .single()

    if (createError || !newUser) {
      console.error("[signup-password] create user error:", createError)
      return NextResponse.json(
        { success: false, error: "Failed to create account. Please try again." },
        { status: 500 }
      )
    }

    const metadata = {
      ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    }

    await ServerSessionManager.createSession(
      {
        id: newUser.id,
        email: newUser.email,
        user_type: newUser.user_type,
        name: newUser.name ?? undefined,
        is_verified: false,
      },
      metadata
    )

    return NextResponse.json({ success: true, redirect: "/dashboard" })
  } catch (error) {
    console.error("[signup-password] error:", error)
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    )
  }
}
