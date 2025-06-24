"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Calendar,
  Clock,
  DollarSign,
  Eye,
  MessageSquare,
  Search,
  Star,
  TrendingUp,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
} from "lucide-react"
import Link from "next/link"
import { useApplicationsReal } from "@/hooks/use-applications-real"
import { useAuth } from "@/contexts/auth-context"
import { formatNaira } from "@/lib/currency"

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  accepted: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  interviewing: "bg-blue-100 text-blue-800 border-blue-200",
  withdrawn: "bg-gray-100 text-gray-800 border-gray-200",
}

const statusIcons = {
  pending: <Clock className="h-3 w-3" />,
  accepted: <CheckCircle2 className="h-3 w-3" />,
  rejected: <XCircle className="h-3 w-3" />,
  interviewing: <MessageSquare className="h-3 w-3" />,
  withdrawn: <AlertCircle className="h-3 w-3" />,
}

export default function ApplicationsPage() {
  const { user } = useAuth()
  const { applications, loading, error, stats, isUsingRealData, withdrawApplication } = useApplicationsReal()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user?.user_type === "client"
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

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Applications</h1>
            <p className="text-muted-foreground">Loading applications...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Show error state but still display mock data
  if (error && applications.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Applications</h1>
            <p className="text-muted-foreground text-red-600">Error: {error}</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Failed to Load Applications</h3>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {user?.user_type === "client" ? "Applications Received" : "My Applications"}
          </h1>
          <p className="text-muted-foreground">
            {user?.user_type === "client"
              ? "Manage applications from freelancers"
              : "Track your job applications and their status"}
            {!isUsingRealData && (
              <Badge variant="outline" className="ml-2">
                Demo Data
              </Badge>
            )}
          </p>
        </div>
        <Button asChild>
          <Link href={user?.user_type === "client" ? "/dashboard/tasks/create" : "/dashboard/browse"}>
            <Search className="mr-2 h-4 w-4" />
            {user?.user_type === "client" ? "Post New Task" : "Find More Jobs"}
          </Link>
        </Button>
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

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={`Search ${user?.user_type === "client" ? "by freelancer or task" : "applications"}...`}
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

      {/* Application Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="accepted">Accepted ({stats.accepted})</TabsTrigger>
          <TabsTrigger value="interviewing">Interviewing ({stats.interviewing})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
          <TabsTrigger value="withdrawn">Withdrawn ({stats.withdrawn})</TabsTrigger>
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
                      : user?.user_type === "client"
                        ? "Applications will appear here when freelancers apply to your tasks"
                        : "Start applying to jobs to see them here"}
                  </p>
                  {!searchTerm && statusFilter === "all" && categoryFilter === "all" && (
                    <Button asChild>
                      <Link href={user?.user_type === "client" ? "/dashboard/tasks/create" : "/dashboard/browse"}>
                        <Search className="mr-2 h-4 w-4" />
                        {user?.user_type === "client" ? "Post Your First Task" : "Browse Jobs"}
                      </Link>
                    </Button>
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
                                user?.user_type === "client"
                                  ? application.freelancer?.avatar_url
                                  : application.task.client.avatar_url
                              }
                            />
                            <AvatarFallback>
                              {user?.user_type === "client"
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
                            {user?.user_type === "client"
                              ? `Freelancer: ${application.freelancer?.name}`
                              : `Client: ${application.task.client.name}`}
                          </span>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">
                              {user?.user_type === "client"
                                ? application.freelancer?.rating
                                : application.task.client.rating}
                            </span>
                          </div>
                          {(user?.user_type === "client"
                            ? application.freelancer?.is_verified
                            : application.task.client.is_verified) && (
                            <CheckCircle2 className="h-4 w-4 text-blue-600" />
                          )}
                        </div>

                        {user?.user_type === "client" && application.freelancer?.skills && (
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

                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">{application.cover_letter}</p>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">
                            {formatNaira(application.proposed_budget)}
                            {application.budget_type === "hourly" ? "/hr" : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{application.estimated_duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Applied {formatTimeAgo(application.applied_date)}</span>
                        </div>
                      </div>

                      {application.feedback && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Feedback:</strong> {application.feedback}
                          </p>
                        </div>
                      )}

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
                            Message {user?.user_type === "client" ? "Freelancer" : "Client"}
                          </Button>
                        </div>

                        <div className="flex gap-2">
                          {application.status === "pending" && user?.user_type === "freelancer" && (
                            <Button variant="ghost" size="sm" onClick={() => handleWithdrawApplication(application.id)}>
                              Withdraw
                            </Button>
                          )}

                          {application.status === "accepted" && (
                            <Button size="sm" asChild>
                              <Link href={`/dashboard/projects/${application.task_id}`}>View Project</Link>
                            </Button>
                          )}

                          {user?.user_type === "client" && application.status === "pending" && (
                            <Button size="sm" asChild>
                              <Link href={`/dashboard/applications/${application.id}`}>Review</Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
