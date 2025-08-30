import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Test auth API called")
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log("🔍 Test auth result:", {
      hasUser: !!user,
      userId: user?.id,
      email: user?.email,
      authError: authError?.message
    })
    
    if (authError || !user) {
      return NextResponse.json(
        { 
          authenticated: false, 
          error: authError?.message || "No user found",
          timestamp: new Date().toISOString()
        },
        { status: 401 }
      )
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error("❌ Test auth error:", error)
    return NextResponse.json(
      { 
        authenticated: false, 
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
