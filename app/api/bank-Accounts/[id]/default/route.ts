import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // In a real app, you would:
    // 1. Validate user ownership
    // 2. Set all other accounts to non-default
    // 3. Set this account as default

    return NextResponse.json({
      success: true,
      message: "Default account updated successfully",
    })
  } catch (error) {
    console.error("Default account update error:", error)
    return NextResponse.json({ error: "Failed to update default account" }, { status: 500 })
  }
}
