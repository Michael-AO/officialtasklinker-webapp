"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  AlertTriangle,
  Users,
  Shield,
  Loader2,
  RefreshCw
} from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { manualVerificationService } from "@/lib/services/manual-verification.service"

interface VerificationSubmission {
  id: string
  user_id: string
  status: 'pending' | 'under_review' | 'approved' | 'rejected'
  document_type: string
  front_image_url?: string
  back_image_url?: string
  selfie_with_document_url?: string
  additional_notes?: string
  submitted_at: string
  reviewed_at?: string
  reviewed_by?: string
  rejection_reason?: string
  verification_score?: number
  admin_notes?: string
  user_name?: string
  user_email?: string
  user_type?: string
  hours_pending?: number
  urgency_level?: 'normal' | 'warning' | 'overdue'
}

interface VerificationStats {
  total: number
  pending: number
  approved: number
  rejected: number
  overdue: number
}

export default function AdminVerificationQueue() {
  const [submissions, setSubmissions] = useState<VerificationSubmission[]>([])
  const [stats, setStats] = useState<VerificationStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    overdue: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [urgencyFilter, setUrgencyFilter] = useState("all")
  const [selectedSubmission, setSelectedSubmission] = useState<VerificationSubmission | null>(null)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null)
  const [reviewData, setReviewData] = useState({
    verificationScore: 85,
    adminNotes: "",
    rejectionReason: ""
  })

  useEffect(() => {
    fetchSubmissions()
    fetchStats()
  }, [])

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('admin_verification_queue')
        .select('*')
        .order('submitted_at', { ascending: true })

      if (error) {
        console.error('❌ Error fetching submissions:', error)
        throw error
      }

      setSubmissions(data || [])

    } catch (error) {
      console.error('❌ Error fetching verification submissions:', error)
      toast.error('Failed to fetch verification submissions')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const statsData = await manualVerificationService.getVerificationStats()
      setStats(statsData)

    } catch (error) {
      console.error('❌ Error fetching verification stats:', error)
    }
  }

  const handleReviewSubmission = (submission: VerificationSubmission, action: 'approve' | 'reject') => {
    setSelectedSubmission(submission)
    setReviewAction(action)
    setReviewData({
      verificationScore: 85,
      adminNotes: "",
      rejectionReason: ""
    })
    setIsReviewDialogOpen(true)
  }

  const handleSubmitReview = async () => {
    if (!selectedSubmission || !reviewAction) return

    try {
      if (reviewAction === 'approve') {
        await manualVerificationService.approveVerification(
          selectedSubmission.id,
          'admin-user-id', // You'll need to get this from auth context
          reviewData.verificationScore,
          reviewData.adminNotes
        )
        toast.success('Verification approved successfully!')
      } else {
        await manualVerificationService.rejectVerification(
          selectedSubmission.id,
          'admin-user-id', // You'll need to get this from auth context
          reviewData.rejectionReason,
          reviewData.adminNotes
        )
        toast.success('Verification rejected')
      }

      setIsReviewDialogOpen(false)
      fetchSubmissions()
      fetchStats()

    } catch (error) {
      console.error('❌ Error submitting review:', error)
      toast.error('Failed to submit review')
    }
  }

  const getStatusBadge = (status: string, urgencyLevel?: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium"
    
    switch (status) {
      case 'pending':
        if (urgencyLevel === 'overdue') {
          return <Badge className={`${baseClasses} bg-red-100 text-red-800`}>⚠️ Overdue</Badge>
        } else if (urgencyLevel === 'warning') {
          return <Badge className={`${baseClasses} bg-yellow-100 text-yellow-800`}>⏰ Warning</Badge>
        } else {
          return <Badge className={`${baseClasses} bg-blue-100 text-blue-800`}>⏳ Pending</Badge>
        }
      case 'approved':
        return <Badge className={`${baseClasses} bg-green-100 text-green-800`}>✅ Approved</Badge>
      case 'rejected':
        return <Badge className={`${baseClasses} bg-red-100 text-red-800`}>❌ Rejected</Badge>
      case 'under_review':
        return <Badge className={`${baseClasses} bg-purple-100 text-purple-800`}>👀 Under Review</Badge>
      default:
        return <Badge className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</Badge>
    }
  }

  const getDocumentTypeName = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'id_card': 'National ID Card',
      'voters_card': 'Voter ID Card',
      'drivers_license': "Driver's License",
      'passport': 'International Passport',
      'other': 'Other Government ID'
    }
    return typeMap[type] || type
  }

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = 
      submission.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter
    
    const matchesUrgency = urgencyFilter === 'all' || submission.urgency_level === urgencyFilter

    return matchesSearch && matchesStatus && matchesUrgency
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading verification queue...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manual Verification Queue</h1>
          <p className="text-gray-500 mt-1">Review and approve manual verification submissions</p>
        </div>
        <Button onClick={() => { fetchSubmissions(); fetchStats(); }}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All submissions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">24+ hours pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">Successfully verified</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">Failed verification</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Submissions</CardTitle>
          <CardDescription>Review and manage manual verification submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or submission ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Urgency</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Submissions Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Document Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Hours Pending</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{submission.user_name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{submission.user_email}</div>
                      <Badge variant="outline" className="text-xs mt-1">
                        {submission.user_type}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gray-400" />
                      {getDocumentTypeName(submission.document_type)}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(submission.status, submission.urgency_level)}</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(submission.submitted_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {submission.status === 'pending' && submission.hours_pending ? (
                      <span className={`text-sm font-medium ${
                        submission.hours_pending > 24 ? 'text-red-600' :
                        submission.hours_pending > 12 ? 'text-yellow-600' :
                        'text-gray-600'
                      }`}>
                        {Math.round(submission.hours_pending)}h
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {submission.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleReviewSubmission(submission, 'approve')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReviewSubmission(submission, 'reject')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedSubmission(submission)
                          setIsReviewDialogOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredSubmissions.length === 0 && (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Verification Submissions</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" || urgencyFilter !== "all"
                  ? "No submissions match your current filters."
                  : "No manual verification submissions have been submitted yet."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Approve Verification' : 'Reject Verification'}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'approve' 
                ? 'Review the submitted documents and approve if they meet verification requirements.'
                : 'Provide a reason for rejection to help the user improve their submission.'
              }
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">User Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {selectedSubmission.user_name}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {selectedSubmission.user_email}
                  </div>
                  <div>
                    <span className="font-medium">Type:</span> {selectedSubmission.user_type}
                  </div>
                  <div>
                    <span className="font-medium">Document:</span> {getDocumentTypeName(selectedSubmission.document_type)}
                  </div>
                </div>
              </div>

              {/* Document Images */}
              <div>
                <h4 className="font-medium mb-3">Submitted Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedSubmission.front_image_url && (
                    <div>
                      <h5 className="text-sm font-medium mb-2">Front Image</h5>
                      <img 
                        src={selectedSubmission.front_image_url} 
                        alt="Front document"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                  {selectedSubmission.back_image_url && (
                    <div>
                      <h5 className="text-sm font-medium mb-2">Back Image</h5>
                      <img 
                        src={selectedSubmission.back_image_url} 
                        alt="Back document"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                  {selectedSubmission.selfie_with_document_url && (
                    <div>
                      <h5 className="text-sm font-medium mb-2">Selfie with Document</h5>
                      <img 
                        src={selectedSubmission.selfie_with_document_url} 
                        alt="Selfie with document"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Notes */}
              {selectedSubmission.additional_notes && (
                <div>
                  <h4 className="font-medium mb-2">User Notes</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {selectedSubmission.additional_notes}
                  </p>
                </div>
              )}

              {/* Review Form */}
              <div className="space-y-4">
                {reviewAction === 'approve' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Verification Confidence Score (1-100)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={reviewData.verificationScore}
                      onChange={(e) => setReviewData(prev => ({
                        ...prev,
                        verificationScore: parseInt(e.target.value) || 85
                      }))}
                    />
                  </div>
                )}

                {reviewAction === 'reject' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Rejection Reason *
                    </label>
                    <Select
                      value={reviewData.rejectionReason}
                      onValueChange={(value) => setReviewData(prev => ({
                        ...prev,
                        rejectionReason: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select rejection reason..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="poor_quality">Poor image quality</SelectItem>
                        <SelectItem value="unreadable">Document text not readable</SelectItem>
                        <SelectItem value="expired">Document appears expired</SelectItem>
                        <SelectItem value="invalid_document">Invalid document type</SelectItem>
                        <SelectItem value="missing_information">Missing required information</SelectItem>
                        <SelectItem value="suspicious">Suspicious or fraudulent</SelectItem>
                        <SelectItem value="other">Other (specify in notes)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Admin Notes
                  </label>
                  <Textarea
                    placeholder="Additional notes about this verification..."
                    value={reviewData.adminNotes}
                    onChange={(e) => setReviewData(prev => ({
                      ...prev,
                      adminNotes: e.target.value
                    }))}
                    rows={3}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsReviewDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitReview}
                  className={
                    reviewAction === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }
                  disabled={reviewAction === 'reject' && !reviewData.rejectionReason}
                >
                  {reviewAction === 'approve' ? 'Approve Verification' : 'Reject Verification'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
