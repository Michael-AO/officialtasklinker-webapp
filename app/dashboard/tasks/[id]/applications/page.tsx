"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Calendar,
  Clock,
  MessageSquare,
  Search,
  Star,
  ThumbsDown,
  ThumbsUp,
  User,
  CheckCircle2,
  Eye,
  Users,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { formatNaira } from "@/lib/currency"
import { NairaIcon } from "@/components/naira-icon"
import { useAuth } from "@/contexts/auth-context"

export default function TaskApplicationsPage() {
  const params = useParams()
  const router = useRouter()
  const taskId = params.id as string

  // Mock applications data with interview workflow
  const [applications, setApplications] = useState([
    {
      id: "1",
      task_id: taskId,
      freelancer_id: "freelancer-1",
      proposed_budget: 250000,
      budget_type: "fixed",
      estimated_duration: "4-6 weeks",
      cover_letter:
        "I have over 5 years of experience building e-commerce platforms with React and Node.js. I've successfully delivered 15+ similar projects with excellent client satisfaction.",
      status: "pending",
      applied_date: "2024-01-16T10:30:00Z",
      interview_notes: "",
      interview_date: null,
      freelancer: {
        id: "freelancer-1",
        name: "Alex Rodriguez",
        avatar_url: "/placeholder.svg?height=40&width=40",
        rating: 4.9,
        completed_tasks: 127,
        skills: ["React", "Node.js", "MongoDB", "TypeScript"],
        is_verified: true,
      },
    },
    {
      id: "2",
      task_id: taskId,
      freelancer_id: "freelancer-2",
      proposed_budget: 220000,
      budget_type: "fixed",
      estimated_duration: "5-7 weeks",
      cover_letter:
        "I specialize in building modern web applications with a focus on user experience and performance. My recent e-commerce project increased client sales by 40%.",
      status: "interviewing",
      applied_date: "2024-01-16T14:15:00Z",
      interview_notes: "Great communication skills, solid portfolio. Need to discuss timeline in detail.",
      interview_date: "2024-01-18T15:00:00Z",
      freelancer: {
        id: "freelancer-2",
        name: "Sarah Kim",
        avatar_url: "/placeholder.svg?height=40&width=40",
        rating: 4.8,
        completed_tasks: 89,
        skills: ["React", "Vue.js", "Node.js", "PostgreSQL"],
        is_verified: true,
      },
    },
    {
      id: "3",
      task_id: taskId,
      freelancer_id: "freelancer-3",
      proposed_budget: 280000,
      budget_type: "fixed",
      estimated_duration: "3-5 weeks",
      cover_letter:
        "I'm a full-stack developer with expertise in scalable e-commerce solutions. I use modern technologies and best practices to ensure your platform can handle growth.",
      status: "interviewing",
      applied_date: "2024-01-17T09:20:00Z",
      interview_notes: "Excellent technical skills, very experienced. Slightly higher budget but worth considering.",
      interview_date: "2024-01-19T10:00:00Z",
      freelancer: {
        id: "freelancer-3",
        name: "David Chen",
        avatar_url: "/placeholder.svg?height=40&width=40",
        rating: 4.7,
        completed_tasks: 156,
        skills: ["React", "Node.js", "AWS", "Docker"],
        is_verified: false,
      },
    },
    {
      id: "4",
      task_id: taskId,
      freelancer_id: "freelancer-4",
      proposed_budget: 200000,
      budget_type: "fixed",
      estimated_duration: "6-8 weeks",
      cover_letter:
        "I'm a passionate developer with 3 years of experience. I may be newer but I'm dedicated and offer competitive rates.",
      status: "pending",
      applied_date: "2024-01-17T16:45:00Z",
      interview_notes: "",
      interview_date: null,
      freelancer: {
        id: "freelancer-4",
        name: "Amara Okafor",
        avatar_url: "/placeholder.svg?height=40&width=40",
        rating: 4.5,
        completed_tasks: 23,
        skills: ["React", "Node.js", "Express", "MongoDB"],
        is_verified: true,
      },
    },
  ])

  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [rejectFeedback, setRejectFeedback] = useState("")
  const [interviewNotes, setInterviewNotes] = useState("")
  const [isRejecting, setIsRejecting] = useState(false)
  const [isAccepting, setIsAccepting] = useState(false)
  const [isInterviewing, setIsInterviewing] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false)
  const [interviewDialogOpen, setInterviewDialogOpen] = useState(false)
  const [currentApplicationId, setCurrentApplicationId] = useState<string | null>(null)

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.freelancer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.cover_letter.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || app.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.applied_date).getTime() - new Date(a.applied_date).getTime()
      case "oldest":
        return new Date(a.applied_date).getTime() - new Date(b.applied_date).getTime()
      case "budget_high":
        return b.proposed_budget - a.proposed_budget
      case "budget_low":
        return a.proposed_budget - b.proposed_budget
      case "rating":
        return (b.freelancer?.rating || 0) - (a.freelancer?.rating || 0)
      default:
        return 0
    }
  })

  const applicationCounts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    interviewing: applications.filter((a) => a.status === "interviewing").length,
    accepted: applications.filter((a) => a.status === "accepted").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  }

  const handleAcceptApplication = async (applicationId: string) => {
    setIsAccepting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Update application status and reject others
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId
            ? { ...app, status: "accepted" }
            : app.status === "pending" || app.status === "interviewing"
              ? { ...app, status: "rejected" }
              : app,
        ),
      )

      const application = applications.find((app) => app.id === applicationId)

      toast({
        title: "Application Accepted!",
        description: `${application?.freelancer?.name}'s application has been accepted. An escrow has been created and they've been notified.`,
      })

      setAcceptDialogOpen(false)
      setCurrentApplicationId(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAccepting(false)
    }
  }

  const handleRejectApplication = async (applicationId: string) => {
    setIsRejecting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setApplications((prev) => prev.map((app) => (app.id === applicationId ? { ...app, status: "rejected" } : app)))

      const application = applications.find((app) => app.id === applicationId)

      toast({
        title: "Application Rejected",
        description: `${application?.freelancer?.name}'s application has been rejected${rejectFeedback ? " with feedback" : ""}.`,
      })

      setRejectDialogOpen(false)
      setCurrentApplicationId(null)
      setRejectFeedback("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRejecting(false)
    }
  }

  const handleInterviewApplication = async (applicationId: string) => {
    setIsInterviewing(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId
            ? {
                ...app,
                status: "interviewing",
                interview_notes: interviewNotes || "Shortlisted for consideration",
                interview_date: new Date().toISOString(),
              }
            : app,
        ),
      )

      const application = applications.find((app) => app.id === applicationId)

      toast({
        title: "Candidate Shortlisted",
        description: `${application?.freelancer?.name} has been moved to interviewing. You can now message them to discuss the project.`,
      })

      setInterviewDialogOpen(false)
      setCurrentApplicationId(null)
      setInterviewNotes("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update application status.",
        variant: "destructive",
      })
    } finally {
      setIsInterviewing(false)
    }
  }

  const openInterviewDialog = (applicationId: string) => {
    const application = applications.find((app) => app.id === applicationId)
    setCurrentApplicationId(applicationId)
    setInterviewNotes(application?.interview_notes || "")
    setInterviewDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Task Applications</h1>
            <p className="text-muted-foreground">Review and manage applications for your task</p>
          </div>
        </div>
        <Button asChild>
          <a href={`/dashboard/tasks/${taskId}`}>View Task Details</a>
        </Button>
      </div>

      {/* Application Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applicationCounts.all}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applicationCounts.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interviewing</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applicationCounts.interviewing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applicationCounts.accepted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Budget</CardTitle>
            <NairaIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applications.length > 0
                ? formatNaira(
                    Math.round(applications.reduce((sum, app) => sum + app.proposed_budget, 0) / applications.length),
                  )
                : formatNaira(0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interview Summary for Interviewing Candidates */}
      {applicationCounts.interviewing > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Users className="h-5 w-5" />
              Interview Summary ({applicationCounts.interviewing} candidates)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {applications
                .filter((app) => app.status === "interviewing")
                .map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={app.freelancer?.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>
                          {app.freelancer?.name
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{app.freelancer?.name}</p>
                        <p className="text-sm text-muted-foreground">{formatNaira(app.proposed_budget)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setCurrentApplicationId(app.id)
                          setRejectDialogOpen(true)
                        }}
                      >
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setCurrentApplicationId(app.id)
                          setAcceptDialogOpen(true)
                        }}
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> These candidates are shortlisted for consideration. Message them to discuss
                project details, then accept your preferred candidate. All others will be automatically rejected.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search applications..."
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
                <SelectItem value="interviewing">Interviewing</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="budget_high">Budget: High to Low</SelectItem>
                <SelectItem value="budget_low">Budget: Low to High</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({applicationCounts.all})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({applicationCounts.pending})</TabsTrigger>
          <TabsTrigger value="interviewing">Interviewing ({applicationCounts.interviewing})</TabsTrigger>
          <TabsTrigger value="accepted">Accepted ({applicationCounts.accepted})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({applicationCounts.rejected})</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="space-y-4">
          {sortedApplications.length > 0 ? (
            <div className="space-y-4">
              {sortedApplications.map((application) => (
                <Card key={application.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={application.freelancer?.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback>
                            {application.freelancer?.name
                              ?.split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{application.freelancer?.name}</h3>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">{application.freelancer?.rating}</span>
                              <span className="text-sm text-muted-foreground">
                                ({application.freelancer?.completed_tasks} jobs)
                              </span>
                            </div>
                            {application.freelancer?.is_verified && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Nigeria</span>
                            <span>Responds in 2 hours</span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {application.freelancer?.skills?.slice(0, 4).map((skill: string) => (
                              <Badge key={skill} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                            {(application.freelancer?.skills?.length || 0) > 4 && (
                              <Badge variant="secondary">
                                +{(application.freelancer?.skills?.length || 0) - 4} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <Badge
                          className={
                            application.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : application.status === "interviewing"
                                ? "bg-blue-100 text-blue-800"
                                : application.status === "accepted"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                          }
                        >
                          {application.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm">{application.cover_letter}</p>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <NairaIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">
                            {formatNaira(application.proposed_budget)} ({application.budget_type})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{application.estimated_duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Applied {new Date(application.applied_date).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Interview Notes Display */}
                      {application.status === "interviewing" && application.interview_notes && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <h5 className="font-medium text-blue-800 mb-1">Interview Notes:</h5>
                          <p className="text-sm text-blue-700">{application.interview_notes}</p>
                          {application.interview_date && (
                            <p className="text-xs text-blue-600 mt-1">
                              Interviewed on {new Date(application.interview_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedApplication(application)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Profile
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Freelancer Profile</DialogTitle>
                                <DialogDescription>
                                  Detailed information about {application.freelancer?.name}
                                </DialogDescription>
                              </DialogHeader>
                              {selectedApplication && (
                                <div className="space-y-4">
                                  <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16">
                                      <AvatarImage
                                        src={selectedApplication.freelancer?.avatar_url || "/placeholder.svg"}
                                      />
                                      <AvatarFallback>
                                        {selectedApplication.freelancer?.name
                                          ?.split(" ")
                                          .map((n: string) => n[0])
                                          .join("")}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <h3 className="text-xl font-semibold">{selectedApplication.freelancer?.name}</h3>
                                      <p className="text-muted-foreground">Nigeria</p>
                                      <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        <span>{selectedApplication.freelancer?.rating}</span>
                                        <span className="text-muted-foreground">
                                          ({selectedApplication.freelancer?.completed_tasks} completed jobs)
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-semibold mb-2">Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {selectedApplication.freelancer?.skills?.map((skill: string) => (
                                        <Badge key={skill} variant="secondary">
                                          {skill}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-semibold mb-2">Cover Letter</h4>
                                    <p className="text-sm text-muted-foreground">{selectedApplication.cover_letter}</p>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          <Button variant="outline" size="sm" asChild>
                            <a href={`/dashboard/messages?freelancer=${application.freelancer?.name}`}>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Message
                            </a>
                          </Button>
                        </div>

                        {/* Action Buttons Based on Status */}
                        {application.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setCurrentApplicationId(application.id)
                                setRejectDialogOpen(true)
                              }}
                            >
                              <ThumbsDown className="mr-2 h-4 w-4" />
                              Reject
                            </Button>

                            <Button variant="outline" size="sm" onClick={() => openInterviewDialog(application.id)}>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Interview
                            </Button>

                            <Button
                              size="sm"
                              onClick={() => {
                                setCurrentApplicationId(application.id)
                                setAcceptDialogOpen(true)
                              }}
                            >
                              <ThumbsUp className="mr-2 h-4 w-4" />
                              Accept
                            </Button>
                          </div>
                        )}

                        {application.status === "interviewing" && (
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => openInterviewDialog(application.id)}>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Update Notes
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setCurrentApplicationId(application.id)
                                setRejectDialogOpen(true)
                              }}
                            >
                              <ThumbsDown className="mr-2 h-4 w-4" />
                              Reject
                            </Button>

                            <Button
                              size="sm"
                              onClick={() => {
                                setCurrentApplicationId(application.id)
                                setAcceptDialogOpen(true)
                              }}
                            >
                              <ThumbsUp className="mr-2 h-4 w-4" />
                              Accept
                            </Button>
                          </div>
                        )}

                        {application.status === "accepted" && (
                          <Button size="sm" asChild>
                            <a href={`/dashboard/tasks/${taskId}`}>View Project</a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <h3 className="text-lg font-semibold">No applications found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== "all"
                      ? "Try adjusting your filters"
                      : "No applications match the current criteria"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Simple Interview Dialog - Just for shortlisting */}
      <Dialog open={interviewDialogOpen} onOpenChange={setInterviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move to Interview Stage</DialogTitle>
            <DialogDescription>
              Shortlist this candidate for further consideration. You can chat with them to discuss the project details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {currentApplicationId && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Candidate Details</h4>
                {(() => {
                  const app = applications.find((a) => a.id === currentApplicationId)
                  return app ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Name:</span>
                        <span className="font-semibold">{app.freelancer?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Budget:</span>
                        <span className="font-semibold">{formatNaira(app.proposed_budget)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{app.estimated_duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rating:</span>
                        <span>
                          ⭐ {app.freelancer?.rating} ({app.freelancer?.completed_tasks} jobs)
                        </span>
                      </div>
                    </div>
                  ) : null
                })()}
              </div>
            )}

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Next Steps:</strong> This candidate will be moved to "Interviewing" status. You can then message
                them to discuss project details before making your final decision.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Quick Notes (Optional)</label>
              <Textarea
                value={interviewNotes}
                onChange={(e) => setInterviewNotes(e.target.value)}
                placeholder="Why are you considering this candidate? (optional)"
                className="mt-1"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setInterviewDialogOpen(false)
                setCurrentApplicationId(null)
                setInterviewNotes("")
              }}
              disabled={isInterviewing}
            >
              Cancel
            </Button>
            <Button
              onClick={() => currentApplicationId && handleInterviewApplication(currentApplicationId)}
              disabled={isInterviewing}
            >
              {isInterviewing ? "Processing..." : "Move to Interviewing"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this application? You can optionally provide feedback.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Optional feedback for the freelancer..."
              className="min-h-[100px]"
              value={rejectFeedback}
              onChange={(e) => setRejectFeedback(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false)
                setRejectFeedback("")
                setCurrentApplicationId(null)
              }}
              disabled={isRejecting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => currentApplicationId && handleRejectApplication(currentApplicationId)}
              disabled={isRejecting}
            >
              {isRejecting ? "Rejecting..." : "Reject Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Accept Dialog */}
      <Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Application</DialogTitle>
            <DialogDescription>Accept this application and start the project.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {currentApplicationId && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Project Details</h4>
                {(() => {
                  const app = applications.find((a) => a.id === currentApplicationId)
                  return app ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Budget:</span>
                        <span className="font-semibold">{formatNaira(app.proposed_budget)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{app.estimated_duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Freelancer:</span>
                        <span>{app.freelancer?.name}</span>
                      </div>
                    </div>
                  ) : null
                })()}
              </div>
            )}
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> By accepting this application, an escrow will be created and the freelancer
                will be notified to start work. All other applications (pending and interviewing) will be automatically
                rejected.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAcceptDialogOpen(false)
                setCurrentApplicationId(null)
              }}
              disabled={isAccepting}
            >
              Cancel
            </Button>
            <Button
              onClick={() => currentApplicationId && handleAcceptApplication(currentApplicationId)}
              disabled={isAccepting}
            >
              {isAccepting ? "Accepting..." : "Accept & Create Escrow"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
