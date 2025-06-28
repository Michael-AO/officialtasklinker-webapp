import { createServerClient } from "@/lib/supabase"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    const { bankName, bankCode, accountNumber, accountName, userId } = body

    // Insert into Supabase
    const { data, error } = await supabase
      .from("bank_accounts")
      .insert({
        user_id: userId,
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
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("bank_accounts")
      .select("*")
      .eq("user_id", userId)
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
