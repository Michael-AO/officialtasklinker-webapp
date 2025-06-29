"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Plus, X, Upload, FileText, DollarSign, Clock, CheckCircle, Lock, Info } from "lucide-react"
import { useRouter } from "next/navigation"

interface TaskFormData {
  title: string
  description: string
  category: string
  subcategory: string
  skills: string[]
  budgetType: "fixed" | "hourly"
  budget: string
  duration: string
  experienceLevel: "entry" | "intermediate" | "expert"
  location: string
  isRemote: boolean
  attachments: File[]
  requirements: string[]
  isUrgent: boolean
}

export function TaskPostingForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newSkill, setNewSkill] = useState("")
  const [newRequirement, setNewRequirement] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    category: "",
    subcategory: "",
    skills: [],
    budgetType: "fixed",
    budget: "",
    duration: "",
    experienceLevel: "intermediate",
    location: "",
    isRemote: false,
    attachments: [],
    requirements: [],
    isUrgent: false,
  })

  const categories = {
    "Web Development": ["Frontend", "Backend", "Full Stack", "E-commerce", "CMS"],
    "Mobile Development": ["iOS", "Android", "React Native", "Flutter", "Hybrid"],
    Design: ["UI/UX", "Graphic Design", "Logo Design", "Branding", "Illustration"],
    Writing: ["Content Writing", "Copywriting", "Technical Writing", "Blog Writing", "SEO Writing"],
    Marketing: ["Digital Marketing", "Social Media", "SEO", "PPC", "Email Marketing"],
    "Data Analysis": ["Data Science", "Business Intelligence", "Excel", "Python", "SQL"],
    "Medicine and Health": ["Medical Writing", "Health Content", "Research", "Documentation", "Consultation"],
  }

  const totalSteps = 4
  const progressPercentage = (currentStep / totalSteps) * 100

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }))
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }))
  }

  const addRequirement = () => {
    if (newRequirement.trim() && !formData.requirements.includes(newRequirement.trim())) {
      setFormData((prev) => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()],
      }))
      setNewRequirement("")
    }
  }

  const removeRequirement = (reqToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((req) => req !== reqToRemove),
    }))
  }

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files)
      setFormData((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...newFiles],
      }))
    }
  }

  const removeAttachment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      console.log("Form: Submitting task data:", {
        title: formData.title,
        category: formData.category,
        budget_type: formData.budgetType,
        budget_min: formData.budget,
        budget_max: formData.budget,
      })

      const requestBody = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory,
        budget_type: formData.budgetType,
        budget_min: Number.parseFloat(formData.budget),
        budget_max: Number.parseFloat(formData.budget) * 1.2, // Add 20% buffer for max
        currency: "NGN",
        duration: formData.duration,
        location: formData.location || "Remote",
        skills_required: formData.skills,
        questions: formData.requirements, // Map requirements to questions
        requirements: formData.requirements,
        visibility: "public",
        urgency: formData.isUrgent ? "high" : "normal",
        experience_level: formData.experienceLevel,
        requires_escrow: false, // MVP - no escrow yet
      }

      console.log("Form: Full request body:", requestBody)

      const response = await fetch("/api/tasks/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log("Form: Response status:", response.status)
      console.log("Form: Response headers:", Object.fromEntries(response.headers.entries()))

      const responseText = await response.text()
      console.log("Form: Raw response:", responseText)

      let result
      try {
        result = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Form: Failed to parse response as JSON:", parseError)
        throw new Error(`Invalid response format: ${responseText}`)
      }

      if (!response.ok) {
        console.error("Form: API error response:", result)
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      console.log("Form: Success response:", result)

      if (result.success) {
        setIsSubmitted(true)

        // Show success message
        console.log("Task posted successfully:", result.task.id)

        // Redirect after showing success
        setTimeout(() => {
          router.push("/dashboard/browse")
        }, 2000)
      } else {
        throw new Error(result.error || "Unknown error occurred")
      }
    } catch (error) {
      console.error("Form: Failed to post task:", error)

      // More detailed error message
      let errorMessage = "Failed to post task. Please try again."

      if (error instanceof Error) {
        if (error.message.includes("Unauthorized")) {
          errorMessage = "Please log in to post a task."
        } else if (error.message.includes("Missing required fields")) {
          errorMessage = "Please fill in all required fields."
        } else {
          errorMessage = error.message
        }
      }

      alert(`Error: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return formData.title && formData.description && formData.category
      case 2:
        return formData.skills.length > 0 && formData.experienceLevel
      case 3:
        return formData.budgetType && formData.budget && formData.duration
      case 4:
        return true
      default:
        return false
    }
  }

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Task Posted Successfully!</h2>
              <p className="text-gray-600 mb-4">
                Your task "{formData.title}" has been posted and is now visible to freelancers.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Budget:</span>
                  <span className="font-medium">₦{Number.parseInt(formData.budget).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Category:</span>
                  <span className="font-medium">{formData.category}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">Redirecting to browse tasks...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Post a New Task</h1>
        <p className="text-gray-600">Create a detailed task posting to find the right freelancer</p>
      </div>

      {/* Progress */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progressPercentage)}% complete</span>
          </div>
          <Progress value={progressPercentage} className="mb-4" />
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className={`text-center ${currentStep >= 1 ? "text-[#04A466]" : "text-gray-400"}`}>Task Details</div>
            <div className={`text-center ${currentStep >= 2 ? "text-[#04A466]" : "text-gray-400"}`}>
              Skills & Requirements
            </div>
            <div className={`text-center ${currentStep >= 3 ? "text-[#04A466]" : "text-gray-400"}`}>
              Budget & Timeline
            </div>
            <div className={`text-center ${currentStep >= 4 ? "text-[#04A466]" : "text-gray-400"}`}>Review & Post</div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Notice */}
      <Alert className="mb-6 border-orange-200 bg-orange-50">
        <Lock className="h-4 w-4" />
        <AlertDescription>
          <strong>MVP Notice:</strong> Payment processing and escrow features are coming soon. For now, you can post
          tasks and manage applications. Payment arrangements will be handled directly with freelancers.
        </AlertDescription>
      </Alert>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {/* Step 1: Task Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Task Details</h3>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Task Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Build a responsive e-commerce website"
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Write a clear, descriptive title that explains what you need done
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="description">Task Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your project in detail. Include what you want to achieve, any specific requirements, and what success looks like..."
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      className="mt-1 min-h-[120px]"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum 100 characters. Be specific about your requirements and expectations.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, category: value, subcategory: "" }))
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(categories).map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Subcategory</Label>
                      <Select
                        value={formData.subcategory}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, subcategory: value }))}
                        disabled={!formData.category}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.category &&
                            categories[formData.category as keyof typeof categories]?.map((sub) => (
                              <SelectItem key={sub} value={sub}>
                                {sub}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Skills & Requirements */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Skills & Requirements</h3>

                <div className="space-y-4">
                  <div>
                    <Label>Required Skills *</Label>
                    <div className="mt-1 space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a skill (e.g., React, Photoshop, SEO)"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                        />
                        <Button type="button" onClick={addSkill} variant="outline">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                            {skill}
                            <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill(skill)} />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Experience Level *</Label>
                    <Select
                      value={formData.experienceLevel}
                      onValueChange={(value: "entry" | "intermediate" | "expert") =>
                        setFormData((prev) => ({ ...prev, experienceLevel: value }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">Entry Level - New to the field</SelectItem>
                        <SelectItem value="intermediate">Intermediate - Some experience</SelectItem>
                        <SelectItem value="expert">Expert - Extensive experience</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Additional Requirements</Label>
                    <div className="mt-1 space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a requirement (e.g., Portfolio required, Available weekends)"
                          value={newRequirement}
                          onChange={(e) => setNewRequirement(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRequirement())}
                        />
                        <Button type="button" onClick={addRequirement} variant="outline">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-1">
                        {formData.requirements.map((req, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span className="text-sm">{req}</span>
                            <X
                              className="h-4 w-4 cursor-pointer text-gray-400 hover:text-red-500"
                              onClick={() => removeRequirement(req)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Budget & Timeline */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Budget & Timeline</h3>

                <div className="space-y-4">
                  <div>
                    <Label>Budget Type *</Label>
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      <Card
                        className={`cursor-pointer border-2 ${formData.budgetType === "fixed" ? "border-[#04A466]" : "border-gray-200"}`}
                        onClick={() => setFormData((prev) => ({ ...prev, budgetType: "fixed" }))}
                      >
                        <CardContent className="pt-4 text-center">
                          <DollarSign className="h-6 w-6 mx-auto mb-2" />
                          <h4 className="font-medium">Fixed Price</h4>
                          <p className="text-xs text-gray-500">Pay a set amount for the entire project</p>
                        </CardContent>
                      </Card>
                      <Card
                        className={`cursor-pointer border-2 ${formData.budgetType === "hourly" ? "border-[#04A466]" : "border-gray-200"}`}
                        onClick={() => setFormData((prev) => ({ ...prev, budgetType: "hourly" }))}
                      >
                        <CardContent className="pt-4 text-center">
                          <Clock className="h-6 w-6 mx-auto mb-2" />
                          <h4 className="font-medium">Hourly Rate</h4>
                          <p className="text-xs text-gray-500">Pay based on time worked</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="budget">
                      {formData.budgetType === "fixed" ? "Project Budget" : "Hourly Rate"} (₦) *
                    </Label>
                    <Input
                      id="budget"
                      type="number"
                      placeholder={formData.budgetType === "fixed" ? "e.g., 150000" : "e.g., 5000"}
                      value={formData.budget}
                      onChange={(e) => setFormData((prev) => ({ ...prev, budget: e.target.value }))}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.budgetType === "fixed"
                        ? "Total amount you're willing to pay for the entire project"
                        : "Amount you're willing to pay per hour"}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="duration">Project Duration *</Label>
                    <Select
                      value={formData.duration}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, duration: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-3 days">1-3 days</SelectItem>
                        <SelectItem value="1 week">1 week</SelectItem>
                        <SelectItem value="2-3 weeks">2-3 weeks</SelectItem>
                        <SelectItem value="1 month">1 month</SelectItem>
                        <SelectItem value="2-3 months">2-3 months</SelectItem>
                        <SelectItem value="3+ months">3+ months</SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="e.g., Lagos, Nigeria"
                        value={formData.location}
                        onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex items-center space-x-2 mt-6">
                      <Checkbox
                        id="remote"
                        checked={formData.isRemote}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isRemote: !!checked }))}
                      />
                      <Label htmlFor="remote">Remote work allowed</Label>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="urgent"
                      checked={formData.isUrgent}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isUrgent: !!checked }))}
                    />
                    <Label htmlFor="urgent">This is an urgent task</Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review & Post */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Review & Post</h3>

                <div className="space-y-6">
                  {/* Task Summary */}
                  <Card className="bg-gray-50">
                    <CardContent className="pt-4">
                      <h4 className="font-semibold mb-2">{formData.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{formData.description}</p>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Category:</span> {formData.category}
                          {formData.subcategory && ` > ${formData.subcategory}`}
                        </div>
                        <div>
                          <span className="font-medium">Experience:</span> {formData.experienceLevel}
                        </div>
                        <div>
                          <span className="font-medium">Budget:</span> ₦
                          {Number.parseInt(formData.budget).toLocaleString()}({formData.budgetType})
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span> {formData.duration}
                        </div>
                      </div>

                      <div className="mt-3">
                        <span className="font-medium text-sm">Skills:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {formData.skills.map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* File Attachments */}
                  <div>
                    <Label>Project Files (Optional)</Label>
                    <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Upload any relevant files, mockups, or documents</p>
                      <input
                        type="file"
                        multiple
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                        id="file-upload"
                      />
                      <Button variant="outline" asChild>
                        <label htmlFor="file-upload" className="cursor-pointer">
                          Choose Files
                        </label>
                      </Button>
                    </div>

                    {formData.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {formData.attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span className="text-sm">{file.name}</span>
                            </div>
                            <X
                              className="h-4 w-4 cursor-pointer text-gray-400 hover:text-red-500"
                              onClick={() => removeAttachment(index)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Terms Notice */}
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      By posting this task, you agree to Tasklinkers' Terms of Service and Privacy Policy. Your task
                      will be visible to all freelancers on the platform.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            <div className="flex gap-2">
              <Button variant="outline">Save Draft</Button>

              {currentStep < totalSteps ? (
                <Button
                  onClick={() => setCurrentStep((prev) => prev + 1)}
                  disabled={!canProceedToNext()}
                  className="bg-[#04A466] hover:bg-[#038855]"
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !canProceedToNext()}
                  className="bg-[#04A466] hover:bg-[#038855]"
                >
                  {isSubmitting ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2 animate-spin" />
                      Posting Task...
                    </>
                  ) : (
                    "Post Task"
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
