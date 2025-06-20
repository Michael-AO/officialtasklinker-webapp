"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
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

export default function TaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const taskId = params.id as string

  const [task, setTask] = useState({
    id: taskId,
    title: "E-commerce Website Development",
    description:
      "Looking for an experienced developer to build a modern e-commerce website with payment integration and admin panel. The project requires expertise in React, Node.js, and database management.",
    budget_min: 250000,
    budget_max: 400000,
    budget_type: "fixed",
    status: "in_progress",
    category: "Web Development",
    location: "Remote",
    skills_required: ["React", "Node.js", "MongoDB", "Stripe", "Payment Integration"],
    applications_count: 12,
    created_at: "2024-01-15T10:00:00Z",
    deadline: "2024-03-15T23:59:59Z",
    urgency: "normal",
    client: {
      name: "Sarah Johnson",
      avatar_url: "/placeholder.svg?height=40&width=40",
      rating: 4.8,
      reviews: 23,
    },
    accepted_freelancer: {
      id: "freelancer-1",
      name: "Alex Rodriguez",
      avatar_url: "/placeholder.svg?height=40&width=40",
      rating: 4.9,
      completed_tasks: 127,
    },
  })

  const [loading, setLoading] = useState(false)

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
            <h1 className="text-3xl font-bold">{task.title}</h1>
            <p className="text-muted-foreground">Task ID: {task.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className={getStatusColor(task.status)}>{task.status.replace("_", " ")}</Badge>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Edit Task
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

            <div className="flex flex-wrap gap-2">
              {task.skills_required.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <NairaIcon className="h-4 w-4 text-muted-foreground" />
                <span>
                  {formatNaira(task.budget_min)} - {formatNaira(task.budget_max)}
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
                <span>156</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Category</span>
                <span>{task.category}</span>
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
          </CardContent>
        </Card>
      </div>

      {/* Task Management Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applications">Applications ({task.applications_count})</TabsTrigger>
          <TabsTrigger value="project">Project Management</TabsTrigger>
          <TabsTrigger value="payments">Escrow & Payments</TabsTrigger>
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
                    <p className="font-medium">Milestone 1 approved</p>
                    <p className="text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-blue-600 mt-1" />
                  <div className="text-sm">
                    <p className="font-medium">Files submitted for review</p>
                    <p className="text-muted-foreground">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-4 w-4 text-purple-600 mt-1" />
                  <div className="text-sm">
                    <p className="font-medium">New message from Alex</p>
                    <p className="text-muted-foreground">2 days ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" asChild>
                  <Link href={`/dashboard/messages?task=${taskId}`}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message Freelancer
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/dashboard/tasks/${taskId}/applications`}>
                    <Users className="h-4 w-4 mr-2" />
                    View Applications
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Task
                </Button>
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
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Manage Applications</h3>
                <p className="text-muted-foreground mb-4">
                  Review, interview, and select the best freelancer for your project
                </p>
                <Button asChild>
                  <Link href={`/dashboard/tasks/${taskId}/applications`}>
                    View All Applications ({task.applications_count})
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="project">
          <MilestoneManager taskId={taskId} isClient={true} totalBudget={task.budget_max} />
        </TabsContent>

        <TabsContent value="payments">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Escrow Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Escrow</p>
                    <p className="text-2xl font-bold">{formatNaira(400000)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Released</p>
                    <p className="text-2xl font-bold text-green-600">{formatNaira(75000)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Remaining</p>
                    <p className="text-2xl font-bold">{formatNaira(325000)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Funds Released</span>
                    <span>18.75%</span>
                  </div>
                  <Progress value={18.75} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Milestone 1 - Project Setup</p>
                      <p className="text-sm text-muted-foreground">Released on Feb 10, 2024</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{formatNaira(75000)}</p>
                      <Badge variant="secondary" className="text-xs">
                        Completed
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">Milestone 2 - Frontend Development</p>
                      <p className="text-sm text-muted-foreground">Pending approval</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatNaira(125000)}</p>
                      <Badge variant="outline" className="text-xs">
                        Pending
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
