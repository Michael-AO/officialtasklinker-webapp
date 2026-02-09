import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { ServerSessionManager } from "@/lib/server-session-manager"

export async function POST(request: NextRequest) {
  try {
    console.log("=== AVATAR UPLOAD API START ===")

    const user = await ServerSessionManager.getCurrentUser()
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: "User ID required" 
      }, { status: 401 })
    }

    const userId = user.id
    console.log("🔍 Uploading avatar for user:", userId)

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

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      console.error("❌ Invalid file type:", file.type)
      return NextResponse.json({ 
        success: false, 
        error: "Invalid file type. Only JPG, PNG, GIF, and WebP are allowed." 
      }, { status: 400 })
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      console.error("❌ File too large:", file.size)
      return NextResponse.json({ 
        success: false, 
        error: "File too large. Maximum size is 5MB." 
      }, { status: 400 })
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExtension}`

    console.log("📁 Uploading file to path:", fileName)

    // Create server-side client with service role key
    const supabase = createServerClient()

    // Upload to Supabase Storage
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

    // Update user's avatar_url in database using enhanced function with cleanup
    try {
      const { error: updateError } = await supabase
        .rpc('update_user_avatar_with_cleanup', {
          user_id: userId,
          avatar_url: publicUrl
        })

      if (updateError) {
        console.error("❌ Database update error:", updateError)
        
        // Fallback: try the original function
        const { error: fallbackError } = await supabase
          .rpc('update_user_avatar', {
            user_id: userId,
            avatar_url: publicUrl
          })

        if (fallbackError) {
          console.error("❌ Fallback RPC error:", fallbackError)
          
          // Final fallback: try direct SQL query
          const { error: sqlError } = await supabase
            .from("users")
            .update({
              avatar_url: publicUrl,
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId)

          if (sqlError) {
            console.error("❌ Final fallback SQL update error:", sqlError)
            console.warn("⚠️ File uploaded but failed to update database")
            // Continue anyway - the file is uploaded and we can return the URL
          } else {
            console.log("✅ Database updated successfully via final fallback")
          }
        } else {
          console.log("✅ Database updated successfully via fallback RPC")
        }
      } else {
        console.log("✅ Database updated successfully via enhanced RPC with cleanup")
      }
    } catch (dbError) {
      console.error("❌ Database update exception:", dbError)
      console.warn("⚠️ File uploaded but database update failed")
      // Continue anyway - the file is uploaded and we can return the URL
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