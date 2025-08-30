"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Eye, 
  FileText, 
  User, 
  Building,
  Loader2,
  RefreshCw
} from "lucide-react"
import { toast } from "sonner"

interface VerificationRequest {
  id: string
  user_id: string
  verification_type: "identity" | "business" | "professional"
  documents: any[]
  submitted_data: any
  status: "pending" | "approved" | "rejected" | "requires_more_info"
  review_notes: string | null
  created_at: string
  user?: {
    id: string
    name: string
    email: string
    user_type: string
  }
}

interface VerificationStats {
  total: number
  pending: number
  approved: number
  rejected: number
  requiresMoreInfo: number
}

export default function AdminVerificationsPage() {
  const { user } = useAuth()
  const [verifications, setVerifications] = useState<VerificationRequest[]>([])
  const [stats, setStats] = useState<VerificationStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    requiresMoreInfo: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")
  const [processingAction, setProcessingAction] = useState<string | null>(null)

  useEffect(() => {
    if (user?.userType === "admin") {
      loadVerifications()
    }
  }, [user])

  const loadVerifications = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/verifications")
      const result = await response.json()

      if (response.ok) {
        setVerifications(result.data.pendingVerifications || [])
        setStats(result.data.stats || {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          requiresMoreInfo: 0
        })
      } else {
        toast.error("Failed to load verifications")
      }
    } catch (error) {
      console.error("Error loading verifications:", error)
      toast.error("Failed to load verifications")
    } finally {
      setLoading(false)
    }
  }

  const handleVerificationAction = async (action: "approve" | "reject" | "request_more_info") => {
    if (!selectedVerification) return

    try {
      setProcessingAction(action)
      
      const response = await fetch(`/api/admin/verifications/${selectedVerification.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          notes: reviewNotes
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(`Verification ${action}d successfully`)
        setSelectedVerification(null)
        setReviewNotes("")
        loadVerifications() // Refresh the list
      } else {
        toast.error(result.error || `Failed to ${action} verification`)
      }
    } catch (error) {
      console.error(`Error ${action}ing verification:`, error)
      toast.error(`Failed to ${action} verification`)
    } finally {
      setProcessingAction(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "requires_more_info":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-blue-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      case "requires_more_info":
        return <Badge className="bg-yellow-100 text-yellow-800">More Info Required</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
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
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  if (user?.userType !== "admin") {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this page. Admin access required.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Verification Management</h1>
            <p className="text-muted-foreground">
              Review and manage user verification requests
            </p>
          </div>
          <Button onClick={loadVerifications} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
                </div>
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                </div>
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">More Info</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.requiresMoreInfo}</p>
                </div>
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading verifications...</span>
        </div>
      ) : verifications.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Pending Verifications</h3>
              <p className="text-muted-foreground">
                All verification requests have been processed.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {verifications.map((verification) => (
            <Card key={verification.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getVerificationTypeIcon(verification.verification_type)}
                    <div>
                      <CardTitle className="text-lg">
                        {verification.user?.name || "Unknown User"}
                      </CardTitle>
                      <CardDescription>
                        {verification.user?.email} • {verification.user?.user_type}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(verification.status)}
                    <Badge variant="outline">
                      {verification.verification_type}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-medium mb-2">Personal Information</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Name: {verification.submitted_data?.firstName} {verification.submitted_data?.lastName}</p>
                      <p>DOB: {verification.submitted_data?.dateOfBirth}</p>
                      <p>Nationality: {verification.submitted_data?.nationality}</p>
                      <p>Phone: {verification.submitted_data?.phoneNumber}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Address</h4>
                    <div className="text-sm text-muted-foreground">
                      <p>{verification.submitted_data?.address?.street}</p>
                      <p>{verification.submitted_data?.address?.city}, {verification.submitted_data?.address?.state}</p>
                      <p>{verification.submitted_data?.address?.country} {verification.submitted_data?.address?.postalCode}</p>
                    </div>
                  </div>
                </div>

                {verification.verification_type === "business" && verification.submitted_data?.businessInfo && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Business Information</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Business: {verification.submitted_data.businessInfo.businessName}</p>
                      <p>Type: {verification.submitted_data.businessInfo.businessType}</p>
                      <p>Registration: {verification.submitted_data.businessInfo.registrationNumber}</p>
                      <p>Tax ID: {verification.submitted_data.businessInfo.taxId}</p>
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <h4 className="font-medium mb-2">Documents ({verification.documents?.length || 0})</h4>
                  <div className="flex flex-wrap gap-2">
                    {verification.documents?.map((doc: any, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {doc.type} - {doc.filename}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Submitted: {formatDate(verification.created_at)}
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        onClick={() => setSelectedVerification(verification)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Review Verification Request</DialogTitle>
                        <DialogDescription>
                          Review the verification request and take appropriate action.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="review-notes">Review Notes</Label>
                          <Textarea
                            id="review-notes"
                            placeholder="Add notes about your decision..."
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            rows={3}
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleVerificationAction("approve")}
                            disabled={processingAction !== null}
                            className="flex-1"
                          >
                            {processingAction === "approve" && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          
                          <Button
                            variant="outline"
                            onClick={() => handleVerificationAction("request_more_info")}
                            disabled={processingAction !== null || !reviewNotes.trim()}
                            className="flex-1"
                          >
                            {processingAction === "request_more_info" && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Request More Info
                          </Button>
                          
                          <Button
                            variant="destructive"
                            onClick={() => handleVerificationAction("reject")}
                            disabled={processingAction !== null || !reviewNotes.trim()}
                            className="flex-1"
                          >
                            {processingAction === "reject" && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
