import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("Test API: Checking environment variables...")
    
    const envCheck = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasPaystackKey: !!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      hasBrevoKey: !!process.env.NEXT_PUBLIC_BREVO_API_KEY,
    }
    
    console.log("Test API: Environment check:", envCheck)
    
    return NextResponse.json({
      success: true,
      message: "API is working",
      timestamp: new Date().toISOString(),
      environment: envCheck,
    })
  } catch (error) {
    console.error("Test API error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 })
  }
} 