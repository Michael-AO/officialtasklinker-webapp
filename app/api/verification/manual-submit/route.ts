import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const supabase = createClient()

    // Extract form data
    const userType = formData.get('userType') as string
    const verificationType = formData.get('verificationType') as string
    const phone = formData.get('phone') as string
    const address = formData.get('address') as string
    const idType = formData.get('idType') as string
    const idNumber = formData.get('idNumber') as string
    const additionalInfo = formData.get('additionalInfo') as string

    // Get user information from session
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', session.user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ 
        error: "Failed to get user information" 
      }, { status: 500 })
    }

    // Extract files
    const files: Array<{ file: File; type: string }> = []
    let fileIndex = 0
    while (formData.has(`document_${fileIndex}`)) {
      const file = formData.get(`document_${fileIndex}`) as File
      const type = formData.get(`document_type_${fileIndex}`) as string
      files.push({ file, type })
      fileIndex++
    }

    // Upload files to Supabase Storage
    const uploadedFiles: Array<{ filename: string; type: string; url: string }> = []
    
    for (const { file, type } of files) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${session.user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('verification-documents')
        .upload(fileName, file, {
          contentType: file.type,
          upsert: false
        })

      if (uploadError) {
        console.error('File upload error:', uploadError)
        return NextResponse.json({ 
          error: "Failed to upload documents. Please try again." 
        }, { status: 500 })
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('verification-documents')
        .getPublicUrl(fileName)

      uploadedFiles.push({
        filename: file.name,
        type,
        url: urlData.publicUrl
      })
    }

    // Create verification request in database
    const { data: verificationRequest, error: dbError } = await supabase
      .from('manual_verification_requests')
      .insert({
        user_id: session.user.id,
        verification_type: verificationType,
        status: 'pending',
        submitted_at: new Date().toISOString(),
        personal_info: {
          full_name: userData.name,
          email: userData.email,
          phone,
          address,
          id_type: idType,
          id_number: idNumber
        },
        business_info: null, // No business info needed
        documents: uploadedFiles,
        additional_info: additionalInfo,
        admin_notes: null
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ 
        error: "Failed to submit verification request. Please try again." 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: verificationRequest,
      message: "Verification request submitted successfully. You'll be notified within 30 minutes."
    })

  } catch (error) {
    console.error('Manual verification submission error:', error)
    return NextResponse.json({ 
      error: "Internal server error. Please try again." 
    }, { status: 500 })
  }
}
