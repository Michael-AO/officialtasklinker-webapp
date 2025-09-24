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
  Loader2,
  Mail
} from "lucide-react"

import { useState } from "react"
import { toast } from "sonner"
import Link from "next/link"
import { DojahModal } from "./dojah-modal"
import { ManualVerificationFlow } from "./verification/manual-verification-flow"

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
  const [processing, setProcessing] = useState(false)
  const [showDojahModal, setShowDojahModal] = useState(false)
  const [showManualVerification, setShowManualVerification] = useState(false)

  // Helper function to get action text
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
    return user?.userType === "client" ? "business" : "identity"
  }

  // If user is fully verified (email + Dojah), show the content
  if (user?.isVerified && user?.dojahVerified) {
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

  // If user is not email verified, show email verification prompt
  if (!user.isVerified) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <div>
                <CardTitle className="text-blue-800">
                  Email Verification Required
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Please verify your email address to continue
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="border-blue-300 text-blue-700">
              Step 1 of 2
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Email Verification:</strong> You need to verify your email address before you can {getActionText()}.
              <br />
              <strong>Next Step:</strong> After email verification, you'll need to complete ID verification via Dojah.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Mail className="h-4 w-4" />
              <span>
                Check your email ({user.email}) for a verification link
              </span>
            </div>

            <div className="flex gap-2">
              <Button 
                asChild
                className="flex-1"
              >
                <Link href="/verify-email">
                  <Mail className="h-4 w-4 mr-2" />
                  Go to Email Verification
                </Link>
              </Button>
            </div>

            <div className="text-xs text-blue-600 bg-blue-100 p-3 rounded">
              <strong>How it works:</strong> 
              <ol className="list-decimal list-inside mt-1 space-y-1">
                <li>Verify your email address (current step)</li>
                <li>Complete ID verification via Dojah (next step)</li>
                <li>Start posting tasks or applying to jobs</li>
              </ol>
            </div>
          </div>

          {fallback && (
            <div className="mt-4 pt-4 border-t border-blue-200">
              {fallback}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }



  const handleVerificationSuccess = async (result: any) => {
    console.log("🎉 Verification success callback triggered:", result)
    try {
      setProcessing(true)
      
      // For test mode, skip the API call and directly update the user
      if (result.event === 'successful' && result.data?.verification_id === 'test-verification-123') {
        console.log("🧪 Test mode detected, updating user directly")
        
        // Update user verification status directly
        await updateProfile({ 
          isVerified: true, // Keep email verification
          dojahVerified: true, // Add Dojah verification
          verification_type: result.data.verification_type || 'identity'
        })
        
        toast.success("ID verification completed successfully!")
        setShowDojahModal(false)
        
        // Refresh the page to show updated dashboard
        window.location.reload()
        return
      }
      
      // Process the Dojah verification result via API
      console.log("📡 Calling verification API...")
      const response = await fetch("/api/verification/process-dojah", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dojahResult: result }),
      })

      const verificationResult = await response.json()
      console.log("📡 API response:", verificationResult)

      if (response.ok && verificationResult.success) {
        toast.success("ID verification completed successfully!")
        // Update user verification status - keep email verification but add Dojah verification
        await updateProfile({ 
          isVerified: true, // Keep email verification
          dojahVerified: true, // Add Dojah verification
          verification_type: verificationResult.data.verification_type 
        })
      } else {
        console.error("❌ API error:", verificationResult.error)
        toast.error(verificationResult.error || "Verification failed")
      }
    } catch (error) {
      console.error("❌ Verification error:", error)
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
                  Complete ID verification to {getActionText()}
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="border-amber-300 text-amber-700">
              Step 2 of 2
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <strong>✅ Email Verified:</strong> Your email address has been confirmed.
              <br />
              <strong>🔒 Required:</strong> {getVerificationType()} verification via Dojah to {getActionText()}
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



            <div className="text-xs text-amber-600 bg-amber-100 p-3 rounded">
              <strong>How it works:</strong> Dojah will guide you through document upload and identity verification. 
              The process typically takes 2-5 minutes and is secure and confidential.
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
              <Button 
                variant="outline"
                onClick={() => setShowManualVerification(true)}
                disabled={processing}
                className="flex-1"
              >
                <User className="h-4 w-4 mr-2" />
                Manual Upload
              </Button>
            </div>
          </div>

          {fallback && (
            <div className="mt-4 pt-4 border-t border-amber-200">
              {fallback}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dojah Modal */}
      <DojahModal
        open={showDojahModal}
        onOpenChange={setShowDojahModal}
        verificationType={getVerificationType() as 'identity' | 'business'}
        onSuccess={handleVerificationSuccess}
        onError={(error) => {
          console.error("❌ Dojah verification error:", error)
          toast.error("Verification failed. Please try again.")
        }}
      />

      {/* Manual Verification Flow */}
      {showManualVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Manual Document Verification</h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowManualVerification(false)}
                  className="text-gray-500"
                >
                  ✕
                </Button>
              </div>
              <ManualVerificationFlow
                onSuccess={() => {
                  setShowManualVerification(false)
                  toast.success("Documents submitted for manual review!")
                  // Refresh the page to show updated verification status
                  window.location.reload()
                }}
                onCancel={() => setShowManualVerification(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
