import { supabase } from "./supabase"
import type { Database } from "@/types/supabase"

type Tables = Database["public"]["Tables"]
type UserVerificationRequest = Tables["user_verification_requests"]["Row"]

export interface VerificationDocument {
  id: string
  type: "government_id" | "passport" | "drivers_license" | "business_license" | "utility_bill" | "bank_statement" | "selfie"
  url: string
  filename: string
  size: number
  mimeType: string
  uploadedAt: string
}

export interface VerificationData {
  firstName: string
  lastName: string
  dateOfBirth: string
  nationality: string
  address: {
    street: string
    city: string
    state: string
    country: string
    postalCode: string
  }
  phoneNumber: string
  businessInfo?: {
    businessName: string
    businessType: string
    registrationNumber: string
    taxId: string
    address: string
  }
}

export interface DojahVerificationResult {
  success: boolean
  data?: {
    user_id: string
    verification_id: string
    status: string
    verification_data: any
    documents: any[]
  }
  error?: string
}

export class VerificationService {
  // Create a new verification request
  static async createVerificationRequest(
    userId: string,
    verificationType: "identity" | "business" | "professional",
    documents: VerificationDocument[],
    submittedData?: VerificationData
  ): Promise<UserVerificationRequest | null> {
    try {
      const { data, error } = await supabase
        .from("user_verification_requests")
        .insert({
          user_id: userId,
          verification_type: verificationType,
          documents: documents,
          submitted_data: submittedData,
          status: "pending"
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error creating verification request:", error)
      return null
    }
  }

  // Get user's verification requests
  static async getUserVerificationRequests(userId: string): Promise<UserVerificationRequest[]> {
    try {
      const { data, error } = await supabase
        .from("user_verification_requests")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error getting verification requests:", error)
      return []
    }
  }

  // Get latest verification request for a user
  static async getLatestVerificationRequest(userId: string): Promise<UserVerificationRequest | null> {
    try {
      const { data, error } = await supabase
        .from("user_verification_requests")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== "PGRST116") throw error // PGRST116 = no rows returned
      return data
    } catch (error) {
      console.error("Error getting latest verification request:", error)
      return null
    }
  }

  // Process Dojah verification result
  static async processDojahVerification(
    userId: string,
    dojahResult: any
  ): Promise<DojahVerificationResult> {
    try {
      console.log("Processing Dojah verification result:", dojahResult)

      // Extract verification data from Dojah result
      const verificationData = this.extractDojahData(dojahResult)
      
      // Determine verification type based on Dojah data
      const verificationType = verificationData.businessInfo ? "business" : "identity"

      // Create verification request
      const verificationRequest = await this.createVerificationRequest(
        userId,
        verificationType,
        verificationData.documents || [],
        verificationData
      )

      if (!verificationRequest) {
        throw new Error("Failed to create verification request")
      }

      // If Dojah verification was successful, auto-approve for now
      // In production, you might want to add additional checks
      if (dojahResult.event === "successful") {
        await this.approveVerification(verificationRequest.id, userId, "Auto-approved via Dojah")
      }

      return {
        success: true,
        data: {
          user_id: userId,
          verification_id: verificationRequest.id,
          status: verificationRequest.status,
          verification_data: verificationData,
          documents: verificationData.documents || []
        }
      }
    } catch (error) {
      console.error("Error processing Dojah verification:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }

  // Extract and format data from Dojah result
  private static extractDojahData(dojahResult: any): VerificationData {
    const data = dojahResult.data || {}
    
    return {
      firstName: data.first_name || data.firstName || "",
      lastName: data.last_name || data.lastName || "",
      dateOfBirth: data.date_of_birth || data.dateOfBirth || "",
      nationality: data.nationality || "",
      address: {
        street: data.address?.street || "",
        city: data.address?.city || "",
        state: data.address?.state || "",
        country: data.address?.country || "",
        postalCode: data.address?.postal_code || data.address?.postalCode || ""
      },
      phoneNumber: data.phone_number || data.phoneNumber || "",
      businessInfo: data.business ? {
        businessName: data.business.name || "",
        businessType: data.business.type || "",
        registrationNumber: data.business.registration_number || data.business.registrationNumber || "",
        taxId: data.business.tax_id || data.business.taxId || "",
        address: data.business.address || ""
      } : undefined,
      documents: data.documents || []
    }
  }

  // Approve verification request (admin function)
  static async approveVerification(
    requestId: string,
    reviewedBy: string,
    notes?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("user_verification_requests")
        .update({
          status: "approved",
          reviewed_by: reviewedBy,
          review_notes: notes,
          reviewed_at: new Date().toISOString()
        })
        .eq("id", requestId)

      if (error) throw error

      // Update user's verification status
      const { data: request } = await supabase
        .from("user_verification_requests")
        .select("user_id, verification_type")
        .eq("id", requestId)
        .single()

      if (request) {
        await supabase
          .from("users")
          .update({
            dojah_verified: true,
            verification_type: request.verification_type
          })
          .eq("id", request.user_id)
      }

      return true
    } catch (error) {
      console.error("Error approving verification:", error)
      return false
    }
  }

  // Reject verification request (admin function)
  static async rejectVerification(
    requestId: string,
    reviewedBy: string,
    notes: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("user_verification_requests")
        .update({
          status: "rejected",
          reviewed_by: reviewedBy,
          review_notes: notes,
          reviewed_at: new Date().toISOString()
        })
        .eq("id", requestId)

      if (error) throw error
      return true
    } catch (error) {
      console.error("Error rejecting verification:", error)
      return false
    }
  }

  // Request more information (admin function)
  static async requestMoreInfo(
    requestId: string,
    reviewedBy: string,
    notes: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("user_verification_requests")
        .update({
          status: "requires_more_info",
          reviewed_by: reviewedBy,
          review_notes: notes,
          reviewed_at: new Date().toISOString()
        })
        .eq("id", requestId)

      if (error) throw error
      return true
    } catch (error) {
      console.error("Error requesting more info:", error)
      return false
    }
  }

  // Get all pending verification requests (admin function)
  static async getPendingVerifications(): Promise<UserVerificationRequest[]> {
    try {
      const { data, error } = await supabase
        .from("user_verification_requests")
        .select(`
          *,
          user:users(id, name, email, user_type)
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error getting pending verifications:", error)
      return []
    }
  }

  // Check if user is verified
  static async isUserVerified(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("is_verified")
        .eq("id", userId)
        .single()

      if (error) throw error
      return data?.is_verified || false
    } catch (error) {
      console.error("Error checking user verification status:", error)
      return false
    }
  }

  // Get verification statistics
  static async getVerificationStats(): Promise<{
    total: number
    pending: number
    approved: number
    rejected: number
    requiresMoreInfo: number
  }> {
    try {
      const { data, error } = await supabase
        .from("user_verification_requests")
        .select("status")

      if (error) throw error

      const stats = {
        total: data?.length || 0,
        pending: data?.filter(r => r.status === "pending").length || 0,
        approved: data?.filter(r => r.status === "approved").length || 0,
        rejected: data?.filter(r => r.status === "rejected").length || 0,
        requiresMoreInfo: data?.filter(r => r.status === "requires_more_info").length || 0
      }

      return stats
    } catch (error) {
      console.error("Error getting verification stats:", error)
      return {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        requiresMoreInfo: 0
      }
    }
  }
}
