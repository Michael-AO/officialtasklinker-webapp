"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  HelpCircle, 
  Search, 
  Filter, 
  Mail, 
  Calendar, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface SupportRequest {
  id: string
  user_id?: string
  name: string
  email: string
  subject: string
  message: string
  status: 'pending' | 'in_progress' | 'resolved' | 'closed'
  created_at: string
  updated_at: string
}

export default function AdminSupportPage() {
  const { user } = useAuth()
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<SupportRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null)
  const [selectedTab, setSelectedTab] = useState<string>("all")

  useEffect(() => {
    fetchSupportRequests()
  }, [])

  useEffect(() => {
    filterRequests()
  }, [supportRequests, searchTerm, statusFilter, selectedTab])

  const fetchSupportRequests = async () => {
    try {
      const response = await fetch("/api/admin/support-requests", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setSupportRequests(data.supportRequests || [])
      } else {
        console.error("Failed to fetch support requests")
      }
    } catch (error) {
      console.error("Error fetching support requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterRequests = () => {
    let filtered = supportRequests

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (request) =>
          request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.message.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status filter (from select dropdown)
    if (statusFilter !== "all") {
      filtered = filtered.filter((request) => request.status === statusFilter)
    }

    // Filter by selected tab
    if (selectedTab !== "all") {
      filtered = filtered.filter((request) => request.status === selectedTab)
    }

    setFilteredRequests(filtered)
  }

  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/support-requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Update the local state
        setSupportRequests(prev =>
          prev.map(request =>
            request.id === requestId
              ? { ...request, status: newStatus as any, updated_at: new Date().toISOString() }
              : request
          )
        )
      }
    } catch (error) {
      console.error("Error updating request status:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      in_progress: { color: "bg-blue-100 text-blue-800", icon: AlertCircle },
      resolved: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      closed: { color: "bg-gray-100 text-gray-800", icon: XCircle },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace("_", " ")}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading support requests...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HelpCircle className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Support Requests</h1>
            <p className="text-gray-600">Manage and respond to user support requests</p>
          </div>
        </div>
        <Button onClick={fetchSupportRequests} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, subject, or message..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold">{supportRequests.length}</p>
              </div>
              <HelpCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {supportRequests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {supportRequests.filter(r => r.status === 'in_progress').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">
                  {supportRequests.filter(r => r.status === 'resolved').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({supportRequests.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({supportRequests.filter(r => r.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress ({supportRequests.filter(r => r.status === 'in_progress').length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({supportRequests.filter(r => r.status === 'resolved').length})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({supportRequests.filter(r => r.status === 'closed').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab}>
          {/* Support Requests List */}
          <Card>
            <CardHeader>
              <CardTitle>Support Requests ({filteredRequests.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No support requests found
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{request.subject}</h3>
                            {getStatusBadge(request.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {request.name} ({request.email})
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(request.created_at)}
                            </div>
                          </div>
                          <p className="text-gray-700 line-clamp-2">{request.message}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedRequest(request)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Support Request Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h3 className="font-semibold text-lg">{request.subject}</h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    {getStatusBadge(request.status)}
                                    <span className="text-sm text-gray-500">
                                      {formatDate(request.created_at)}
                                    </span>
                                  </div>
                                </div>
                                <Separator />
                                <div>
                                  <h4 className="font-medium mb-2">Contact Information</h4>
                                  <div className="space-y-1 text-sm">
                                    <p><strong>Name:</strong> {request.name}</p>
                                    <p><strong>Email:</strong> {request.email}</p>
                                  </div>
                                </div>
                                <Separator />
                                <div>
                                  <h4 className="font-medium mb-2">Message</h4>
                                  <p className="text-gray-700 whitespace-pre-wrap">{request.message}</p>
                                </div>
                                <Separator />
                                <div>
                                  <h4 className="font-medium mb-2">Update Status</h4>
                                  <div className="flex gap-2">
                                    <Select
                                      value={request.status}
                                      onValueChange={(value) => updateRequestStatus(request.id, value)}
                                    >
                                      <SelectTrigger className="w-48">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                        <SelectItem value="closed">Closed</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 