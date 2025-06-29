"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  MapPin,
  MessageSquare,
  Settings,
  Users,
  FileText,
  CheckCircle2,
} from "lucide-react"
import Link from "next/link"
import { MilestoneManager } from "@/components/milestone-manager"
import { formatNaira } from "@/lib/currency"
import { NairaIcon } from "@/components/naira-icon"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"

interface TaskData {
  id: string
  title: string
  description: string
  budget_min: number
  budget_max: number
  budget_type: string
  status: string
  category: string
  location: string
  skills_required: string[]
  applications_count: number
  views_count: number
  created_at: string
  deadline: string
  urgency: string
  client: {
    name: string
    avatar_url: string
    rating: number
    reviews: number
  }
  accepted_freelancer?: {
    id: string
    name: string
    avatar_url: string
    rating: number
    completed_tasks: number
  }
}

interface Application {
  id: string
  freelancer_name: string
  proposed_budget: number
  status: string
  applied_date: string
  cover_letter: string
}

export default function TaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const taskId = params.id as string

  const [task, setTask] = useState<TaskData | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [applicationsLoading, setApplicationsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [escrowData, setEscrowData] = useState<any>(null)
  const [milestones, setMilestones] = useState<any[]>([])

  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
      if (!taskId || !user?.id) return

      try {
        setApplicationsLoading(true)

        console.log("=== Fetching applications for task:", taskId)

        const response = await fetch(`/api/tasks/${taskId}/applications`, {
          headers: {
            "user-id": user.id,
          },
        })

        if (!response.ok) {
          console.log("=== Applications fetch failed:", response.status)
          setApplications([])
          return
        }

        const data = await response.json()
        console.log("=== Applications API Response:", data)

        if (data.success && data.applications) {
          setApplications(data.applications)
        } else {
          setApplications([])
        }
      } catch (error) {
        console.error("=== Error fetching applications:", error)
        setApplications([])
      } finally {
        setApplicationsLoading(false)
      }
    }

    fetchApplications()
  }, [taskId, user?.id])

  // Fetch task details
  useEffect(() => {
    const fetchTaskData = async () => {
      if (!taskId || !user?.id) return

      try {
        setLoading(true)
        setError(null)

        console.log("=== Fetching task details for ID:", taskId)

        const response = await fetch(`/api/tasks/${taskId}`, {
          headers: {
            "user-id": user.id,
          },
        })

        if (!response.ok) {
          const errorData = await response.text()
          throw new Error(`Failed to fetch task: ${response.status} - ${errorData}`)
        }

        const data = await response.json()
        console.log("=== Task API Response:", data)

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch task")
        }

        // Transform the task data to match our interface
        const transformedTask: TaskData = {
          id: data.task.id,
          title: data.task.title,
          description: data.task.description,
          budget_min: data.task.budget_min || 0,
          budget_max: data.task.budget_max || 0,
          budget_type: data.task.budget_type || "fixed",
          status: data.task.status,
          category: data.task.category || "General",
          location: data.task.location || "Remote",
          skills_required: data.task.skills_required || [],
          applications_count: applications.length, // Use real applications count
          views_count: data.task.views_count || 0,
          created_at: data.task.created_at,
          deadline: data.task.deadline || data.task.created_at,
          urgency: data.task.urgency || "normal",
          client: {
            name: data.task.client?.name || "Anonymous Client",
            avatar_url: data.task.client?.avatar_url || "/placeholder.svg?height=40&width=40",
            rating: data.task.client?.rating || 4.8,
            reviews: data.task.client?.completed_tasks || 0,
          },
          accepted_freelancer: data.task.accepted_freelancer,
        }

        setTask(transformedTask)
        console.log("=== Transformed task data:", transformedTask)
      } catch (error) {
        console.error("=== Error fetching task:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch task")
        toast({
          title: "Error",
          description: "Failed to load task details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTaskData()
  }, [taskId, user?.id, applications.length])

  // Update the escrow data fetching useEffect
  useEffect(() => {
    const fetchEscrowStatus = async () => {
      if (!taskId || !user?.id) return

      try {
        console.log("=== Fetching escrow status for task:", taskId)

        const response = await fetch(`/api/tasks/${taskId}/escrow-status`, {
          headers: {
            "user-id": user.id,
          },
        })

        if (response.ok) {
          const data = await response.json()
          console.log("=== Escrow status response:", data)

          if (data.success) {
            setEscrowData(data.escrow)
            setMilestones(data.milestones || [])
          } else {
            setEscrowData(null)
            setMilestones([])
          }
        } else {
          console.log("=== Failed to fetch escrow status")
          setEscrowData(null)
          setMilestones([])
        }
      } catch (error) {
        console.error("=== Error fetching escrow status:", error)
        setEscrowData(null)
        setMilestones([])
      }
    }

    if (task) {
      fetchEscrowStatus()
    }
  }, [taskId, user?.id, task])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      case "paused":
        return "bg-orange-100 text-orange-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
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
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-18" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Task Not Found</h3>
              <p className="text-muted-foreground mb-4">
                {error || "The task you're looking for doesn't exist or you don't have permission to view it."}
              </p>
              <Button onClick={() => router.push("/dashboard/tasks")}>Back to My Tasks</Button>
            </div>
          </CardContent>
        </Card>
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
            <h1 className="text-3xl font-bold">{task.title}</h1>
            <p className="text-muted-foreground">Task ID: {task.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className={getStatusColor(task.status)}>{task.status.replace("_", " ")}</Badge>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/tasks/${taskId}/edit`}>
              <Settings className="h-4 w-4 mr-2" />
              Edit Task
            </Link>
          </Button>
        </div>
      </div>

      {/* Task Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Task Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{task.description}</p>

            {task.skills_required.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {task.skills_required.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <NairaIcon className="h-4 w-4 text-muted-foreground" />
                <span>
                  {task.budget_type === "fixed"
                    ? `${formatNaira(task.budget_max)} (Fixed)`
                    : `${formatNaira(task.budget_min)} - ${formatNaira(task.budget_max)}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{task.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Posted: {new Date(task.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Applications</span>
                <span>{task.applications_count}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Views</span>
                <span>{task.views_count}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Category</span>
                <span>{task.category}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Urgency</span>
                <span className="capitalize">{task.urgency}</span>
              </div>
            </div>

            {task.accepted_freelancer && (
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">Assigned Freelancer</h4>
                <div className="flex items-center gap-3">
                  <img
                    src={task.accepted_freelancer.avatar_url || "/placeholder.svg"}
                    alt={task.accepted_freelancer.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium">{task.accepted_freelancer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ⭐ {task.accepted_freelancer.rating} ({task.accepted_freelancer.completed_tasks} jobs)
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-2">Client</h4>
              <div className="flex items-center gap-3">
                <img
                  src={task.client.avatar_url || "/placeholder.svg"}
                  alt={task.client.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-medium">{task.client.name}</p>
                  <p className="text-sm text-muted-foreground">
                    ⭐ {task.client.rating}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Management Tabs */}
      <Tabs defaultValue="applications" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" disabled className="opacity-50 cursor-not-allowed">
            Overview
          </TabsTrigger>
          <TabsTrigger value="applications">
            Applications ({applicationsLoading ? "..." : applications.length})
          </TabsTrigger>
          <TabsTrigger value="project" disabled className="opacity-50 cursor-not-allowed">
            Project Management
          </TabsTrigger>
          <TabsTrigger value="payments" disabled className="opacity-50 cursor-not-allowed">
            Escrow & Payments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-1" />
                  <div className="text-sm">
                    <p className="font-medium">Task created</p>
                    <p className="text-muted-foreground">{new Date(task.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                {task.applications_count > 0 && (
                  <div className="flex items-start gap-3">
                    <Users className="h-4 w-4 text-blue-600 mt-1" />
                    <div className="text-sm">
                      <p className="font-medium">{task.applications_count} applications received</p>
                      <p className="text-muted-foreground">Review and select freelancers</p>
                    </div>
                  </div>
                )}
                {task.accepted_freelancer && (
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-1" />
                    <div className="text-sm">
                      <p className="font-medium">Freelancer assigned</p>
                      <p className="text-muted-foreground">{task.accepted_freelancer.name} is working on this task</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {task.applications_count > 0 && (
                  <Button className="w-full justify-start" asChild>
                    <Link href={`/dashboard/tasks/${taskId}/applications`}>
                      <Users className="h-4 w-4 mr-2" />
                      Review Applications ({task.applications_count})
                    </Link>
                  </Button>
                )}
                {task.accepted_freelancer && (
                  <Button className="w-full justify-start" asChild>
                    <Link href={`/dashboard/messages?task=${taskId}`}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message Freelancer
                    </Link>
                  </Button>
                )}
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/dashboard/browse/${taskId}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Task
                  </Link>
                </Button>
                {task.applications_count === 0 && (
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href={`/dashboard/tasks/${taskId}/edit`}>
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Task
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Application Management</CardTitle>
            </CardHeader>
            <CardContent>
              {applicationsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : applications.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    You have {applications.length} application{applications.length !== 1 ? "s" : ""} for this task.
                  </p>
                  <Button asChild>
                    <Link href={`/dashboard/tasks/${taskId}/applications`}>
                      View All Applications ({applications.length})
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Your task is live and visible to freelancers. Applications will appear here when freelancers apply.
                  </p>
                  <Button variant="outline" asChild>
                    <Link href={`/dashboard/browse/${taskId}`}>Preview Your Task</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="project">
          <MilestoneManager
            taskId={taskId}
            isClient={true}
            totalBudget={task.budget_max}
            escrowData={escrowData}
            realMilestones={milestones}
          />
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Escrow Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {escrowData ? (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-2xl font-bold flex items-center gap-1">
                        <NairaIcon className="h-4 w-4" />
                        {formatNaira(escrowData.amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Escrow Status</p>
                      <p
                        className={`text-lg font-semibold ${
                          escrowData.status === "funded"
                            ? "text-green-600"
                            : escrowData.status === "pending"
                              ? "text-yellow-600"
                              : "text-gray-600"
                        }`}
                      >
                        {escrowData.status === "funded"
                          ? "Active & Funded"
                          : escrowData.status === "pending"
                            ? "Pending Payment"
                            : escrowData.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Type</p>
                      <p className="text-lg font-semibold capitalize">{escrowData.payment_type}</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Budget</p>
                      <p className="text-2xl font-bold flex items-center gap-1">
                        <NairaIcon className="h-4 w-4" />
                        {formatNaira(task.budget_max)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Escrow Status</p>
                      <p className="text-lg font-semibold text-gray-600">Not Set Up</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Protection</p>
                      <p className="text-lg font-semibold text-gray-600">Available</p>
                    </div>
                  </div>
                )}

                {!escrowData && task.accepted_freelancer && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Set Up Escrow Protection</h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Protect your payment by setting up escrow. Funds are held securely and released when milestones
                      are completed.
                    </p>
                    <Button asChild>
                      <Link
                        href={`/dashboard/escrow/setup?task=${taskId}&freelancer=${task.accepted_freelancer.id}&amount=${task.budget_max}`}
                      >
                        Set Up Escrow
                      </Link>
                    </Button>
                  </div>
                )}

                {escrowData && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">✅ Escrow Active</h4>
                    <p className="text-sm text-green-700 mb-2">
                      Your payment is secured in escrow. Funds will be released as milestones are completed.
                    </p>
                    <div className="text-xs text-green-600">
                      Reference: {escrowData.payment_reference} | Funded:{" "}
                      {new Date(escrowData.funded_at).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Real-Time Milestones</CardTitle>
              </CardHeader>
              <CardContent>
                {milestones.length > 0 ? (
                  <div className="space-y-3">
                    {milestones.map((milestone, index) => (
                      <div key={milestone.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{milestone.title}</p>
                          <p className="text-sm text-muted-foreground">{milestone.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold flex items-center gap-1">
                            <NairaIcon className="h-4 w-4" />
                            {formatNaira(milestone.amount)}
                          </p>
                          <Badge
                            className={
                              milestone.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : milestone.status === "in_progress"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                            }
                          >
                            {milestone.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : escrowData ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Single Payment Escrow</h3>
                    <p className="text-muted-foreground">
                      This escrow is set up for a single payment release upon project completion.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Escrow Set Up</h3>
                    <p className="text-muted-foreground">
                      Set up escrow protection to secure your payments and track milestones.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
