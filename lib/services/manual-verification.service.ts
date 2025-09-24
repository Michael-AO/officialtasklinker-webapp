import { supabase } from '@/lib/supabase'
import { createServerClient } from '@/lib/supabase'

export interface VerificationDocument {
  type: 'front' | 'back' | 'selfie'
  file: File
  url?: string
}

export interface VerificationSubmission {
  id: string
  user_id: string
  status: 'pending' | 'under_review' | 'approved' | 'rejected'
  document_type: 'id_card' | 'voters_card' | 'drivers_license' | 'passport' | 'other'
  front_image_url?: string
  back_image_url?: string
  selfie_with_document_url?: string
  additional_notes?: string
  submitted_at: string
  reviewed_at?: string
  reviewed_by?: string
  rejection_reason?: string
  verification_score?: number
  admin_notes?: string
}

export interface DocumentRequirement {
  type: 'id_card' | 'voters_card' | 'drivers_license' | 'passport' | 'other'
  name: string
  requirements: string[]
  examples: string[]
  required_images: ('front' | 'back' | 'selfie')[]
}

export const DOCUMENT_TYPES: DocumentRequirement[] = [
  {
    type: 'id_card',
    name: 'National ID Card',
    requirements: [
      'Clear front and back photos',
      'All text must be readable',
      'No glare or reflections',
      'Document must be valid and not expired'
    ],
    examples: ['Government-issued national identification card'],
    required_images: ['front', 'back']
  },
  {
    type: 'voters_card',
    name: 'Voter Identification Card',
    requirements: [
      'Clear front photo',
      'All details visible',
      'Current registration',
      'Card must be valid'
    ],
    examples: ['INEC voters registration card'],
    required_images: ['front']
  },
  {
    type: 'drivers_license',
    name: "Driver's License",
    requirements: [
      'Clear front and back photos',
      'License number visible',
      'Expiry date readable',
      'Valid and not expired'
    ],
    examples: ['Valid driver\'s license'],
    required_images: ['front', 'back']
  },
  {
    type: 'passport',
    name: 'International Passport',
    requirements: [
      'Clear photo page',
      'All personal details visible',
      'Passport number readable',
      'Valid and not expired'
    ],
    examples: ['Valid international passport'],
    required_images: ['front']
  },
  {
    type: 'other',
    name: 'Other Government ID',
    requirements: [
      'Clear front and back photos',
      'Government-issued document',
      'All details readable',
      'Valid and current'
    ],
    examples: ['Any other government-issued identification'],
    required_images: ['front', 'back']
  }
]

