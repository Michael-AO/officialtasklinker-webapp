"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useDojahModal } from "@/contexts/dojah-modal-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Shield, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  User, 
  Building,
  ArrowRight,
  RefreshCw,
  Info,
  FileText
} from "lucide-react"

import { VerificationStatusBadge, type VerificationStatus } from "./verification-status-badge"
import { toast } from "sonner"
import Link from "next/link"

interface VerificationStatusCardProps {
  className?: string
  compact?: boolean
}

export function VerificationStatusCard({ className, compact = false }: VerificationStatusCardProps) {
  const { user, updateProfile } = useAuth()
  const { openDojahModal, setVerificationType, setOnSuccess, setOnError } = useDojahModal()
  const [processing, setProcessing] = useState(false)

  const getVerificationType = () => {
    return user?.userType === "client" ? "business" : "identity"
  }

  const getCurrentStatus = (): VerificationStatus => {
    if (!user) return "unverified"
    if (user.isVerified) return "verified"
    return "unverified"
  }

  const handleVerificationSuccess = async (result: any) => {
    try {
      setProcessing(true)
      
      const response = await fetch("/api/verification/process-dojah", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dojahResult: result }),
      })

      const verificationResult = await response.json()

      if (response.ok && verificationResult.success) {
        toast.success("Verification completed successfully!")
        await updateProfile({ 
          isVerified: true, 
          verification_type: verificationResult.data.verification_type 
        })
      } else {
        toast.error(verificationResult.error || "Verification failed")
      }
    } catch (error) {
      console.error("Verification error:", error)
      toast.error("Failed to process verification")
    } finally {
      setProcessing(false)
    }
  }

  const handleStartVerification = () => {
    console.log("🚀 [VERIFICATION-CARD] Starting verification from verification status card...")
    console.log("🚀 [VERIFICATION-CARD] User details:", {
      id: user?.id,
      userType: user?.userType,
      isVerified: user?.isVerified,
      dojahVerified: user?.dojahVerified
    })
    
    // Set up the verification type and callbacks
    const verificationType = getVerificationType() as 'identity' | 'business'
    console.log("🚀 [VERIFICATION-CARD] Setting verification type to:", verificationType)
    setVerificationType(verificationType)
    
    console.log("🚀 [VERIFICATION-CARD] Setting success callback:", handleVerificationSuccess.name)
    setOnSuccess(handleVerificationSuccess)
    
    console.log("🚀 [VERIFICATION-CARD] Setting error callback")
    setOnError((error) => {
      console.error("❌ [VERIFICATION-CARD] Verification error callback triggered:", error)
      toast.error("Verification failed. Please try again.")
    })
    
    // Open the modal
    console.log("🚀 [VERIFICATION-CARD] Opening Dojah modal...")
    openDojahModal()
    
    console.log("🚀 [VERIFICATION-CARD] Verification setup complete")
  }

  const currentStatus = getCurrentStatus()

  if (compact) {
    return (
      <>
        <Card className={className}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Verification Status</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.userType === "client" ? "Business" : "Identity"} verification
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <VerificationStatusBadge 
                  status={currentStatus} 
                  type={getVerificationType()}
                  size="sm"
                />
                {currentStatus !== "verified" && (
                  <Button
                    size="sm"
                    onClick={handleStartVerification}
                    disabled={processing}
                  >
                    {processing ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      "Start"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentStatus === "verified" ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Shield className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <CardTitle className="text-lg">Verification Status</CardTitle>
                <CardDescription>
                  {user?.userType === "client" ? "Business" : "Identity"} verification for {user?.userType === "client" ? "posting tasks" : "applying to tasks"}
                </CardDescription>
              </div>
            </div>
            <VerificationStatusBadge 
              status={currentStatus} 
              type={getVerificationType()}
              size="md"
            />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {currentStatus === "verified" ? (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Verified!</strong> Your account is verified and you have full access to all features.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Verification Required</strong> Complete verification to unlock full platform access.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              asChild
            >
              <Link href="/dashboard/verification">
                <FileText className="h-4 w-4 mr-2" />
                View Details
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            
            {currentStatus !== "verified" && (
              <Button 
                onClick={handleStartVerification}
                disabled={processing}
                className="flex-1"
              >
                {processing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
                )}
                Start Verification
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
