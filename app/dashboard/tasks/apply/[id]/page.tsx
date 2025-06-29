"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, MapPin, Star, Clock, FileText, Send, Loader2 } from "lucide-react"
import { NairaIcon } from "@/components/naira-icon"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import { useApplicationsReal } from "@/hooks/use-applications-real"

interface TaskApplicationPageProps {
  params: Promise<{
    id: string
  }>
}

interface Task {
  id: string
  title: string
  description: string
  budget_min: number
  budget_max: number
  category: string
  location: string
  created_at: string
  skills_required: string[]
  requirements: string[]
  questions: string[]
  attachments: any[]
  status: string
  client: {
    id: string
    name: string
    avatar_url?: string
    rating: number
    location: string
    completed_tasks: number
    total_earned: number
    join_date: string
    bio: string
  }
  applications_count: number
  views_count: number
}

export default function TaskApplicationPage({ params }: TaskApplicationPageProps) {
  const router = useRouter()
  const { user } = useAuth()
  const resolvedParams = use(params)
  const taskId = resolvedParams.id

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [task, setTask] = useState<Task | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [applicationData, setApplicationData] = useState({
    proposedAmount: "",
    coverLetter: "",
    estimatedDuration: "",
    questions: {} as Record<string, string>,
  })

  const { applications } = useApplicationsReal();

  // Fetch task data
  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        console.log("=== Fetching task data for ID:", taskId)

        const response = await fetch(`/api/tasks/${taskId}`, {
          headers: {
            "user-id": user?.id || "",
          },
        })

        console.log("=== Task fetch response status:", response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.log("=== Task fetch error response:", errorText)
          throw new Error(`Failed to fetch task: ${response.status}`)
        }

        const data = await response.json()
        console.log("=== Task data received:", data)

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch task")
        }

        setTask(data.task)
      } catch (error) {
        console.error("Error fetching task:", error)
        setError(error instanceof Error ? error.message : "Failed to load task")
        toast({
          title: "Error",
          description: "Failed to load task details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (taskId && user?.id) {
      fetchTaskData()
    }
  }, [taskId, user?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!task || !user?.id) {
      toast({
        title: "Error",
        description: "Missing task or user information",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      console.log("=== Submitting application for task:", taskId)
      console.log("=== Application data:", applicationData)

      const applicationPayload = {
        proposed_budget: Number.parseFloat(applicationData.proposedAmount),
        budget_type: "fixed",
        cover_letter: applicationData.coverLetter,
        estimated_duration: applicationData.estimatedDuration,
        questions_answers: applicationData.questions,
      }

      console.log("=== Application payload:", applicationPayload)

      const response = await fetch(`/api/tasks/${taskId}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "user-id": user.id,
        },
        body: JSON.stringify(applicationPayload),
      })

      console.log("=== Application response status:", response.status)

      const responseText = await response.text()
      console.log("=== Application response text:", responseText)

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("=== Failed to parse response as JSON:", parseError)
        throw new Error(`Server returned invalid response: ${response.status}`)
      }

      if (!response.ok) {
        throw new Error(data.error || `Failed to submit application: ${response.status}`)
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to submit application")
      }

      toast({
        title: "Success!",
        description: "Your application has been submitted successfully",
      })

      // Redirect to applications page
      router.push("/dashboard/applications?status=submitted")
    } catch (error) {
      console.error("Failed to submit application:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit application",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateQuestion = (index: number, answer: string) => {
    setApplicationData((prev) => ({
      ...prev,
      questions: {
        ...prev.questions,
        [index]: answer,
      },
    }))
  }

  const formatBudget = (min: number, max: number) => {
    if (min === max) {
      return `₦${min.toLocaleString()}`
    }
    return `₦${min.toLocaleString()} - ₦${max.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "1 day ago"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return `${Math.ceil(diffDays / 30)} months ago`
  }

  // Check if the user has already applied to this task
  const hasApplied = applications.some(
    (app) => app.task_id === taskId && app.freelancer_id === user?.id
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Apply for Task</h1>
            <p className="text-muted-foreground">Loading task details...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Task Not Found</h1>
            <p className="text-muted-foreground">{error || "The task you're looking for doesn't exist"}</p>
          </div>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Unable to load task details</p>
            <Button onClick={() => router.push("/dashboard/browse")}>Browse Other Tasks</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Apply for Task</h1>
          <p className="text-muted-foreground">Submit your proposal for this project</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Task Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{task.title}</CardTitle>
              <CardDescription>{task.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <NairaIcon className="h-4 w-4" />
                  {formatBudget(task.budget_min, task.budget_max)}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {task.location}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(task.created_at)}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {task.skills_required.map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>

              <Separator />

              {task.requirements.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Requirements:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {task.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Application Form */}
          <Card>
            <CardHeader>
              <CardTitle>Your Proposal</CardTitle>
              <CardDescription>Provide details about your approach and pricing</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Your Proposed Amount (₦)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={applicationData.proposedAmount}
                      onChange={(e) =>
                        setApplicationData((prev) => ({
                          ...prev,
                          proposedAmount: e.target.value,
                        }))
                      }
                      placeholder={`Fixed price: ₦${task.budget_max.toLocaleString()}`}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Fixed price: ₦{task.budget_max.toLocaleString()} | You can propose any amount
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Estimated Duration</Label>
                    <Input
                      id="duration"
                      value={applicationData.estimatedDuration}
                      onChange={(e) =>
                        setApplicationData((prev) => ({
                          ...prev,
                          estimatedDuration: e.target.value,
                        }))
                      }
                      placeholder="e.g., 3 weeks"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coverLetter">Cover Letter</Label>
                  <Textarea
                    id="coverLetter"
                    value={applicationData.coverLetter}
                    onChange={(e) =>
                      setApplicationData((prev) => ({
                        ...prev,
                        coverLetter: e.target.value,
                      }))
                    }
                    placeholder="Describe your experience, approach, and why you're the best fit for this project..."
                    rows={6}
                    required
                  />
                </div>

                {/* Client Questions */}
                {task.questions && task.questions.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold">Client Questions</h4>
                    {task.questions.map((question, index) => (
                      <div key={index} className="space-y-2">
                        <Label htmlFor={`question-${index}`}>
                          {index + 1}. {question}
                        </Label>
                        <Textarea
                          id={`question-${index}`}
                          value={applicationData.questions[index] || ""}
                          onChange={(e) => updateQuestion(index, e.target.value)}
                          placeholder="Your answer..."
                          rows={3}
                          required
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || hasApplied}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : hasApplied ? (
                      <>Already Applied</>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Application
                      </>
                    )}
                  </Button>
                </div>
              </form>
              {hasApplied && (
                <p className="text-green-600 mt-2">You have already applied to this task.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Client Info & Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About the Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={task.client.avatar_url || "/placeholder.svg?height=40&width=40"} />
                  <AvatarFallback>{task.client.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{task.client.name}</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">
                      {task.client.rating} ({task.client.completed_tasks} projects)
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member since:</span>
                  <span>{formatDate(task.client.join_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span>{task.client.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total earned:</span>
                  <span>₦{task.client.total_earned.toLocaleString()}</span>
                </div>
              </div>

              {task.client.bio && (
                <div>
                  <p className="text-sm text-muted-foreground">{task.client.bio}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Competition</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Proposals submitted:</span>
                <span className="font-medium">{task.applications_count}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Task views:</span>
                <span className="font-medium">{task.views_count || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Fixed price:</span>
                <span className="font-medium">
                  ₦{task.budget_max.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tips for Success</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-blue-600 mt-0.5" />
                <span>Write a personalized cover letter</span>
              </div>
              <div className="flex items-start gap-2">
                <NairaIcon className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Propose a competitive price based on the fixed budget</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-purple-600 mt-0.5" />
                <span>Provide realistic timelines</span>
              </div>
              <div className="flex items-start gap-2">
                <Star className="h-4 w-4 text-yellow-600 mt-0.5" />
                <span>Highlight relevant experience</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
