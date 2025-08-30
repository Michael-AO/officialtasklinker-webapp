"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
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
import { DojahSdkModal } from "./dojah-sdk-modal"
import { VerificationStatusBadge, type VerificationStatus } from "./verification-status-badge"
import { toast } from "sonner"
import Link from "next/link"

interface VerificationStatusCardProps {
  className?: string
  compact?: boolean
}

export function VerificationStatusCard({ className, compact = false }: VerificationStatusCardProps) {
  const { user, updateProfile } = useAuth()
  const [showDojahModal, setShowDojahModal] = useState(false)
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
                    onClick={() => setShowDojahModal(true)}
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

        <DojahSdkModal
          open={showDojahModal}
          onOpenChange={setShowDojahModal}
          verificationType={getVerificationType()}
          onSuccess={handleVerificationSuccess}
        />
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
            {currentStatus !== "verified" ? (
              <Button 
                onClick={() => setShowDojahModal(true)}
                disabled={processing}
                className="flex-1"
              >
                {processing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Start Dojah Verification
                  </>
                )}
              </Button>
            ) : (
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
            )}
          </div>
        </CardContent>
      </Card>

              <DojahSdkModal
          open={showDojahModal}
          onOpenChange={setShowDojahModal}
          verificationType={getVerificationType()}
          onSuccess={handleVerificationSuccess}
        />
    </>
  )
}
