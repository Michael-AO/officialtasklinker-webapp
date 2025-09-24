import { useState, useCallback } from 'react'
import { useToast } from './use-toast'

interface VerificationData {
  firstName: string
  lastName: string
  idNumber: string
  idType: string
  dateOfBirth: string
  nationality: string
  address: string
  city: string
  state: string
  country: string
  postalCode: string
  phoneNumber: string
}

interface VerificationStatus {
  dojah_verified: boolean
  verification_type: string | null
  verification_status: string
  verified_at: string | null
}

interface UseEnhancedVerificationReturn {
  // State
  isLoading: boolean
  verificationStatus: VerificationStatus | null
  currentStep: number
  verificationData: VerificationData
  
  // Actions
  updateVerificationData: (field: keyof VerificationData, value: string) => void
  checkVerificationStatus: () => Promise<void>
  processVerification: (dojahResult: any, verificationType: 'identity' | 'business') => Promise<boolean>
  resetVerification: () => void
  
  // Validation
  validatePersonalInfo: () => boolean
  getValidationErrors: () => string[]
}

export function useEnhancedVerification(): UseEnhancedVerificationReturn {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [verificationData, setVerificationData] = useState<VerificationData>({
    firstName: '',
    lastName: '',
    idNumber: '',
    idType: '',
    dateOfBirth: '',
    nationality: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    phoneNumber: ''
  })

  const updateVerificationData = useCallback((field: keyof VerificationData, value: string) => {
    setVerificationData(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const checkVerificationStatus = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/verification/enhanced-dojah')
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data?.verification_status) {
          setVerificationStatus(data.data.verification_status)
        }
      } else {
        console.error('Failed to check verification status:', response.statusText)
      }
    } catch (error) {
      console.error('Error checking verification status:', error)
      toast({
        title: "Error",
        description: "Failed to check verification status. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const processVerification = useCallback(async (
    dojahResult: any, 
    verificationType: 'identity' | 'business'
  ): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/verification/enhanced-dojah', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dojahResult,
          verificationData,
          verificationType,
          metadata: {
            processedAt: new Date().toISOString(),
            source: 'enhanced-verification'
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Verification Successful! 🎉",
          description: `Your ${verificationType} has been verified successfully.`,
        })
        
        // Update local status
        setVerificationStatus({
          dojah_verified: true,
          verification_type: verificationType,
          verification_status: 'verified',
          verified_at: new Date().toISOString()
        })
        
        setCurrentStep(3) // Mark as complete
        return true
      } else {
        toast({
          title: "Verification Failed",
          description: data.error || "Something went wrong during verification.",
          variant: "destructive"
        })
        return false
      }
    } catch (error) {
      console.error('Error processing verification:', error)
      toast({
        title: "Verification Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [verificationData, toast])

  const resetVerification = useCallback(() => {
    setCurrentStep(0)
    setVerificationData({
      firstName: '',
      lastName: '',
      idNumber: '',
      idType: '',
      dateOfBirth: '',
      nationality: '',
      address: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      phoneNumber: ''
    })
    setVerificationStatus(null)
  }, [])

  const validatePersonalInfo = useCallback((): boolean => {
    const requiredFields = ['firstName', 'lastName', 'idNumber', 'idType', 'dateOfBirth', 'nationality']
    const missingFields = requiredFields.filter(field => !verificationData[field as keyof VerificationData])
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: `Please fill in: ${missingFields.join(', ')}`,
        variant: "destructive"
      })
      return false
    }

    // Validate ID number length
    if (verificationData.idNumber.length < 5) {
      toast({
        title: "Invalid ID Number",
        description: "ID number must be at least 5 characters long",
        variant: "destructive"
      })
      return false
    }

    // Validate date of birth (must be 18+)
    if (verificationData.dateOfBirth) {
      const dob = new Date(verificationData.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - dob.getFullYear()
      if (age < 18) {
        toast({
          title: "Age Requirement",
          description: "You must be at least 18 years old to verify your identity",
          variant: "destructive"
        })
        return false
      }
    }

    return true
  }, [verificationData, toast])

  const getValidationErrors = useCallback((): string[] => {
    const errors: string[] = []
    
    const requiredFields = ['firstName', 'lastName', 'idNumber', 'idType', 'dateOfBirth', 'nationality']
    const missingFields = requiredFields.filter(field => !verificationData[field as keyof VerificationData])
    
    if (missingFields.length > 0) {
      errors.push(`Missing required fields: ${missingFields.join(', ')}`)
    }

    if (verificationData.idNumber && verificationData.idNumber.length < 5) {
      errors.push("ID number must be at least 5 characters long")
    }

    if (verificationData.dateOfBirth) {
      const dob = new Date(verificationData.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - dob.getFullYear()
      if (age < 18) {
        errors.push("You must be at least 18 years old to verify your identity")
      }
    }

    return errors
  }, [verificationData])

  return {
    // State
    isLoading,
    verificationStatus,
    currentStep,
    verificationData,
    
    // Actions
    updateVerificationData,
    checkVerificationStatus,
    processVerification,
    resetVerification,
    
    // Validation
    validatePersonalInfo,
    getValidationErrors
  }
}
