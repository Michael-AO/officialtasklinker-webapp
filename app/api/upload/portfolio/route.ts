import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    console.log("=== PORTFOLIO UPLOAD API START ===")

    // Get user ID from headers
    const userId = request.headers.get("user-id")
    
    if (!userId) {
      console.error("❌ No user ID provided in headers")
      return NextResponse.json({ 
        success: false, 
        error: "User ID required" 
      }, { status: 401 })
    }

    console.log("🔍 Uploading portfolio file for user:", userId)

    // Get the form data
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.error("❌ No file provided in form data")
      return NextResponse.json({ 
        success: false, 
        error: "No file provided" 
      }, { status: 400 })
    }

    console.log("📄 File details:", {
      name: file.name,
      size: file.size,
      type: file.type
    })

    // Validate file size (max 10MB for portfolio files)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      console.error("❌ File too large:", file.size)
      return NextResponse.json({ 
        success: false, 
        error: "File too large. Maximum size is 10MB." 
      }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg", "image/png", "image/gif", "image/webp",
      "application/pdf", "application/msword", 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain"
    ]
    if (!allowedTypes.includes(file.type)) {
      console.error("❌ Invalid file type:", file.type)
      return NextResponse.json({ 
        success: false, 
        error: "Invalid file type. Only images, PDFs, documents, and text files are allowed." 
      }, { status: 400 })
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const fileName = `${userId}/portfolio/${Date.now()}.${fileExtension}`

    console.log("📁 Uploading file to path:", fileName)

    // Create server-side client with service role key
    const supabase = createServerClient()

    // Upload to Supabase Storage (using avatars bucket for now, can create portfolio bucket later)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error("❌ Upload error:", uploadError)
      console.error("❌ Upload error details:", {
        message: uploadError.message,
        name: uploadError.name
      })
      return NextResponse.json({ 
        success: false, 
        error: `Failed to upload file: ${uploadError.message}` 
      }, { status: 500 })
    }

    console.log("✅ File uploaded successfully, upload data:", uploadData)

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    const publicUrl = urlData.publicUrl

    console.log("✅ Public URL generated:", publicUrl)

    return NextResponse.json({
      success: true,
      message: "Portfolio file uploaded successfully",
      data: {
        url: publicUrl,
        fileName: fileName,
        size: file.size,
        type: file.type
      }
    })

  } catch (error) {
    console.error("=== PORTFOLIO UPLOAD API ERROR ===")
    console.error("Unexpected error:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")

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