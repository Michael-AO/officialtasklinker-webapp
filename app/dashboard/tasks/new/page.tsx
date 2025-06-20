"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, X, FileText, Save, Eye, Clock, CheckCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function NewTaskPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [taskPosted, setTaskPosted] = useState(false)
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    category: "",
    budget: {
      type: "fixed" as "fixed" | "hourly",
      min: "",
      max: "",
      currency: "NGN",
    },
    duration: "",
    location: "remote",
    skills: [] as string[],
    questions: [] as string[],
    requirements: [] as string[],
    attachments: [] as string[],
    visibility: "public",
    urgency: "normal",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/tasks/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: taskData.title,
          description: taskData.description,
          category: taskData.category,
          budget_type: taskData.budget.type,
          budget_min: Number.parseFloat(taskData.budget.min),
          budget_max: Number.parseFloat(taskData.budget.max),
          currency: taskData.budget.currency,
          duration: taskData.duration,
          location: taskData.location,
          skills_required: taskData.skills,
          questions: taskData.questions,
          requirements: taskData.requirements,
          visibility: taskData.visibility,
          urgency: taskData.urgency,
          requires_escrow: taskData.requiresEscrow,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create task")
      }

      const result = await response.json()

      if (result.success) {
        setTaskPosted(true)
        toast({
          title: "Task Posted Successfully!",
          description: `Your task "${taskData.title}" has been posted and is now visible to freelancers.`,
        })

        // Redirect after showing success
        setTimeout(() => {
          router.push("/dashboard/tasks")
        }, 3000)
      }
    } catch (error) {
      console.error("Failed to post task:", error)
      toast({
        title: "Error",
        description: "Failed to post task. Please try again.",
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

  const removeSkill = (skillToRemove: string) => {
    setTaskData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
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
        return taskData.budget.min && taskData.budget.max && taskData.duration
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
        return "Review & Post"
      default:
        return "Post Task"
    }
  }

  if (taskPosted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Task Posted Successfully!</h2>
            <p className="text-muted-foreground mb-4">
              Your task "{taskData.title}" has been posted and is now visible to freelancers.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Budget Range:</span>
                <span className="font-medium">
                  ₦{taskData.budget.min} - ₦{taskData.budget.max}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Category:</span>
                <span className="font-medium">{taskData.category}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Redirecting to your tasks dashboard...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Post New Task</h1>
          <p className="text-muted-foreground">Create a detailed task posting to find the right freelancer</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button variant="outline" disabled={isSubmitting}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
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
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Provide the essential details about your task</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title *</Label>
                <Input
                  id="title"
                  value={taskData.title}
                  onChange={(e) => setTaskData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Build a responsive e-commerce website"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Task Description *</Label>
                <Textarea
                  id="description"
                  value={taskData.description}
                  onChange={(e) => setTaskData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Provide a detailed description of what you need done..."
                  rows={6}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={taskData.category}
                    onValueChange={(value) => setTaskData((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
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

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select
                    value={taskData.location}
                    onValueChange={(value) => setTaskData((prev) => ({ ...prev, location: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="lagos">Lagos, Nigeria</SelectItem>
                      <SelectItem value="abuja">Abuja, Nigeria</SelectItem>
                      <SelectItem value="kano">Kano, Nigeria</SelectItem>
                      <SelectItem value="ibadan">Ibadan, Nigeria</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Required Skills</Label>
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill..."
                    onKeyPress={addSkill}
                  />
                  <Button type="button" onClick={() => addSkill()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {taskData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => removeSkill(skill)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Budget and Timeline */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Budget and Timeline</CardTitle>
              <CardDescription>Set your budget and project timeline</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Budget Type</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="fixed"
                      name="budgetType"
                      value="fixed"
                      checked={taskData.budget.type === "fixed"}
                      onChange={(e) =>
                        setTaskData((prev) => ({
                          ...prev,
                          budget: { ...prev.budget, type: e.target.value as "fixed" | "hourly" },
                        }))
                      }
                    />
                    <Label htmlFor="fixed">Fixed Price</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="hourly"
                      name="budgetType"
                      value="hourly"
                      checked={taskData.budget.type === "hourly"}
                      onChange={(e) =>
                        setTaskData((prev) => ({
                          ...prev,
                          budget: { ...prev.budget, type: e.target.value as "fixed" | "hourly" },
                        }))
                      }
                    />
                    <Label htmlFor="hourly">Hourly Rate</Label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minBudget">
                    {taskData.budget.type === "fixed" ? "Minimum Budget" : "Minimum Hourly Rate"} (₦)
                  </Label>
                  <Input
                    id="minBudget"
                    type="number"
                    value={taskData.budget.min}
                    onChange={(e) =>
                      setTaskData((prev) => ({
                        ...prev,
                        budget: { ...prev.budget, min: e.target.value },
                      }))
                    }
                    placeholder="50000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxBudget">
                    {taskData.budget.type === "fixed" ? "Maximum Budget" : "Maximum Hourly Rate"} (₦)
                  </Label>
                  <Input
                    id="maxBudget"
                    type="number"
                    value={taskData.budget.max}
                    onChange={(e) =>
                      setTaskData((prev) => ({
                        ...prev,
                        budget: { ...prev.budget, max: e.target.value },
                      }))
                    }
                    placeholder="100000"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Project Duration</Label>
                <Select
                  value={taskData.duration}
                  onValueChange={(value) => setTaskData((prev) => ({ ...prev, duration: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-week">Less than 1 week</SelectItem>
                    <SelectItem value="1-2-weeks">1-2 weeks</SelectItem>
                    <SelectItem value="2-4-weeks">2-4 weeks</SelectItem>
                    <SelectItem value="1-2-months">1-2 months</SelectItem>
                    <SelectItem value="2-6-months">2-6 months</SelectItem>
                    <SelectItem value="6-months-plus">More than 6 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Project Urgency</Label>
                <div className="flex gap-4">
                  {[
                    { value: "low", label: "Low Priority", color: "text-green-600" },
                    { value: "normal", label: "Normal", color: "text-blue-600" },
                    { value: "high", label: "Urgent", color: "text-red-600" },
                  ].map((urgency) => (
                    <div key={urgency.value} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={urgency.value}
                        name="urgency"
                        value={urgency.value}
                        checked={taskData.urgency === urgency.value}
                        onChange={(e) => setTaskData((prev) => ({ ...prev, urgency: e.target.value }))}
                      />
                      <Label htmlFor={urgency.value} className={urgency.color}>
                        {urgency.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Additional Details */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
              <CardDescription>Add requirements and questions for applicants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Project Requirements</Label>
                <div className="flex gap-2">
                  <Input
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    placeholder="Add a requirement..."
                    onKeyPress={addRequirement}
                  />
                  <Button type="button" onClick={() => addRequirement()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {taskData.requirements.map((requirement, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{requirement}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeRequirement(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label>Questions for Applicants</Label>
                <div className="flex gap-2">
                  <Input
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Add a question..."
                    onKeyPress={addQuestion}
                  />
                  <Button type="button" onClick={() => addQuestion()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {taskData.questions.map((question, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{question}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestion(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

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
              <CardTitle>Review Your Task</CardTitle>
              <CardDescription>Review all details before posting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Title</Label>
                  <p className="font-medium">{taskData.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                  <p className="font-medium">{taskData.category}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Budget Range</Label>
                  <p className="font-medium">
                    ₦{taskData.budget.min} - ₦{taskData.budget.max}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
                  <p className="font-medium">{taskData.duration}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                <p className="text-sm mt-1">{taskData.description}</p>
              </div>

              {taskData.skills.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Required Skills</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {taskData.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
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
                    Posting Task...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Post Task
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
