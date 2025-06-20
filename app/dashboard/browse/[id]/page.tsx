"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Bookmark,
  Calendar,
  Clock,
  DollarSign,
  Eye,
  Flag,
  MapPin,
  MessageSquare,
  Share2,
  Star,
  Users,
  FileText,
  Download,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { FileUpload } from "@/components/file-upload"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import { formatCurrency, formatDate, generateTaskCode, getStatusColor } from "@/lib/api-utils"

interface TaskDetail {
  id: string
  title: string
  description: string
  category: string
  subcategory?: string
  skills_required: string[]
  budget_type: "fixed" | "hourly"
  budget_min: number
  budget_max: number
  currency: string
  duration: string
  location: string
  experience_level: string
  urgency: "low" | "normal" | "high"
  status: string
  applications_count: number
  views_count: number
  deadline?: string
  created_at: string
  requirements: string[]
  questions: string[]
  attachments: string[]
  client: {
    id: string
    name: string
    avatar_url?: string
    rating: number
    completed_tasks: number
    total_earned: number
    location?: string
    bio?: string
    join_date: string
  }
}

export default function TaskDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const [task, setTask] = useState<TaskDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isApplying, setIsApplying] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [proposedBudget, setProposedBudget] = useState("")
  const [coverLetter, setCoverLetter] = useState("")
  const [estimatedDuration, setEstimatedDuration] = useState("")
  const [similarTasks, setSimilarTasks] = useState<any[]>([])

  useEffect(() => {
    fetchTaskDetail()
    fetchSimilarTasks()
  }, [params.id])

  const fetchTaskDetail = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/tasks/${params.id}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Task not found")
        }
        throw new Error("Failed to fetch task details")
      }

      const data = await response.json()
      setTask(data.task)
      setIsSaved(data.is_saved || false)
    } catch (err) {
      console.error("Task detail error:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const fetchSimilarTasks = async () => {
    try {
      const response = await fetch(`/api/tasks/${params.id}/similar`)

      if (response.ok) {
        const data = await response.json()
        setSimilarTasks(data.tasks || [])
      }
    } catch (err) {
      console.error("Similar tasks error:", err)
      // Don't show error for similar tasks, just log it
    }
  }

  const handleApply = async () => {
    if (!proposedBudget || !coverLetter || !estimatedDuration) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/tasks/${params.id}/apply`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user?.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          proposed_budget: Number.parseFloat(proposedBudget),
          budget_type: task?.budget_type,
          estimated_duration: estimatedDuration,
          cover_letter: coverLetter,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit application")
      }

      toast({
        title: "Application Submitted!",
        description: "Your application has been sent to the client.",
      })

      setIsApplying(false)
      setProposedBudget("")
      setCoverLetter("")
      setEstimatedDuration("")

      // Refresh task to update application count
      fetchTaskDetail()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to submit application",
        variant: "destructive",
      })
    }
  }

  const toggleSaveTask = async () => {
    try {
      const response = await fetch(`/api/tasks/${params.id}/save`, {
        method: isSaved ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${user?.access_token}`,
        },
      })

      if (response.ok) {
        setIsSaved(!isSaved)
        toast({
          title: isSaved ? "Task unsaved" : "Task saved",
          description: isSaved ? "Removed from saved tasks" : "Added to saved tasks",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const timeAgo = (date: string) => {
    const now = new Date()
    const posted = new Date(date)
    const diffInHours = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60))

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
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardHeader>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
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
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-600">Error Loading Task</h3>
              <p className="text-muted-foreground">{error || "Task not found"}</p>
              <Button onClick={fetchTaskDetail} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/browse">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Browse
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-2xl">{task.title}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {generateTaskCode(task.id)}
                    </Badge>
                    <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                    {task.urgency === "high" && <Badge variant="destructive">Urgent</Badge>}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {formatCurrency(task.budget_min)} - {formatCurrency(task.budget_max)}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {task.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {task.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Posted {timeAgo(task.created_at)}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {task.applications_count} applications
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {task.views_count} views
                    </div>
                    {task.deadline && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Deadline: {formatDate(task.deadline)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={toggleSaveTask}>
                    <Bookmark className={`mr-2 h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                    {isSaved ? "Saved" : "Save"}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm">
                    <Flag className="mr-2 h-4 w-4" />
                    Report
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Task Details */}
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="attachments">Attachments</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap">{task.description}</div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="requirements" className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Skills Required</h3>
                    <div className="flex flex-wrap gap-2">
                      {task.skills_required.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Experience Level</h4>
                      <p className="capitalize">{task.experience_level}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Project Duration</h4>
                      <p>{task.duration}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Budget Type</h4>
                      <p className="capitalize">{task.budget_type} Price</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Category</h4>
                      <p>{task.category}</p>
                    </div>
                  </div>
                  {task.requirements.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold mb-2">Additional Requirements</h3>
                        <ul className="list-disc list-inside space-y-1">
                          {task.requirements.map((req, index) => (
                            <li key={index} className="text-sm">
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                  {task.questions.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold mb-2">Client Questions</h3>
                        <ul className="space-y-2">
                          {task.questions.map((question, index) => (
                            <li key={index} className="text-sm p-2 bg-muted rounded">
                              {question}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attachments" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  {task.attachments.length > 0 ? (
                    <div className="space-y-3">
                      {task.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{attachment}</p>
                              <p className="text-sm text-muted-foreground">Attachment {index + 1}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No attachments provided</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Apply Card */}
          <Card>
            <CardHeader>
              <CardTitle>Apply for this Task</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(task.budget_min)} - {formatCurrency(task.budget_max)}
                </div>
                <p className="text-sm text-muted-foreground capitalize">{task.budget_type} Price</p>
              </div>
              <Dialog open={isApplying} onOpenChange={setIsApplying}>
                <DialogTrigger asChild>
                  <Button className="w-full" size="lg">
                    Apply Now
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Apply for: {task.title}</DialogTitle>
                    <DialogDescription>Submit your proposal to the client</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="budget">Your Proposed Budget ({task.currency})</Label>
                      <Input
                        id="budget"
                        type="number"
                        placeholder={`e.g., ${task.budget_min}`}
                        value={proposedBudget}
                        onChange={(e) => setProposedBudget(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration">Estimated Duration</Label>
                      <Input
                        id="duration"
                        placeholder="e.g., 6 weeks"
                        value={estimatedDuration}
                        onChange={(e) => setEstimatedDuration(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cover-letter">Cover Letter</Label>
                      <Textarea
                        id="cover-letter"
                        placeholder="Explain why you're the best fit for this project..."
                        rows={6}
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="attachments">Attachments (Optional)</Label>
                      <FileUpload
                        maxFiles={3}
                        maxSize={5}
                        acceptedTypes={["application/pdf", ".doc", ".docx", "image/*"]}
                        onFilesChange={(files) => console.log("Files uploaded:", files)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleApply} className="flex-1">
                        Submit Application
                      </Button>
                      <Button variant="outline" onClick={() => setIsApplying(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/dashboard/messages?client=${task.client.id}`}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Message Client
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle>About the Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={task.client.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>
                    {task.client.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{task.client.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{task.client.rating}</span>
                    <span className="text-sm text-muted-foreground">({task.client.completed_tasks} tasks)</span>
                  </div>
                </div>
              </div>

              {task.client.bio && <p className="text-sm text-muted-foreground">{task.client.bio}</p>}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Spent</p>
                  <p className="font-semibold">{formatCurrency(task.client.total_earned)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tasks Completed</p>
                  <p className="font-semibold">{task.client.completed_tasks}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Member Since</p>
                  <p className="font-semibold">{new Date(task.client.join_date).getFullYear()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p className="font-semibold">{task.client.location || "Not specified"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Similar Tasks */}
          {similarTasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Similar Tasks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {similarTasks.map((similarTask) => (
                  <div key={similarTask.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <Link href={`/dashboard/browse/${similarTask.id}`} className="block">
                      <h4 className="font-medium text-sm mb-1">{similarTask.title}</h4>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {formatCurrency(similarTask.budget_min)} - {formatCurrency(similarTask.budget_max)}
                        </span>
                        <span>{similarTask.applications_count} applications</span>
                      </div>
                    </Link>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