export class ManualVerificationService {
  /**
   * Submit a manual verification request
   */
  async submitVerification(
    userId: string,
    documentType: string,
    documents: VerificationDocument[],
    additionalNotes?: string
  ): Promise<VerificationSubmission> {
    try {
      console.log(`🔄 Submitting manual verification for user ${userId}`)
      
      // 1. Upload documents to storage
      const uploadedDocs = await this.uploadDocuments(userId, documents)
      
      // 2. Create verification record
      const { data: submission, error } = await supabase
        .from('manual_verification_submissions')
        .insert({
          user_id: userId,
          document_type: documentType,
          front_image_url: uploadedDocs.front?.url,
          back_image_url: uploadedDocs.back?.url,
          selfie_with_document_url: uploadedDocs.selfie?.url,
          additional_notes: additionalNotes,
          status: 'pending'
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating verification submission:', error)
        throw new Error(`Failed to create verification submission: ${error.message}`)
      }

      // 3. Update user verification status
      await supabase
        .from('users')
        .update({
          manual_verification_status: 'pending',
          manual_verification_id: submission.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      console.log(`✅ Manual verification submitted: ${submission.id}`)
      return submission

    } catch (error) {
      console.error('❌ Manual verification submission error:', error)
      throw error
    }
  }

  /**
   * Upload documents to secure storage
   */
  private async uploadDocuments(
    userId: string,
    documents: VerificationDocument[]
  ): Promise<{ front?: { url: string }, back?: { url: string }, selfie?: { url: string } }> {
    const results: any = {}

    for (const doc of documents) {
      try {
        const fileName = `verification/${userId}/${doc.type}-${Date.now()}.jpg`
        
        const { data, error } = await supabase.storage
          .from('verification-documents')
          .upload(fileName, doc.file, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) {
          console.error(`❌ Error uploading ${doc.type}:`, error)
          throw new Error(`Failed to upload ${doc.type} document`)
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('verification-documents')
          .getPublicUrl(fileName)

        results[doc.type] = { url: urlData.publicUrl }
        console.log(`✅ Uploaded ${doc.type} document: ${urlData.publicUrl}`)

      } catch (error) {
        console.error(`❌ Document upload error for ${doc.type}:`, error)
        throw error
      }
    }

    return results
  }

  /**
   * Get user's verification status
   */
  async getUserVerificationStatus(userId: string): Promise<{
    status: string
    submission?: VerificationSubmission
    canSubmit: boolean
  }> {
    try {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('manual_verification_status, manual_verification_id')
        .eq('id', userId)
        .single()

      if (userError) {
        console.error('❌ Error fetching user status:', userError)
        throw new Error('Failed to fetch user verification status')
      }

      let submission: VerificationSubmission | undefined

      if (user.manual_verification_id) {
        const { data: subData, error: subError } = await supabase
          .from('manual_verification_submissions')
          .select('*')
          .eq('id', user.manual_verification_id)
          .single()

        if (!subError && subData) {
          submission = subData
        }
      }

      const canSubmit = !user.manual_verification_status || 
                       user.manual_verification_status === 'rejected' ||
                       user.manual_verification_status === 'not_submitted'

      return {
        status: user.manual_verification_status || 'not_submitted',
        submission,
        canSubmit
      }

    } catch (error) {
      console.error('❌ Error getting verification status:', error)
      throw error
    }
  }

  /**
   * Get all pending verification submissions (admin)
   */
  async getPendingSubmissions(): Promise<VerificationSubmission[]> {
    try {
      const { data, error } = await supabase
        .from('manual_verification_submissions')
        .select(`
          *,
          users!inner(email, name, user_type)
        `)
        .eq('status', 'pending')
        .order('submitted_at', { ascending: true })

      if (error) {
        console.error('❌ Error fetching pending submissions:', error)
        throw new Error('Failed to fetch pending submissions')
      }

      return data || []

    } catch (error) {
      console.error('❌ Error getting pending submissions:', error)
      throw error
    }
  }

  /**
   * Approve a verification submission (admin)
   */
  async approveVerification(
    submissionId: string,
    adminId: string,
    verificationScore: number,
    adminNotes?: string
  ): Promise<void> {
    try {
      console.log(`🔄 Approving verification ${submissionId} by admin ${adminId}`)

      // First, get the user_id from the submission
      const { data: submission, error: fetchError } = await supabase
        .from('manual_verification_submissions')
        .select('user_id')
        .eq('id', submissionId)
        .single()

      if (fetchError || !submission) {
        console.error('❌ Error fetching submission:', fetchError)
        throw new Error(`Failed to fetch submission: ${fetchError?.message}`)
      }

      // Update the submission status
      const { error: updateError } = await supabase
        .from('manual_verification_submissions')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: adminId,
          verification_score: verificationScore,
          admin_notes: adminNotes
        })
        .eq('id', submissionId)

      if (updateError) {
        console.error('❌ Error approving verification:', updateError)
        throw new Error(`Failed to approve verification: ${updateError.message}`)
      }

      // Update the user's verification status
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({
          dojah_verified: true,
          verification_type: 'manual_admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', submission.user_id)

      if (userUpdateError) {
        console.error('❌ Error updating user verification status:', userUpdateError)
        throw new Error(`Failed to update user verification: ${userUpdateError.message}`)
      }

      console.log(`✅ Verification ${submissionId} approved and user ${submission.user_id} verified`)

    } catch (error) {
      console.error('❌ Approval error:', error)
      throw error
    }
  }

  /**
   * Reject a verification submission (admin)
   */
  async rejectVerification(
    submissionId: string,
    adminId: string,
    rejectionReason: string,
    adminNotes?: string
  ): Promise<void> {
    try {
      console.log(`🔄 Rejecting verification ${submissionId} by admin ${adminId}`)

      const { error } = await supabase
        .from('manual_verification_submissions')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: adminId,
          rejection_reason: rejectionReason,
          admin_notes: adminNotes
        })
        .eq('id', submissionId)

      if (error) {
        console.error('❌ Error rejecting verification:', error)
        throw new Error(`Failed to reject verification: ${error.message}`)
      }

      // Reset user verification status
      const { data: submission } = await supabase
        .from('manual_verification_submissions')
        .select('user_id')
        .eq('id', submissionId)
        .single()

      if (submission) {
        await supabase
          .from('users')
          .update({
            manual_verification_status: 'rejected',
            updated_at: new Date().toISOString()
          })
          .eq('id', submission.user_id)
      }

      console.log(`✅ Verification ${submissionId} rejected`)

    } catch (error) {
      console.error('❌ Rejection error:', error)
      throw error
    }
  }

  /**
   * Get verification statistics (admin)
   */
  async getVerificationStats(): Promise<{
    total: number
    pending: number
    approved: number
    rejected: number
    overdue: number
  }> {
    try {
      const { data, error } = await supabase
        .from('admin_verification_queue')
        .select('status, urgency_level')

      if (error) {
        console.error('❌ Error fetching verification stats:', error)
        throw new Error('Failed to fetch verification statistics')
      }

      const stats = {
        total: data.length,
        pending: data.filter(d => d.status === 'pending').length,
        approved: data.filter(d => d.status === 'approved').length,
        rejected: data.filter(d => d.status === 'rejected').length,
        overdue: data.filter(d => d.urgency_level === 'overdue').length
      }

      return stats

    } catch (error) {
      console.error('❌ Error getting verification stats:', error)
      throw error
    }
  }
}

// Export singleton instance
export const manualVerificationService = new ManualVerificationService()
