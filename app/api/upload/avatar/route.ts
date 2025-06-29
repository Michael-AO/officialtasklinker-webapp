import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    console.log("=== AVATAR UPLOAD API START ===")

    // Get user ID from headers
    const userId = request.headers.get("user-id")
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: "User ID required" 
      }, { status: 401 })
    }

    console.log("🔍 Uploading avatar for user:", userId)

    // Get the form data
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: "No file provided" 
      }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid file type. Only JPG, PNG, GIF, and WebP are allowed." 
      }, { status: 400 })
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        error: "File too large. Maximum size is 5MB." 
      }, { status: 400 })
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExtension}`

    console.log("📁 Uploading file:", fileName)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error("❌ Upload error:", uploadError)
      return NextResponse.json({ 
        success: false, 
        error: `Failed to upload file: ${uploadError.message}` 
      }, { status: 500 })
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    const publicUrl = urlData.publicUrl

    console.log("✅ File uploaded successfully:", publicUrl)

    // Update user's avatar_url in database
    const { error: updateError } = await supabase
      .from("users")
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (updateError) {
      console.error("❌ Database update error:", updateError)
      // Don't fail the upload if database update fails
      console.warn("⚠️ File uploaded but failed to update database")
    }

    return NextResponse.json({
      success: true,
      message: "Avatar uploaded successfully",
      data: {
        url: publicUrl,
        fileName: fileName,
        size: file.size,
        type: file.type
      }
    })

  } catch (error) {
    console.error("=== AVATAR UPLOAD API ERROR ===")
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