import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // In a real app, fetch from database
    const settings = {
      name: "TaskLance",
      email: "admin@tasklance.com",
      phone: "+234 800 123 4567",
      address: "123 Business District, Lagos, Nigeria",
      escrowFeePercentage: 2.5,
      withdrawalFeeFlat: 1000,
      withdrawalFeePercentage: 2.5,
      withdrawalFeeMax: 10000,
      minimumWithdrawal: 10000,
      maximumWithdrawal: 500000000,
      autoReleaseEnabled: true,
      autoReleaseDays: 7,
      disputeResolutionFee: 500,
    }

    return NextResponse.json({
      success: true,
      data: settings,
    })
  } catch (error) {
    console.error("Settings fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const settings = await request.json()

    // In a real app, you would:
    // 1. Validate admin permissions
    // 2. Validate settings data
    // 3. Save to database
    // 4. Clear any relevant caches

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
    })
  } catch (error) {
    console.error("Settings update error:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
