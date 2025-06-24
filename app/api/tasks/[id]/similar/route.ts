import { type NextRequest, NextResponse } from "next/server"

// Helper function to convert simple ID to UUID format
function convertToUUID(id: string): string {
  // Check if it's already a UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (uuidRegex.test(id)) {
    return id
  }

  // Convert simple ID to UUID format
  const padded = id.padStart(8, "0")
  return `${padded.slice(0, 8)}-0000-4000-8000-000000000000`
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const taskId = convertToUUID(params.id)

    // For now, return empty similar tasks to avoid the 404 error
    // You can implement actual similar task logic later
    return NextResponse.json({
      success: true,
      tasks: [],
    })
  } catch (error) {
    console.error("Similar tasks error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch similar tasks",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
