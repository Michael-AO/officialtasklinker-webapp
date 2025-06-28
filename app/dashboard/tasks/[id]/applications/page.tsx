"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ArrowLeft,
  Clock,
  MessageSquare,
  Search,
  ThumbsDown,
  ThumbsUp,
  User,
  CheckCircle2,
  Loader2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { formatNaira } from "@/lib/currency"
import { NairaIcon } from "@/components/naira-icon"
import { useAuth } from "@/contexts/auth-context"

interface Application {
  id: string
  freelancer_id: string
  freelancer_name: string
  freelancer_avatar: string
  proposed_budget: number
  cover_letter: string
  status: "pending" | "interviewing" | "accepted" | "rejected"
  applied_date: string
}

interface Task {
  id: string
  title: string
}

export default function TaskApplicationsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const taskId = params.id as string

  const [applications, setApplications] = useState<Application[]>([])
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  // Fetch applications from API
  useEffect(() => {
    const fetchApplications = async () => {
      if (!taskId || !user?.id) {
        console.log("❌ Missing taskId or user:", { taskId, userId: user?.id })
        setError("Missing required data")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        console.log("🔄 Fetching applications for task:", taskId, "User:", user.id)

        const response = await fetch(`/api/tasks/${taskId}/applications`, {
          headers: {
            "user-id": user.id,
            Authorization: `Bearer ${(user as any).access_token || ""}`,
            "Content-Type": "application/json",
          },
        })

        const data = await response.json()

        console.log("📊 Applications API response:", data)

        if (response.ok && data.success) {
          setApplications(data.applications || [])
          setTask(data.task)
        } else {
          console.error("❌ Failed to fetch applications:", data)
          setError(data.error || "Failed to fetch applications")

          // Only use fallback data in development
          if (process.env.NODE_ENV === "development") {
            console.log("🔧 Using fallback data for development")
            setApplications([
              {
                id: "1",
                freelancer_id: "freelancer-1",
                freelancer_name: "Alex Rodriguez",
                freelancer_avatar: "/placeholder.svg?height=40&width=40",
                proposed_budget: 250000,
                cover_letter: "I have over 5 years of experience building e-commerce platforms with React and Node.js.",
                status: "pending",
                applied_date: new Date().toISOString(),
              },
              {
                id: "2",
                freelancer_id: "freelancer-2",
                freelancer_name: "Sarah Kim",
                freelancer_avatar: "/placeholder.svg?height=40&width=40",
                proposed_budget: 220000,
                cover_letter: "I specialize in building modern web applications with a focus on user experience.",
                status: "interviewing",
                applied_date: new Date().toISOString(),
              },
            ])
            setTask({ id: taskId, title: "Sample Task" })
          }
        }
      } catch (err) {
        console.error("❌ Error fetching applications:", err)
        setError("Network error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [taskId, user])

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.freelancer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update application status to accepted
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
        description: `${application?.freelancer_name}'s application has been accepted. They will be notified to start work.`,
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
        description: `${application?.freelancer_name}'s application has been rejected.`,
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
        prev.map((app) => (app.id === applicationId ? { ...app, status: "interviewing" } : app)),
      )

      const application = applications.find((app) => app.id === applicationId)

      toast({
        title: "Candidate Shortlisted",
        description: `${application?.freelancer_name} has been moved to interviewing.`,
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Task Applications</h1>
            <p className="text-muted-foreground">Loading applications...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (error && applications.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Task Applications</h1>
            <p className="text-muted-foreground text-red-600">Error: {error}</p>
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
            <p className="text-muted-foreground">
              {task?.title || "Loading task..."} - {applications.length} applications
            </p>
            {error && <p className="text-sm text-yellow-600">⚠️ Using fallback data due to: {error}</p>}
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
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {sortedApplications.length > 0 ? (
          sortedApplications.map((application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={application.freelancer_avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {application.freelancer_name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{application.freelancer_name}</h3>
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

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatNaira(application.proposed_budget)}</span>
                        <span>Applied {new Date(application.applied_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {application.status === "pending" && (
                      <>
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
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCurrentApplicationId(application.id)
                            setInterviewDialogOpen(true)
                          }}
                        >
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
                      </>
                    )}

                    {application.status === "interviewing" && (
                      <>
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
                      </>
                    )}

                    {application.status === "accepted" && (
                      <Button size="sm" asChild>
                        <a href={`/dashboard/tasks/${taskId}`}>View Project</a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-muted-foreground">{application.cover_letter}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold">No applications found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your filters"
                    : "No applications have been submitted yet"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog components */}
      <Dialog open={interviewDialogOpen} onOpenChange={setInterviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move to Interview Stage</DialogTitle>
            <DialogDescription>Shortlist this candidate for further consideration.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setInterviewDialogOpen(false)
                setCurrentApplicationId(null)
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

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>Are you sure you want to reject this application?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false)
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

      <Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Application</DialogTitle>
            <DialogDescription>Accept this application and notify the freelancer to start work.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAcceptDialogOpen(false)
                setCurrentApplicationId(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={() => currentApplicationId && handleAcceptApplication(currentApplicationId)}>
              Accept Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
