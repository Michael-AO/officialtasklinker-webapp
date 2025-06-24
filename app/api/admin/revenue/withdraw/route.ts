import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a service role client that bypasses RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
)

export async function POST(request: Request) {
  try {
    const { amount, bankName, accountNumber, accountName } = await request.json()

    console.log("🔄 Starting withdrawal process...")
    console.log("📊 Request data:", { amount, bankName, accountNumber, accountName })

    // Validate required fields
    if (!amount || !bankName || !accountNumber || !accountName) {
      console.error("❌ Missing required fields")
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Validate amount
    const numericAmount = Number.parseFloat(amount.toString())
    if (isNaN(numericAmount) || numericAmount < 100) {
      console.error("❌ Invalid amount:", amount)
      return NextResponse.json({ success: false, message: "Minimum withdrawal amount is ₦100" }, { status: 400 })
    }

    // Generate withdrawal reference
    const reference = `WD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    console.log("📝 Generated reference:", reference)

    // Test database connection using admin client
    console.log("🔍 Testing database connection with admin privileges...")
    try {
      const { count, error: countError } = await supabaseAdmin
        .from("admin_withdrawals")
        .select("*", { count: "exact", head: true })

      if (countError) {
        console.error("❌ Database connection test failed:", countError)
        return NextResponse.json(
          {
            success: false,
            message: "Database connection failed. Table may not exist or have permission issues.",
            error: countError.message,
            code: countError.code,
            suggestion: "Please run the database setup script: scripts/41-admin-withdrawals-rls-fix.sql",
          },
          { status: 500 },
        )
      }

      console.log("✅ Database connection successful. Current records:", count)
    } catch (connectionError: any) {
      console.error("❌ Database connection error:", connectionError)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to connect to database",
          error: connectionError.message,
        },
        { status: 500 },
      )
    }

    // Simulate processing delay
    console.log("⏳ Processing withdrawal...")
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Prepare withdrawal data
    const withdrawalData = {
      amount: numericAmount,
      bank_name: String(bankName),
      account_number: String(accountNumber),
      account_name: String(accountName),
      reference: String(reference),
      paystack_reference: `sim_${reference}`,
      status: "success" as const,
      processed_at: new Date().toISOString(),
      metadata: {
        simulation: true,
        processed_by: "admin_system",
        bank_display_name: getBankDisplayName(bankName),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        client_type: "admin_service_role",
      },
    }

    console.log("💾 Inserting withdrawal record using admin client...")

    // Insert the withdrawal record using admin client (bypasses RLS)
    const { data: insertedWithdrawal, error: insertError } = await supabaseAdmin
      .from("admin_withdrawals")
      .insert(withdrawalData)
      .select()
      .single()

    if (insertError) {
      console.error("❌ Database insert failed:")
      console.error("Error message:", insertError.message)
      console.error("Error code:", insertError.code)
      console.error("Error details:", insertError.details)

      // Provide helpful error messages based on common issues
      let helpfulMessage = "Failed to record withdrawal in database"
      let suggestion = "Check database setup and permissions"

      if (insertError.code === "23505") {
        helpfulMessage = "Duplicate withdrawal reference. Please try again."
        suggestion = "Wait a moment and retry the withdrawal"
      } else if (insertError.code === "42501") {
        helpfulMessage = "Database permission error. RLS may be blocking the operation."
        suggestion = "Run scripts/41-admin-withdrawals-rls-fix.sql to fix RLS policies"
      } else if (insertError.code === "42P01") {
        helpfulMessage = "Table does not exist."
        suggestion = "Run scripts/41-admin-withdrawals-rls-fix.sql to create the table"
      } else if (insertError.message.includes("RLS")) {
        helpfulMessage = "Row Level Security is blocking this operation."
        suggestion = "Run scripts/41-admin-withdrawals-rls-fix.sql to fix RLS policies"
      }

      return NextResponse.json(
        {
          success: false,
          message: helpfulMessage,
          error: insertError.message,
          code: insertError.code,
          suggestion: suggestion,
          debug_info: {
            using_admin_client: true,
            service_role_available: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          },
        },
        { status: 500 },
      )
    }

    console.log("✅ Withdrawal recorded successfully!")
    console.log("📋 Record details:", insertedWithdrawal)

    // Try to update company revenue (optional)
    try {
      console.log("🔄 Updating company revenue status...")
      const { data: updatedRevenue, error: updateError } = await supabaseAdmin
        .from("company_revenue")
        .update({
          status: "remitted",
          remitted_at: new Date().toISOString(),
          reference: reference,
        })
        .eq("status", "pending")
        .select()

      if (updateError) {
        console.warn("⚠️ Revenue update failed (non-critical):", updateError.message)
      } else {
        console.log("✅ Revenue status updated for", updatedRevenue?.length || 0, "records")
      }
    } catch (revenueError) {
      console.warn("⚠️ Revenue update error (non-critical):", revenueError)
    }

    console.log("🎉 Withdrawal process completed successfully!")

    return NextResponse.json({
      success: true,
      reference: reference,
      paystack_reference: `sim_${reference}`,
      message: `✅ SIMULATED: ₦${numericAmount.toLocaleString()} withdrawal completed successfully!`,
      mode: "simulation",
      details: {
        id: insertedWithdrawal.id,
        bank: getBankDisplayName(bankName),
        account: accountNumber,
        amount: numericAmount,
        status: "success",
        created_at: insertedWithdrawal.created_at,
        reference: reference,
      },
    })
  } catch (error: any) {
    console.error("❌ Unexpected error in withdrawal process:")
    console.error("Error message:", error.message)
    console.error("Error stack:", error.stack)

    return NextResponse.json(
      {
        success: false,
        message: "Unexpected error during withdrawal",
        error: error.message,
        type: error.constructor.name,
        suggestion: "Check console logs for detailed error information",
      },
      { status: 500 },
    )
  }
}

// Helper function to get display name for banks
function getBankDisplayName(bankCode: string): string {
  const bankNames: { [key: string]: string } = {
    "access-bank": "Access Bank",
    gtbank: "GTBank",
    "zenith-bank": "Zenith Bank",
    "first-bank": "First Bank",
    uba: "UBA",
    "fidelity-bank": "Fidelity Bank",
    "union-bank": "Union Bank",
    "sterling-bank": "Sterling Bank",
    "stanbic-ibtc": "Stanbic IBTC",
    fcmb: "FCMB",
    ecobank: "Ecobank",
    "wema-bank": "Wema Bank",
    "polaris-bank": "Polaris Bank",
    "keystone-bank": "Keystone Bank",
    "providus-bank": "Providus Bank",
  }

  return bankNames[bankCode] || bankCode.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())
}
