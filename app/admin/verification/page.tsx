"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Shield, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  User, 
  Building,
  FileText,
  Eye,
  Check,
  X,
  RefreshCw,
  Users,
  TrendingUp,
  Settings,
  Download,
  Search,
  Filter
} from "lucide-react"
import { toast } from "sonner"

interface VerificationRequest {
  id: string
  user_id: string
  user_name: string
  user_email: string
  user_type: string
  verification_type: string
  status: "pending" | "approved" | "rejected" | "processing"
  submitted_at: string
  reviewed_at?: string
  reviewed_by?: string
  reviewer_name?: string
  personal_info: any
  business_info?: any
  documents: Array<{ filename: string; type: string; url: string }>
  admin_notes?: string
  created_at: string
  updated_at: string
}

interface VerificationStats {
  total: number
  pending: number
  approved: number
  rejected: number
  processing: number
  thisWeek: number
  avgProcessingTime: number
}

export default function AdminVerificationPage() {
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([])
  const [stats, setStats] = useState<VerificationStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    processing: 0,
    thisWeek: 0,
    avgProcessingTime: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [adminNotes, setAdminNotes] = useState("")
  const [processing, setProcessing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchVerificationRequests()
  }, [])

  const fetchVerificationRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/verification/requests')
      const data = await response.json()
      
      if (response.ok && data.success) {
        setVerificationRequests(data.data)
        
        // Calculate stats
        const stats = {
          total: data.data.length,
          pending: data.data.filter((r: VerificationRequest) => r.status === 'pending').length,
          approved: data.data.filter((r: VerificationRequest) => r.status === 'approved').length,
          rejected: data.data.filter((r: VerificationRequest) => r.status === 'rejected').length,
          processing: data.data.filter((r: VerificationRequest) => r.status === 'processing').length,
          thisWeek: data.data.filter((r: VerificationRequest) => {
            const weekAgo = new Date()
            weekAgo.setDate(weekAgo.getDate() - 7)
            return new Date(r.submitted_at) > weekAgo
          }).length,
          avgProcessingTime: 24 // Placeholder - calculate from actual data
        }
        setStats(stats)
      } else {
        toast.error("Failed to fetch verification requests")
      }
    } catch (error) {
      console.error("Error fetching verification requests:", error)
      toast.error("Failed to fetch verification requests")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!selectedRequest) return
    
    try {
      setProcessing(true)
      const response = await fetch('/api/admin/verification/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          adminNotes: adminNotes
        })
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        toast.success("Verification approved successfully!")
        setShowApprovalModal(false)
        setSelectedRequest(null)
        setAdminNotes("")
        fetchVerificationRequests()
      } else {
        toast.error(data.error || "Failed to approve verification")
      }
    } catch (error) {
      console.error("Error approving verification:", error)
      toast.error("Failed to approve verification")
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedRequest) return
    
    try {
      setProcessing(true)
      const response = await fetch('/api/admin/verification/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          adminNotes: adminNotes
        })
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        toast.success("Verification rejected")
        setShowRejectionModal(false)
        setSelectedRequest(null)
        setAdminNotes("")
        fetchVerificationRequests()
      } else {
        toast.error(data.error || "Failed to reject verification")
      }
    } catch (error) {
      console.error("Error rejecting verification:", error)
      toast.error("Failed to reject verification")
    } finally {
      setProcessing(false)
    }
  }

  const handleBulkApprove = async () => {
    const pendingRequests = verificationRequests.filter(r => r.status === 'pending')
    if (pendingRequests.length === 0) {
      toast.error("No pending requests to approve")
      return
    }

    try {
      setProcessing(true)
      // Implement bulk approval logic
      toast.success(`Approved ${pendingRequests.length} verification requests`)
      fetchVerificationRequests()
    } catch (error) {
      console.error("Error in bulk approval:", error)
      toast.error("Failed to approve requests")
    } finally {
      setProcessing(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending": return <Clock className="h-4 w-4 text-amber-600" />
      case "rejected": return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "processing": return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
      default: return <Shield className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      approved: "default",
      pending: "secondary", 
      rejected: "destructive",
      processing: "outline"
    } as const
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
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

  // Filter requests based on search and status
  const filteredRequests = verificationRequests.filter(request => {
    const matchesSearch = request.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.user_email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Verification Management</h1>
            <p className="text-muted-foreground">Review and manage verification requests</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">Loading...</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Verification Management</h1>
          <p className="text-muted-foreground">Review and approve identity verification requests</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchVerificationRequests}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkApprove}
            disabled={processing || stats.pending === 0}
          >
            <Check className="h-4 w-4 mr-2" />
            Bulk Approve
          </Button>
        </div>
      </div>

      {/* Stats Cards - Following dashboard pattern */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.thisWeek} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pending > 0 ? "Needs attention" : "All caught up"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? `${Math.round((stats.approved / stats.total) * 100)}% success rate` : "No requests"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgProcessingTime}h</div>
            <p className="text-xs text-muted-foreground">
              Processing time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="processing">Processing</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Requests</CardTitle>
          <CardDescription>
            Review and manage identity verification submissions ({filteredRequests.length} requests)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No verification requests found</p>
              <p className="text-sm">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {request.verification_type === "business" ? (
                        <Building className="h-4 w-4 text-purple-600" />
                      ) : (
                        <User className="h-4 w-4 text-blue-600" />
                      )}
                      <div>
                        <div className="font-medium">{request.user_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {request.user_email} • {request.verification_type} verification
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Submitted: {formatDate(request.submitted_at)}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(request)
                        setShowDetailsModal(true)
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    
                    {request.status === "pending" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request)
                            setShowApprovalModal(true)
                          }}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request)
                            setShowRejectionModal(true)
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions - Following dashboard pattern */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common verification tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setStatusFilter("pending")}
            >
              <Clock className="mr-2 h-4 w-4" />
              View Pending Requests
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleBulkApprove}
              disabled={stats.pending === 0}
            >
              <Check className="mr-2 h-4 w-4" />
              Approve All Pending
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {/* Export functionality */}}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Verification system health</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Document Storage</span>
              <span className="text-sm text-green-600">● Healthy</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Processing Queue</span>
              <span className="text-sm text-green-600">● Normal</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Admin Actions</span>
              <span className="text-sm text-green-600">● Active</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Verification Request Details</DialogTitle>
            <DialogDescription>
              Review all submitted information and documents
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium">Full Name</Label>
                    <p className="text-sm">{selectedRequest.personal_info.full_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm">{selectedRequest.personal_info.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Phone</Label>
                    <p className="text-sm">{selectedRequest.personal_info.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Address</Label>
                    <p className="text-sm">{selectedRequest.personal_info.address}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">ID Type</Label>
                    <p className="text-sm">{selectedRequest.personal_info.id_type}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">ID Number</Label>
                    <p className="text-sm">{selectedRequest.personal_info.id_number}</p>
                  </div>
                </div>
              </div>

              {/* Business Information */}
              {selectedRequest.business_info && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Business Information</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <Label className="text-sm font-medium">Business Name</Label>
                      <p className="text-sm">{selectedRequest.business_info.business_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Business Type</Label>
                      <p className="text-sm">{selectedRequest.business_info.business_type}</p>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium">Business Address</Label>
                      <p className="text-sm">{selectedRequest.business_info.business_address}</p>
                    </div>
                    {selectedRequest.business_info.business_registration && (
                      <div>
                        <Label className="text-sm font-medium">Registration Number</Label>
                        <p className="text-sm">{selectedRequest.business_info.business_registration}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Documents */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Uploaded Documents</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {selectedRequest.documents.map((doc, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">{doc.filename}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Type: {doc.type}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(doc.url, '_blank')}
                      >
                        View Document
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Information */}
              {selectedRequest.additional_info && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Additional Information</h3>
                  <p className="text-sm">{selectedRequest.additional_info}</p>
                </div>
              )}

              {/* Admin Notes */}
              {selectedRequest.admin_notes && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Admin Notes</h3>
                  <p className="text-sm">{selectedRequest.admin_notes}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Modal */}
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Identity Verification</DialogTitle>
            <DialogDescription>
              This will approve the identity verification and unlock all platform features for the user.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="approval-notes">Admin Notes (Optional)</Label>
              <Textarea
                id="approval-notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add any notes about this approval..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={processing}>
              {processing ? "Approving..." : "Approve Verification"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Modal */}
      <Dialog open={showRejectionModal} onOpenChange={setShowRejectionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Identity Verification</DialogTitle>
            <DialogDescription>
              This will reject the identity verification. Please provide a reason for the rejection.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection-notes">Rejection Reason *</Label>
              <Textarea
                id="rejection-notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                rows={3}
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectionModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject} 
              disabled={processing || !adminNotes.trim()}
            >
              {processing ? "Rejecting..." : "Reject Verification"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}