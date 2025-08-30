"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle, 
  User, 
  Building, 
  FileText,
  Shield,
  Loader2
} from "lucide-react"
import { DojahModal } from "./dojah-modal"
import { toast } from "sonner"

interface VerificationStatus {
  isVerified: boolean
  latestRequest: any
  allRequests: any[]
  verificationCount: number
}

interface VerificationStatusProps {
  showActions?: boolean
  compact?: boolean
}

export function VerificationStatus({ showActions = true, compact = false }: VerificationStatusProps) {
  const { user, updateProfile } = useAuth()
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDojahModal, setShowDojahModal] = useState(false)

  useEffect(() => {
    if (user) {
      loadVerificationStatus()
    }
  }, [user])

  const loadVerificationStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/verification/status")
      const result = await response.json()

      if (response.ok) {
        setVerificationStatus(result.data)
      } else {
        console.error("Failed to load verification status:", result.error)
      }
    } catch (error) {
      console.error("Error loading verification status:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = () => {
    if (!verificationStatus) return <Clock className="h-5 w-5 text-muted-foreground" />
    
    if (verificationStatus.isVerified) {
      return <CheckCircle className="h-5 w-5 text-green-600" />
    }

    const latestRequest = verificationStatus.latestRequest
    if (latestRequest) {
      switch (latestRequest.status) {
        case "rejected":
          return <XCircle className="h-5 w-5 text-red-600" />
        case "requires_more_info":
          return <AlertCircle className="h-5 w-5 text-yellow-600" />
        default:
          return <Clock className="h-5 w-5 text-blue-600" />
      }
    }

    return <Shield className="h-5 w-5 text-muted-foreground" />
  }

  const getStatusText = () => {
    if (!verificationStatus) return "Loading..."
    
    if (verificationStatus.isVerified) {
      return "Verified"
    }

    const latestRequest = verificationStatus.latestRequest
    if (latestRequest) {
      switch (latestRequest.status) {
        case "pending":
          return "Under Review"
        case "rejected":
          return "Rejected"
        case "requires_more_info":
          return "More Info Required"
        default:
          return "Unknown Status"
      }
    }

    return "Not Verified"
  }

  const getStatusBadge = () => {
    if (!verificationStatus) return <Badge variant="secondary">Loading...</Badge>
    
    if (verificationStatus.isVerified) {
      return <Badge className="bg-green-100 text-green-800">Verified</Badge>
    }

    const latestRequest = verificationStatus.latestRequest
    if (latestRequest) {
      switch (latestRequest.status) {
        case "pending":
          return <Badge variant="secondary">Under Review</Badge>
        case "rejected":
          return <Badge variant="destructive">Rejected</Badge>
        case "requires_more_info":
          return <Badge className="bg-yellow-100 text-yellow-800">More Info Required</Badge>
        default:
          return <Badge variant="outline">Unknown</Badge>
      }
    }

    return <Badge variant="outline">Not Verified</Badge>
  }

  const getVerificationTypeIcon = (type: string) => {
    switch (type) {
      case "business":
        return <Building className="h-4 w-4" />
      case "professional":
        return <FileText className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span>Loading verification status...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
        {getStatusBadge()}
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <div>
                <CardTitle className="text-lg">ID Verification</CardTitle>
                <CardDescription>
                  {verificationStatus?.isVerified 
                    ? "Your identity has been verified" 
                    : "Complete verification to unlock all features"
                  }
                </CardDescription>
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {verificationStatus?.isVerified ? (
            <div className="space-y-3">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Verified!</strong> You can now apply to tasks and post jobs.
                  {user?.verification_type && (
                    <span className="ml-2">
                      Type: {getVerificationTypeIcon(user.verification_type)}
                      <span className="ml-1 capitalize">{user.verification_type}</span>
                    </span>
                  )}
                </AlertDescription>
              </Alert>
              
              {verificationStatus.verificationCount > 1 && (
                <div className="text-sm text-muted-foreground">
                  Total verification attempts: {verificationStatus.verificationCount}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {verificationStatus?.latestRequest && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Latest Request</span>
                    <span className="text-muted-foreground">
                      {formatDate(verificationStatus.latestRequest.created_at)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getVerificationTypeIcon(verificationStatus.latestRequest.verification_type)}
                    <span className="text-sm font-medium capitalize">
                      {verificationStatus.latestRequest.verification_type} Verification
                    </span>
                  </div>

                  {verificationStatus.latestRequest.status === "rejected" && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        Your verification was rejected. Please review the feedback and try again.
                      </AlertDescription>
                    </Alert>
                  )}

                  {verificationStatus.latestRequest.status === "requires_more_info" && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        We need more information to complete your verification. Please check your email for details.
                      </AlertDescription>
                    </Alert>
                  )}

                  {verificationStatus.latestRequest.status === "pending" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Review in progress</span>
                        <span className="text-muted-foreground">24-48 hours</span>
                      </div>
                      <Progress value={50} className="h-2" />
                    </div>
                  )}
                </div>
              )}

              {showActions && (
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setShowDojahModal(true)}
                    className="flex-1"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Start Automated Verification
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => window.location.href = "/dashboard/verification/manual"}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Manual Verification
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <DojahModal
        open={showDojahModal}
        onOpenChange={setShowDojahModal}
        onSuccess={async (result) => {
          try {
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
              await updateProfile({ isVerified: true, verification_type: verificationResult.data.verification_type })
              // Reload verification status
              await loadVerificationStatus()
            } else {
              toast.error(verificationResult.error || "Verification failed")
            }
          } catch (error) {
            console.error("Verification error:", error)
            toast.error("Failed to process verification")
          }
        }}
      />
    </>
  )
}
