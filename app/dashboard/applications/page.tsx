"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  Clock,
  TrendingUp,
  User,
  Star,
  Search,
  Users,
  CheckCircle2,
  MessageSquare,
  Eye,
  Plus,
  Briefcase,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useApplicationsReal } from "@/hooks/use-applications-real"
import { formatNaira } from "@/lib/currency"

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  interviewing: "bg-blue-100 text-blue-800",
  withdrawn: "bg-gray-100 text-gray-800",
}

const statusIcons = {
  pending: <Clock className="h-3 w-3" />,
  accepted: <CheckCircle2 className="h-3 w-3" />,
  rejected: <XCircle className="h-3 w-3" />,
  interviewing: <MessageSquare className="h-3 w-3" />,
  withdrawn: <User className="h-3 w-3" />,
}

export default function ApplicationsPage() {
  const { user } = useAuth()
  const { applications, loading, error, stats, isUsingRealData, withdrawApplication } = useApplicationsReal()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("sent") // "sent" or "received"

  // Separate applications by type
  const sentApplications = applications.filter(app => app.freelancer?.id === user?.id)
  const receivedApplications = applications.filter(app => app.task.client.id === user?.id)

  const currentApplications = activeTab === "sent" ? sentApplications : receivedApplications

  const filteredApplications = currentApplications.filter((app) => {
    const matchesSearch =
      app.task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (activeTab === "received"
        ? app.freelancer?.name.toLowerCase().includes(searchTerm.toLowerCase())
        : app.task.client.name.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === "all" || app.status === statusFilter
    const matchesCategory = categoryFilter === "all" || app.task.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  const handleWithdrawApplication = async (applicationId: string) => {
    const result = await withdrawApplication(applicationId)
    if (!result.success) {
      alert(result.error || "Failed to withdraw application")
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 24) {
      return `${diffInHours} hours ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays} days ago`
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading applications...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-600 mb-4">Error loading applications</div>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Applications</h1>
          <p className="text-muted-foreground">
            Manage your job applications and received applications
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/browse">
              <Search className="mr-2 h-4 w-4" />
              Find Jobs
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/tasks/create">
              <Plus className="mr-2 h-4 w-4" />
              Post Task
            </Link>
          </Button>
        </div>
      </div>

      {/* Application Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? "All time applications" : "No applications yet"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <Progress value={stats.successRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accepted}</div>
            <p className="text-xs text-muted-foreground">Active projects</p>
          </CardContent>
        </Card>
      </div>

      {/* Application Type Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sent">
            <Briefcase className="mr-2 h-4 w-4" />
            Applications I Sent ({sentApplications.length})
          </TabsTrigger>
          <TabsTrigger value="received">
            <Users className="mr-2 h-4 w-4" />
            Applications I Received ({receivedApplications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder={`Search ${activeTab === "received" ? "by freelancer or task" : "applications"}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="interviewing">Interviewing</SelectItem>
                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Web Development">Web Development</SelectItem>
                    <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Data Science">Data Science</SelectItem>
                    <SelectItem value="Writing">Writing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Status Filter Tabs */}
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All ({filteredApplications.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({filteredApplications.filter(a => a.status === "pending").length})</TabsTrigger>
              <TabsTrigger value="accepted">Accepted ({filteredApplications.filter(a => a.status === "accepted").length})</TabsTrigger>
              <TabsTrigger value="interviewing">Interviewing ({filteredApplications.filter(a => a.status === "interviewing").length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({filteredApplications.filter(a => a.status === "rejected").length})</TabsTrigger>
              <TabsTrigger value="withdrawn">Withdrawn ({filteredApplications.filter(a => a.status === "withdrawn").length})</TabsTrigger>
            </TabsList>

            <TabsContent value={statusFilter} className="space-y-4">
              {filteredApplications.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="text-center">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold">No applications found</h3>
                      <p className="text-muted-foreground mb-4">
                        {searchTerm || statusFilter !== "all" || categoryFilter !== "all"
                          ? "Try adjusting your filters"
                          : activeTab === "received"
                            ? "Applications will appear here when freelancers apply to your tasks"
                            : "Start applying to jobs to see them here"}
                      </p>
                      {!searchTerm && statusFilter === "all" && categoryFilter === "all" && (
                        <div className="flex gap-2 justify-center">
                          <Button asChild>
                            <Link href="/dashboard/tasks/create">
                              <Plus className="mr-2 h-4 w-4" />
                              Post Your First Task
                            </Link>
                          </Button>
                          <Button asChild variant="outline">
                            <Link href="/dashboard/browse">
                              <Search className="mr-2 h-4 w-4" />
                              Browse Jobs
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredApplications.map((application) => (
                    <Card key={application.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-xl">{application.task.title}</CardTitle>
                              <Badge className={statusColors[application.status]}>
                                {statusIcons[application.status]}
                                <span className="ml-1">{application.status}</span>
                              </Badge>
                            </div>

                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={
                                    activeTab === "received"
                                      ? application.freelancer?.avatar_url
                                      : application.task.client.avatar_url
                                  }
                                />
                                <AvatarFallback>
                                  {activeTab === "received"
                                    ? application.freelancer?.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                    : application.task.client.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-muted-foreground">
                                {activeTab === "received"
                                  ? `Freelancer: ${application.freelancer?.name}`
                                  : `Client: ${application.task.client.name}`}
                              </span>
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs">
                                  {activeTab === "received"
                                    ? application.freelancer?.rating
                                    : application.task.client.rating}
                                </span>
                              </div>
                              {(activeTab === "received"
                                ? application.freelancer?.is_verified
                                : application.task.client.is_verified) && (
                                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                              )}
                            </div>

                            {activeTab === "received" && application.freelancer?.skills && (
                              <div className="flex flex-wrap gap-2">
                                {application.freelancer.skills.slice(0, 4).map((skill) => (
                                  <Badge key={skill} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {application.freelancer.skills.length > 4 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{application.freelancer.skills.length - 4} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Proposed Budget</p>
                            <p className="font-medium">{formatNaira(application.proposed_budget)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Duration</p>
                            <p className="font-medium">{application.estimated_duration || "Not specified"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Applied</p>
                            <p className="font-medium">{formatTimeAgo(application.applied_date)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Category</p>
                            <p className="font-medium">{application.task.category}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium">Cover Letter:</p>
                          <p className="text-sm text-muted-foreground line-clamp-3">{application.cover_letter}</p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/dashboard/tasks/${application.task_id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Task
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" disabled className="opacity-50 cursor-not-allowed">
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Message {activeTab === "received" ? "Freelancer" : "Client"}
                            </Button>
                          </div>

                          <div className="flex gap-2">
                            {application.status === "pending" && activeTab === "sent" && (
                              <Button variant="ghost" size="sm" onClick={() => handleWithdrawApplication(application.id)}>
                                Withdraw
                              </Button>
                            )}

                            {application.status === "accepted" && (
                              <Button size="sm" asChild>
                                <Link href={`/dashboard/projects/${application.task_id}`}>View Project</Link>
                              </Button>
                            )}

                            {activeTab === "received" && application.status === "pending" && (
                              <Button size="sm" asChild>
                                <Link href={`/dashboard/applications/${application.id}`}>Review</Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  )
}
