"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Shield, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  User, 
  Building,
  RefreshCw,
  Unlock,
  Zap,
  Ban,
  RotateCcw
} from "lucide-react"
import { SimpleVerificationForm } from "@/components/simple-verification-form"
import { VerificationStatusSimple } from "@/components/verification-status-simple"
import { toast } from "sonner"

interface VerificationStatus {
  status: "verified" | "unverified" | "processing" | "revoked"
  submittedAt?: string
  approvedAt?: string
  revokedAt?: string
  canReverifyAt?: string
}

export default function VerificationPage() {
  const { user } = useAuth()
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({ status: "unverified" })
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [timeUntilApproval, setTimeUntilApproval] = useState<number>(0)

  // Fetch verification status
  useEffect(() => {
    if (user) {
      fetchVerificationStatus()
    }
  }, [user])

  // Countdown timer for auto-approval
  useEffect(() => {
    if (verificationStatus.status === "processing" && verificationStatus.submittedAt) {
      const submittedTime = new Date(verificationStatus.submittedAt).getTime()
      const approvalTime = submittedTime + (5 * 60 * 1000) // 5 minutes
      const now = Date.now()
      
      if (now < approvalTime) {
        const timeLeft = approvalTime - now
        setTimeUntilApproval(timeLeft)
        
        const timer = setInterval(() => {
          const newTimeLeft = approvalTime - Date.now()
          if (newTimeLeft <= 0) {
            clearInterval(timer)
            setTimeUntilApproval(0)
            // Auto-approve by fetching latest status
            fetchVerificationStatus()
          } else {
            setTimeUntilApproval(newTimeLeft)
          }
        }, 1000)
        
        return () => clearInterval(timer)
      } else {
        // Already past approval time, fetch current status
        fetchVerificationStatus()
      }
    }
  }, [verificationStatus.status, verificationStatus.submittedAt])

  const fetchVerificationStatus = async () => {
    try {
      setLoading(true)
      
      if (!user) {
        toast.error("Please log in to access verification")
        return
      }
      
      const statusResponse = await fetch("/api/verification/status", {
        headers: {
          'x-user-id': user.id
        }
      })
      
      if (statusResponse.ok) {
        const data = await statusResponse.json()
        setVerificationStatus(data)
      } else {
        throw new Error("Failed to fetch verification status")
      }
    } catch (error) {
      console.error("Failed to fetch verification status:", error)
      toast.error("Failed to load verification status")
    } finally {
      setLoading(false)
    }
  }

  const handleVerificationSuccess = async () => {
    try {
      setProcessing(true)
      toast.success("Verification submitted! Your account will be verified automatically in 5 minutes.")
      
      // Set processing status immediately
      setVerificationStatus({
        status: "processing",
        submittedAt: new Date().toISOString()
      })
      
      // In a real app, you'd call an API to create the verification request
      // For now, we'll simulate the backend process
      simulateAutoApproval()
      
    } catch (error) {
      console.error("Verification error:", error)
      toast.error("Failed to submit verification request")
    } finally {
      setProcessing(false)
    }
  }

  const simulateAutoApproval = () => {
    // This would be handled by your backend in production
    // For demo, we're using the frontend timer
    console.log("Verification submitted - will auto-approve in 5 minutes")
  }

  const handleReverify = async () => {
    try {
      setProcessing(true)
      
      // Call API to start re-verification
      const response = await fetch("/api/verification/reverify", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || ''
        }
      })
      
      if (response.ok) {
        toast.success("Re-verification started! Your account will be verified in 5 minutes.")
        setVerificationStatus({
          status: "processing",
          submittedAt: new Date().toISOString()
        })
      } else {
        throw new Error("Failed to start re-verification")
      }
    } catch (error) {
      console.error("Re-verification error:", error)
      toast.error("Failed to start re-verification")
    } finally {
      setProcessing(false)
    }
  }

  const getTimeUntilReverify = (): string => {
    if (!verificationStatus.canReverifyAt) return ""
    
    const canReverifyTime = new Date(verificationStatus.canReverifyAt).getTime()
    const now = Date.now()
    const timeLeft = canReverifyTime - now
    
    if (timeLeft <= 0) return ""
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60))
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${hours}h ${minutes}m`
  }

  const formatTime = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / (1000 * 60))
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
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

  const canReverify = verificationStatus.status === "revoked" && 
    (!verificationStatus.canReverifyAt || new Date(verificationStatus.canReverifyAt) <= new Date())
  
  const timeUntilReverify = getTimeUntilReverify()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Verification Center</h1>
          <p className="text-muted-foreground">Get verified to unlock all platform features</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchVerificationStatus}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Status
        </Button>
      </div>

      {/* Current Status */}
      <VerificationStatusSimple />

      {/* Processing State - Auto Approval Countdown */}
      {verificationStatus.status === "processing" && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Clock className="h-5 w-5 animate-pulse" />
              Verification in Progress
            </CardTitle>
            <CardDescription className="text-blue-700">
              Your verification is being processed automatically. This usually takes about 5 minutes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Time remaining:</span>
                <Badge variant="secondary" className="text-lg font-mono">
                  {formatTime(timeUntilApproval)}
                </Badge>
              </div>
              <Progress 
                value={((5 * 60 * 1000 - timeUntilApproval) / (5 * 60 * 1000)) * 100} 
                className="h-2"
              />
              <Alert className="bg-blue-100 border-blue-300">
                <Clock className="h-4 w-4" />
                <AlertDescription className="text-blue-800">
                  Your account will be automatically verified once the timer completes. No action needed!
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revoked State - Re-verification */}
      {verificationStatus.status === "revoked" && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <Ban className="h-5 w-5" />
              Verification Revoked
            </CardTitle>
            <CardDescription className="text-amber-700">
              Your verification has been revoked by an administrator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!canReverify && timeUntilReverify ? (
                <div className="space-y-3">
                  <Alert className="bg-amber-100 border-amber-300">
                    <Clock className="h-4 w-4" />
                    <AlertDescription className="text-amber-800">
                      You can request re-verification in <strong>{timeUntilReverify}</strong>
                    </AlertDescription>
                  </Alert>
                  <div className="text-sm text-amber-700">
                    <p>For security reasons, you must wait 48 hours after revocation to re-verify your account.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Alert className="bg-green-100 border-green-300">
                    <RotateCcw className="h-4 w-4" />
                    <AlertDescription className="text-green-800">
                      You can now request re-verification
                    </AlertDescription>
                  </Alert>
                  <Button 
                    onClick={handleReverify}
                    disabled={processing}
                    className="w-full"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Start Re-verification
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verification Form - Show for unverified or if can re-verify */}
      {(verificationStatus.status === "unverified" || canReverify) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Identity Verification
            </CardTitle>
            <CardDescription>
              Complete your verification to access all platform features. 
              Your account will be automatically verified in 5 minutes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleVerificationForm
              userType={(user?.userType === "admin" ? "client" : user?.userType) || "freelancer"}
              onSuccess={handleVerificationSuccess}
              onError={(error) => {
                toast.error(error)
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Verification Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Unlock className="h-5 w-5" />
            Verified Account Benefits
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
                <li>• Build platform credibility</li>
                <li>• Enhanced platform features</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
