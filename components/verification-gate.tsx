"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  Shield, 
  Lock, 
  CheckCircle, 
  AlertTriangle,
  User,
  Building,
  Loader2
} from "lucide-react"
import { DojahSdkModal } from "./dojah-sdk-modal"
import { useState } from "react"
import { toast } from "sonner"

interface VerificationGateProps {
  children: React.ReactNode
  requiredAction: "post_tasks" | "apply_tasks" | "full_access"
  fallback?: React.ReactNode
}

export function VerificationGate({ 
  children, 
  requiredAction, 
  fallback 
}: VerificationGateProps) {
  const { user, updateProfile } = useAuth()
  const [showDojahModal, setShowDojahModal] = useState(false)
  const [processing, setProcessing] = useState(false)

  // If user is verified, show the content
  if (user?.isVerified) {
    return <>{children}</>
  }

  // If no user, show login prompt
  if (!user) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            Authentication Required
          </CardTitle>
          <CardDescription>
            Please log in to access this feature.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // User exists but not verified - show verification prompt
  const getActionText = () => {
    switch (requiredAction) {
      case "post_tasks":
        return "post tasks"
      case "apply_tasks":
        return "apply to tasks"
      case "full_access":
        return "access all features"
      default:
        return "continue"
    }
  }

  const getVerificationType = () => {
    return user.userType === "client" ? "business" : "identity"
  }

  const handleVerificationSuccess = async (result: any) => {
    try {
      setProcessing(true)
      
      // Process the Dojah verification result
      const response = await fetch("/api/verification/process-dojah", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dojahResult: result }),
      })

      const verificationResult = await response.json()

      if (response.ok && verificationResult.success) {
        toast.success("Verification completed successfully!")
        // Update user verification status
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

  return (
    <>
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-600" />
              <div>
                <CardTitle className="text-amber-800">
                  ID Verification Required
                </CardTitle>
                <CardDescription className="text-amber-700">
                  Complete verification to {getActionText()}
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="border-amber-300 text-amber-700">
              {user.userType === "client" ? "Business" : "Individual"} Account
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Account Type:</strong> {user.userType === "client" ? "Client" : "Freelancer"}
              <br />
              <strong>Required:</strong> {getVerificationType()} verification via Dojah
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-amber-700">
              {user.userType === "client" ? (
                <Building className="h-4 w-4" />
              ) : (
                <User className="h-4 w-4" />
              )}
              <span>
                {user.userType === "client" 
                  ? "Business verification required to post tasks"
                  : "Identity verification required to apply to tasks"
                }
              </span>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => setShowDojahModal(true)}
                disabled={processing}
                className="flex-1"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Start Dojah Verification
                  </>
                )}
              </Button>
            </div>

            <div className="text-xs text-amber-600 bg-amber-100 p-3 rounded">
              <strong>How it works:</strong> Dojah will guide you through document upload and identity verification. 
              The process typically takes 2-5 minutes and is secure and confidential.
            </div>
          </div>

          {fallback && (
            <div className="mt-4 pt-4 border-t border-amber-200">
              {fallback}
            </div>
          )}
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
