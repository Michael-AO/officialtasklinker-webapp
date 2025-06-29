import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    success: false, 
    error: "Push notifications are currently disabled" 
  }, { status: 503 })
} 