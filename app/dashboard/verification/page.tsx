"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Shield, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  User, 
  Building,
  FileText,
  Calendar,
  ArrowRight,
  RefreshCw,
  Info,
  Lock,
  Unlock
} from "lucide-react"
import { DojahWorking } from "@/components/dojah-working"
import { VerificationStatusBadge, type VerificationStatus } from "@/components/verification-status-badge"
import { toast } from "sonner"

interface VerificationRequest {
  id: string
  user_id: string
  verification_type: "identity" | "business" | "professional"
  status: "pending" | "approved" | "rejected" | "processing"
  submitted_at: string
  reviewed_at?: string
  admin_notes?: string
  documents: Array<{
    type: string
    filename: string
    uploaded_at: string
  }>
}

interface VerificationStats {
  total_requests: number
  approved: number
  pending: number
  rejected: number
  average_processing_time: number
}

export default function VerificationPage() {
  const { user, updateProfile } = useAuth()
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([])
  const [stats, setStats] = useState<VerificationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  // Fetch verification data
  useEffect(() => {
    fetchVerificationData()
  }, [])

  const fetchVerificationData = async () => {
    try {
      setLoading(true)
      
      // First test authentication
      console.log("🔍 Testing authentication...")
      const authResponse = await fetch("/api/test-auth")
      const authData = await authResponse.json()
      
      console.log("🔍 Auth test result:", authData)
      
      if (!authResponse.ok) {
        console.error("❌ Authentication failed:", authData)
        toast.error("Authentication failed. Please log in again.")
        return
      }
      
      console.log("✅ Authentication successful:", authData.user)
      
      // Fetch verification status and history
      const statusResponse = await fetch("/api/verification/status")
      const statusData = await statusResponse.json()
      
      console.log("🔍 Verification status response:", statusData)
      
      if (statusResponse.ok && statusData.success) {
        // Handle the correct API response structure
        const { data } = statusData
        setVerificationRequests(data.allRequests || [])
        
        // Create stats from the data
        const stats = {
          total_requests: data.verificationCount || 0,
          approved: data.allRequests?.filter((r: any) => r.status === "approved").length || 0,
          pending: data.allRequests?.filter((r: any) => r.status === "pending").length || 0,
          rejected: data.allRequests?.filter((r: any) => r.status === "rejected").length || 0,
          average_processing_time: 0 // Calculate if needed
        }
        setStats(stats)
      } else {
        console.error("Failed to fetch verification data:", statusData.error)
        toast.error("Failed to load verification data")
      }
    } catch (error) {
      console.error("Failed to fetch verification data:", error)
      toast.error("Failed to load verification data")
    } finally {
      setLoading(false)
    }
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
        // Refresh verification data
        await fetchVerificationData()
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

  const getVerificationType = () => {
    return user?.userType === "client" ? "business" : "identity"
  }

  const getCurrentStatus = (): VerificationStatus => {
    if (!user) return "unverified"
    if (user.isVerified) return "verified"
    
    const latestRequest = verificationRequests[0]
    if (!latestRequest) return "unverified"
    
    switch (latestRequest.status) {
      case "approved": return "verified"
      case "pending": return "pending"
      case "rejected": return "rejected"
      case "processing": return "processing"
      default: return "unverified"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const getStatusIcon = (status: VerificationStatus) => {
    switch (status) {
      case "verified": return <CheckCircle className="h-5 w-5 text-green-600" />
      case "pending": return <Clock className="h-5 w-5 text-amber-600" />
      case "rejected": return <AlertTriangle className="h-5 w-5 text-red-600" />
      case "processing": return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
      default: return <Shield className="h-5 w-5 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Verification Center</h1>
            <p className="text-muted-foreground">Manage your account verification status</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  const currentStatus = getCurrentStatus()
  const latestRequest = verificationRequests[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Verification Center</h1>
          <p className="text-muted-foreground">Manage your account verification status</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchVerificationData}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Current Status Card */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(currentStatus)}
              <div>
                <CardTitle className="text-xl">Verification Status</CardTitle>
                <CardDescription>
                  {user?.userType === "client" ? "Business" : "Identity"} verification for {user?.userType === "client" ? "posting tasks" : "applying to tasks"}
                </CardDescription>
              </div>
            </div>
            <VerificationStatusBadge 
              status={currentStatus} 
              type={getVerificationType()}
              size="lg"
            />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {currentStatus === "verified" ? (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Congratulations!</strong> Your account is verified. You now have full access to all platform features.
              </AlertDescription>
            </Alert>
          ) : currentStatus === "pending" ? (
            <Alert className="border-amber-200 bg-amber-50">
              <Clock className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Verification in Progress</strong> Your verification request is being reviewed. This typically takes 1-2 business days.
              </AlertDescription>
            </Alert>
          ) : currentStatus === "rejected" ? (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Verification Rejected</strong> {latestRequest?.admin_notes || "Please review the feedback and submit a new verification request."}
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

          {currentStatus !== "verified" && (
            <div className="flex gap-3">
              <DojahWorking
                verificationType={getVerificationType()}
                onSuccess={handleVerificationSuccess}
                onError={(error) => {
                  console.error("Verification error:", error)
                  toast.error("Verification failed. Please try again.")
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification History */}
      {verificationRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Verification History
            </CardTitle>
            <CardDescription>
              Track your verification requests and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {verificationRequests.map((request, index) => (
                <div key={request.id} className="space-y-3">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {request.verification_type === "business" ? (
                          <Building className="h-4 w-4 text-purple-600" />
                        ) : (
                          <User className="h-4 w-4 text-blue-600" />
                        )}
                        <span className="font-medium capitalize">
                          {request.verification_type} Verification
                        </span>
                      </div>
                      <Badge variant="outline">
                        {request.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(request.submitted_at)}
                    </div>
                  </div>
                  
                  {request.admin_notes && (
                    <div className="ml-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong>Admin Notes:</strong> {request.admin_notes}
                      </p>
                    </div>
                  )}
                  
                  {index < verificationRequests.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}



      {/* Verification Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Unlock className="h-5 w-5" />
            Verification Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                For Freelancers
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Apply to premium tasks</li>
                <li>• Build trust with clients</li>
                <li>• Access higher-paying opportunities</li>
                <li>• Priority in search results</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Building className="h-4 w-4 text-purple-600" />
                For Clients
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Post tasks and hire freelancers</li>
                <li>• Access verified talent pool</li>
                <li>• Build business credibility</li>
                <li>• Enhanced platform features</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
