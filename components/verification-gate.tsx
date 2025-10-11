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
  Mail
} from "lucide-react"

import { useState } from "react"
import { toast } from "sonner"
import Link from "next/link"
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
  const { user, isLoading, refreshUser } = useAuth()
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
    return user?.user_type === "client" ? "business" : "identity"
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  // If user is verified (is_verified field from database), show the content
  if (user?.is_verified) {
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
        <CardContent>
          <Link href="/login">
            <Button className="w-full">
              <Mail className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  // User is authenticated but not verified - show verification requirement
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
              Action Required
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <strong>✅ Email Verified:</strong> Your email address has been confirmed.
              <br />
              <strong>🔒 Required:</strong> {getVerificationType()} verification to {getActionText()}
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-amber-700">
              {user.user_type === "client" ? (
                <Building className="h-4 w-4" />
              ) : (
                <User className="h-4 w-4" />
              )}
              <span>
                {user.user_type === "client" 
                  ? "Business verification required to post tasks"
                  : "Identity verification required to apply to tasks"
                }
              </span>
            </div>

            <div className="text-xs text-amber-600 bg-amber-100 p-3 rounded">
              <strong>How it works:</strong> Submit your documents for verification.
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => setShowManualVerification(true)}
                className="flex-1"
              >
                <Shield className="h-4 w-4 mr-2" />
                Start AI Verification
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

      {/* AI Verification Flow */}
      {showManualVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">AI Document Verification</h2>
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
                  toast.success("Documents submitted for AI review!")
                  // Refresh user to check if approved
                  refreshUser()
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
