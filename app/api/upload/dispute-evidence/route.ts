import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { ServerSessionManager } from "@/lib/server-session-manager"

const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
]

function sanitizeFileName(name: string): string {
  const ext = name.includes(".") ? name.split(".").pop() || "" : ""
  const base = name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100)
  return ext ? `${base}.${ext}` : base
}

export async function POST(request: NextRequest) {
  try {
    const user = await ServerSessionManager.getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const formData = await request.formData()
    const fileList = formData.getAll("file") as File[]
    const files: File[] = fileList.length > 0 ? fileList : formData.get("file") ? [formData.get("file") as File] : []

    if (!files.length || (files.length === 1 && !files[0]?.size)) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    const supabase = createServerClient()
    const urls: string[] = []
    const timestamp = Date.now()

    for (const file of files) {
      if (!file || typeof file.size !== "number") continue
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { success: false, error: "File too large. Maximum size is 10MB per file." },
          { status: 400 },
        )
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: "Invalid file type. Allowed: images, PDF, text." },
          { status: 400 },
        )
      }

      const safeName = sanitizeFileName(file.name) || `file-${timestamp}`
      const fileName = `${user.id}/${timestamp}_${safeName}`

      const { error: uploadError } = await supabase.storage
        .from("dispute-evidence")
        .upload(fileName, file, { cacheControl: "3600", upsert: false })

      if (uploadError) {
        console.error("[dispute-evidence] Upload error:", uploadError)
        return NextResponse.json(
          { success: false, error: `Upload failed: ${uploadError.message}` },
          { status: 500 },
        )
      }

      const { data: urlData } = supabase.storage.from("dispute-evidence").getPublicUrl(fileName)
      urls.push(urlData.publicUrl)
    }

    return NextResponse.json({ success: true, urls })
  } catch (error) {
    console.error("[dispute-evidence] Error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    )
  }
}
