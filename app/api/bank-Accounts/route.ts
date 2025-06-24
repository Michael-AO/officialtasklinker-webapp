import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { bankName, bankCode, accountNumber, accountName } = body

    // Validate required fields
    if (!bankName || !bankCode || !accountNumber || !accountName) {
      return NextResponse.json(
        {
          error: "Missing required fields",
        },
        { status: 400 },
      )
    }

    // Insert bank account into database
    const { data, error } = await supabase
      .from("bank_accounts")
      .insert({
        user_id: user.id,
        bank_name: bankName,
        bank_code: bankCode,
        account_number: accountNumber,
        account_name: accountName,
        is_default: false,
        is_verified: true, // In production, this would be false until verified
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json(
        {
          error: "Failed to save bank account",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        bankName: data.bank_name,
        bankCode: data.bank_code,
        accountNumber: data.account_number,
        accountName: data.account_name,
        isDefault: data.is_default,
        isVerified: data.is_verified,
        addedDate: data.created_at,
      },
    })
  } catch (error) {
    console.error("Bank account creation error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch user's bank accounts
    const { data: bankAccounts, error } = await supabase
      .from("bank_accounts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json(
        {
          error: "Failed to fetch bank accounts",
        },
        { status: 500 },
      )
    }

    // Transform data to match frontend expectations
    const transformedData = bankAccounts.map((account) => ({
      id: account.id,
      bankName: account.bank_name,
      bankCode: account.bank_code,
      accountNumber: account.account_number,
      accountName: account.account_name,
      isDefault: account.is_default,
      isVerified: account.is_verified,
      addedDate: account.created_at,
    }))

    return NextResponse.json({
      success: true,
      data: transformedData,
    })
  } catch (error) {
    console.error("Bank accounts fetch error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
