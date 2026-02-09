import { createServerClient } from "@/lib/supabase"
import { type NextRequest, NextResponse } from "next/server"
import { ServerSessionManager } from "@/lib/server-session-manager"

export async function POST(request: NextRequest) {
  try {
    const user = await ServerSessionManager.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "User authentication required" }, { status: 401 })
    }

    const supabase = createServerClient()
    const body = await request.json()
    const { bankName, bankCode, accountNumber, accountName } = body

    // Insert into Supabase (use session user_id)
    const { data, error } = await supabase
      .from("bank_accounts")
      .insert({
        user_id: user.id,
        bank_name: bankName,
        bank_code: bankCode,
        account_number: accountNumber,
        account_name: accountName,
        is_default: false,
        is_verified: true,
      })
      .select()
      .single()

    if (error) {
      console.error("Bank account creation error:", error)
      return NextResponse.json({ error: "Failed to create bank account" }, { status: 500 })
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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await ServerSessionManager.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "User authentication required" }, { status: 401 })
    }

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from("bank_accounts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Bank accounts fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch bank accounts" }, { status: 500 })
    }

    const formattedData = data.map((account) => ({
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
      data: formattedData,
    })
  } catch (error) {
    console.error("Bank accounts fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
