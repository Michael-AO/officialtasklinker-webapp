import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Helper function to convert simple IDs to UUID format
function convertToUUID(id: string): string {
  // Remove any non-numeric characters
  const cleanId = id.replace(/\D/g, '')
  
  if (!cleanId) {
    throw new Error("Invalid user ID - must contain numbers")
  }
  
  if (id.length === 36 && id.includes("-")) {
    return id // Already a UUID
  }
  
  // Convert simple ID like "1" to UUID format
  const paddedId = cleanId.padStart(8, "0")
  return `${paddedId}-0000-4000-8000-000000000000`
}

export async function GET(request: NextRequest) {
  try {
    console.log("=== DEBUG USER API START ===")

    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error("❌ Session error:", sessionError)
      return NextResponse.json({ 
        success: false, 
        error: `Session error: ${sessionError.message}` 
      })
    }

    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: "No active session found"
      })
    }

    const user = session.user
    console.log("✅ Current user:", {
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
        created_at: user.created_at,
        email_confirmed_at: user.email_confirmed_at
      }
    })

  } catch (error) {
    console.error("=== DEBUG USER API ERROR ===")
    console.error("Unexpected error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
} 