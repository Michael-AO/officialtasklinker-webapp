import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    success: false, 
    error: "Push notifications are currently disabled" 
  }, { status: 503 })
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({ 
    success: false, 
    error: "Push notifications are currently disabled" 
  }, { status: 503 })
} 