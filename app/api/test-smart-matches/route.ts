import { NextResponse } from "next/server"

export async function GET() {
  console.log("=== Test smart matches API called")

  return NextResponse.json({
    success: true,
    message: "Smart matches API is working!",
    timestamp: new Date().toISOString(),
  })
}
