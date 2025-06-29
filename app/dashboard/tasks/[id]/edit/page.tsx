"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  Save,
  Eye,
  Clock,
  AlertCircle,
  CheckCircle,
  X,
  Plus,
  FileText,
  Settings,
  DollarSign,
  MapPin,
  Calendar,
  Users,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"

interface TaskData {
  id: string
  title: string
  description: string
  category: string
  budget_min: number
  budget_max: number
  budget_type: "fixed" | "hourly"
  currency: string
  duration: string
  location: string
  skills_required: string[]
  questions: string[]
  requirements: string[]
  visibility: string
  urgency: "low" | "normal" | "high"
  requires_escrow: boolean
  status: string
  applications_count: number
}

export default function EditTaskPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const taskId = params.id as string

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [taskUpdated, setTaskUpdated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [originalTask, setOriginalTask] = useState<TaskData | null>(null)
  
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    category: "",
    budget: {
      type: "fixed" as "fixed" | "hourly",
      amount: "",
      currency: "NGN",
    },
    duration: "",
    location: "remote",
    skills: [] as string[],
    questions: [] as string[],
    requirements: [] as string[],
    visibility: "public",
    urgency: "normal" as "low" | "normal" | "high",
    requiresEscrow: false,
  })

  const [newSkill, setNewSkill] = useState("")
  const [newQuestion, setNewQuestion] = useState("")
  const [newRequirement, setNewRequirement] = useState("")

  const categories = [
    "Web Development",
    "Mobile Development",
    "UI/UX Design",
    "Content Writing",
    "Digital Marketing",
    "Data Analysis",
    "Graphic Design",
    "Video Editing",
    "Translation",
    "Virtual Assistant",
    "Other",
  ]

  // Fetch existing task data
  useEffect(() => {
    const fetchTaskData = async () => {
      if (!taskId || !user?.id) return

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/tasks/${taskId}`, {
          headers: {
            "user-id": user.id,
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch task: ${response.status}`)
        }

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch task")
        }

        const task = data.task
        setOriginalTask(task)

        // Check if task has applications
        if (task.applications_count > 0) {
          setError("Cannot edit task that has applications. Please contact support if you need to make changes.")
          return
        }

        // Populate form with existing data
        setTaskData({
          title: task.title || "",
          description: task.description || "",
          category: task.category || "",
          budget: {
            type: task.budget_type || "fixed",
            amount: task.budget_min?.toString() || "",
            currency: task.currency || "NGN",
          },
          duration: task.duration || "",
          location: task.location || "remote",
          skills: task.skills_required || [],
          questions: task.questions || [],
          requirements: task.requirements || [],
          visibility: task.visibility || "public",
          urgency: task.urgency || "normal",
          requiresEscrow: task.requires_escrow || false,
        })

      } catch (error) {
        console.error("Error fetching task:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch task")
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && user) {
      fetchTaskData()
    }
  }, [taskId, user, authLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to edit a task.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      console.log("=== FRONTEND: Starting task update ===")
      console.log("User data:", user)
      console.log("Task data:", taskData)

      const requestBody = {
        // User authentication data
        user_data: {
          id: user.id,
          email: user.email,
          name: user.name,
          userType: user.userType,
          isVerified: user.isVerified,
          skills: user.skills || [],
          bio: user.bio || "",
          location: user.location || "",
          hourlyRate: user.hourlyRate,
        },
        // Task data
        title: taskData.title,
        description: taskData.description,
        category: taskData.category,
        budget_type: taskData.budget.type,
        budget_min: Number.parseFloat(taskData.budget.amount),
        budget_max: Number.parseFloat(taskData.budget.amount),
        currency: taskData.budget.currency,
        duration: taskData.duration,
        location: taskData.location,
        skills_required: taskData.skills,
        questions: taskData.questions,
        requirements: taskData.requirements,
        visibility: taskData.visibility,
        urgency: taskData.urgency,
        requires_escrow: taskData.requiresEscrow,
      }

      console.log("Request body:", JSON.stringify(requestBody, null, 2))

      const response = await fetch(`/api/tasks/${taskId}/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log("Response status:", response.status)
      console.log("Response ok:", response.ok)

      const result = await response.json()
      console.log("Response data:", result)

      if (response.ok && result.success) {
        setTaskUpdated(true)
        toast({
          title: "Task Updated Successfully!",
          description: "Your task has been updated and is now live.",
        })

        setTimeout(() => {
          router.push(`/dashboard/tasks/${taskId}`)
        }, 2000)
      } else {
        throw new Error(result.error || "Failed to update task")
      }
    } catch (error) {
      console.error("Task update error:", error)
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addSkill = (e?: React.KeyboardEvent) => {
    if (e && e.key !== "Enter") return
    e?.preventDefault()

    if (newSkill.trim() && !taskData.skills.includes(newSkill.trim())) {
      setTaskData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }))
      setNewSkill("")
    }
  }

  const removeSkill = (index: number) => {
    setTaskData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }))
  }

  const addQuestion = (e?: React.KeyboardEvent) => {
    if (e && e.key !== "Enter") return
    e?.preventDefault()

    if (newQuestion.trim()) {
      setTaskData((prev) => ({
        ...prev,
        questions: [...prev.questions, newQuestion.trim()],
      }))
      setNewQuestion("")
    }
  }

  const removeQuestion = (index: number) => {
    setTaskData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }))
  }

  const addRequirement = (e?: React.KeyboardEvent) => {
    if (e && e.key !== "Enter") return
    e?.preventDefault()

    if (newRequirement.trim()) {
      setTaskData((prev) => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()],
      }))
      setNewRequirement("")
    }
  }

  const removeRequirement = (index: number) => {
    setTaskData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }))
  }

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return taskData.title.trim() && taskData.description.trim() && taskData.category
      case 2:
        return taskData.budget.amount && taskData.duration
      case 3:
        return true
      case 4:
        return true
      default:
        return false
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Basic Information"
      case 2:
        return "Budget and Timeline"
      case 3:
        return "Additional Details"
      case 4:
        return "Review & Update"
      default:
        return "Edit Task"
    }
  }

  const handleViewTask = () => {
    router.push(`/dashboard/tasks/${taskId}`)
  }

  if (taskUpdated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-lg text-center">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Task Updated Successfully!</h2>
            <p className="text-muted-foreground mb-4">
              Your task "{taskData.title}" has been updated and is now live.
            </p>

            <div className="space-y-2 text-sm mb-6">
              <div className="flex justify-between">
                <span>Budget Range:</span>
                <span className="font-medium">
                  ₦{taskData.budget.amount}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Category:</span>
                <span className="font-medium">{taskData.category}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-medium text-green-600">Updated & Live</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleViewTask} className="flex-1">
                <Eye className="h-4 w-4 mr-2" />
                View Task
              </Button>
              <Button variant="outline" onClick={() => router.push("/dashboard/tasks")} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tasks
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show loading state while authentication is being determined
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Show login required message if not authenticated
  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Edit Task</h1>
            <p className="text-muted-foreground">Update your task details</p>
          </div>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need to be logged in to edit a task. Please{" "}
            <Link href="/login" className="underline">
              log in
            </Link>{" "}
            to continue.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Show error if task has applications
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Edit Task</h1>
            <p className="text-muted-foreground">Update your task details</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Edit Task</h1>
          <p className="text-muted-foreground">Update your task details and requirements</p>
          <p className="text-sm text-muted-foreground mt-1">
            Logged in as: {user.name} ({user.email})
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={isSubmitting}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step <= currentStep ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              {step}
            </div>
            {step < 4 && <div className={`w-16 h-1 mx-2 ${step < currentStep ? "bg-blue-600" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold">{getStepTitle()}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title *</Label>
                <Input
                  id="title"
                  value={taskData.title}
                  onChange={(e) => setTaskData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Build a React e-commerce website"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Task Description *</Label>
                <Textarea
                  id="description"
                  value={taskData.description}
                  onChange={(e) => setTaskData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what you need in detail..."
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={taskData.category} onValueChange={(value) => setTaskData((prev) => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Budget and Timeline */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Budget and Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Budget Type</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="fixed"
                      checked={taskData.budget.type === "fixed"}
                      onCheckedChange={(checked) =>
                        setTaskData((prev) => ({
                          ...prev,
                          budget: { ...prev.budget, type: checked ? "fixed" : "hourly" },
                        }))
                      }
                    />
                    <Label htmlFor="fixed">Fixed Price</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hourly"
                      checked={taskData.budget.type === "hourly"}
                      onCheckedChange={(checked) =>
                        setTaskData((prev) => ({
                          ...prev,
                          budget: { ...prev.budget, type: checked ? "hourly" : "fixed" },
                        }))
                      }
                    />
                    <Label htmlFor="hourly">Hourly Rate</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget-amount">Fixed Price (₦) *</Label>
                <Input
                  id="budget-amount"
                  type="number"
                  value={taskData.budget.amount}
                  onChange={(e) => setTaskData((prev) => ({ ...prev, budget: { ...prev.budget, amount: e.target.value } }))}
                  placeholder="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Estimated Duration *</Label>
                <Input
                  id="duration"
                  value={taskData.duration}
                  onChange={(e) => setTaskData((prev) => ({ ...prev, duration: e.target.value }))}
                  placeholder="e.g., 2-3 weeks, 1 month"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select value={taskData.location} onValueChange={(value) => setTaskData((prev) => ({ ...prev, location: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="onsite">On-site</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Additional Details */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Additional Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Required Skills</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={addSkill}
                      placeholder="Add a skill (press Enter)"
                    />
                    <Button type="button" onClick={() => addSkill()} disabled={!newSkill.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {taskData.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(index)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Questions for Freelancers</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      onKeyDown={addQuestion}
                      placeholder="Add a question (press Enter)"
                    />
                    <Button type="button" onClick={() => addQuestion()} disabled={!newQuestion.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {taskData.questions.map((question, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <span className="flex-1">{question}</span>
                        <button
                          type="button"
                          onClick={() => removeQuestion(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Requirements</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      onKeyDown={addRequirement}
                      placeholder="Add a requirement (press Enter)"
                    />
                    <Button type="button" onClick={() => addRequirement()} disabled={!newRequirement.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {taskData.requirements.map((requirement, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <span className="flex-1">{requirement}</span>
                        <button
                          type="button"
                          onClick={() => removeRequirement(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Urgency Level</Label>
                <Select value={taskData.urgency} onValueChange={(value: "low" | "normal" | "high") => setTaskData((prev) => ({ ...prev, urgency: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - No rush</SelectItem>
                    <SelectItem value="normal">Normal - Standard timeline</SelectItem>
                    <SelectItem value="high">High - Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>Visibility Settings</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="public"
                    checked={taskData.visibility === "public"}
                    onCheckedChange={(checked) =>
                      setTaskData((prev) => ({
                        ...prev,
                        visibility: checked ? "public" : "private",
                      }))
                    }
                  />
                  <Label htmlFor="public">Make this task publicly visible</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Public tasks are visible to all freelancers. Private tasks are only visible to invited freelancers.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Review & Update
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-semibold">Task Details</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Title:</span> {taskData.title}
                    </div>
                    <div>
                      <span className="font-medium">Category:</span> {taskData.category}
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span> {taskData.duration}
                    </div>
                    <div>
                      <span className="font-medium">Location:</span> {taskData.location}
                    </div>
                    <div>
                      <span className="font-medium">Urgency:</span> {taskData.urgency}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Budget Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Type:</span> {taskData.budget.type}
                    </div>
                    <div>
                      <span className="font-medium">Amount:</span> ₦{taskData.budget.amount}
                    </div>
                    <div>
                      <span className="font-medium">Currency:</span> {taskData.budget.currency}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Description</h3>
                <p className="text-sm text-muted-foreground">{taskData.description}</p>
              </div>

              {taskData.skills.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {taskData.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {taskData.questions.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Questions for Freelancers</h3>
                  <div className="space-y-2">
                    {taskData.questions.map((question, index) => (
                      <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                        {index + 1}. {question}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">✅ Ready to Update</h3>
                <p className="text-sm text-green-700">
                  Your task will be updated and remain visible to freelancers. Any changes will be reflected immediately.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <div>
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={prevStep} disabled={isSubmitting}>
                Previous
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {currentStep < 4 ? (
              <Button type="button" onClick={nextStep} disabled={!canProceedToNext() || isSubmitting}>
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Updating Task...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Task
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
} 