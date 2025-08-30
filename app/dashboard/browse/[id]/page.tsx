"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  Star,
  CheckCircle2,
  AlertCircle,
  Send,
  FileText,
  Plus,
  X,
  User,
  Upload,
  File,
  ImageIcon,
  ArrowRight,
  ArrowLeftIcon,
} from "lucide-react"
import Link from "next/link"
import { formatNaira } from "@/lib/currency"
import { NairaIcon } from "@/components/naira-icon"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"
import { DojahModal } from "@/components/dojah-modal"

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
  requirements: string[]
  questions: string[]
  applications_count: number
  views_count: number
  created_at: string
  deadline: string
  urgency: string
  client: {
    id: string
    name: string
    avatar_url: string
    rating: number
    reviews: number
    is_verified: boolean
    location: string
    join_date: string
    bio: string
  }
}

interface MyApplication {
  id: string
  status: string
  proposed_budget: number
  budget_type: string
  estimated_duration: string
  cover_letter: string
  portfolio_items: any[]
  question_responses: Record<string, string>
  applied_date: string
}

interface PortfolioItem {
  id: string
  title: string
  description: string
  file_url: string
  file_type: string
  file_name: string
  file_size: number
  file?: File
}

export default function TaskViewPage() {
  const params = useParams()
  const router = useRouter()
  const { user, updateProfile } = useAuth()
  const taskId = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [task, setTask] = useState<TaskData | null>(null)
  const [myApplication, setMyApplication] = useState<MyApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [applying, setApplying] = useState(false)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [currentTab, setCurrentTab] = useState("proposal")
  const [showDojahModal, setShowDojahModal] = useState(false)

  // Application form state
  const [proposedBudget, setProposedBudget] = useState("")
  const [budgetType, setBudgetType] = useState("fixed")
  const [estimatedDuration, setEstimatedDuration] = useState("")
  const [coverLetter, setCoverLetter] = useState("")
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [questionResponses, setQuestionResponses] = useState<Record<string, string>>({})
  const [newPortfolioTitle, setNewPortfolioTitle] = useState("")
  const [newPortfolioDescription, setNewPortfolioDescription] = useState("")

  // Tab navigation
  const tabs = ["proposal", "portfolio", "questions", "review"]
  const currentTabIndex = tabs.indexOf(currentTab)

  // Fetch task details and check if user has applied
  useEffect(() => {
    const fetchTaskData = async () => {
      if (!taskId || !user?.id) return

      try {
        setLoading(true)
        setError(null)

        console.log("=== Fetching task details for freelancer view:", taskId)

        // Fetch task details
        const taskResponse = await fetch(`/api/tasks/${taskId}`, {
          headers: {
            "user-id": user.id,
          },
        })

        if (!taskResponse.ok) {
          throw new Error(`Failed to fetch task: ${taskResponse.status}`)
        }

        const taskData = await taskResponse.json()
        console.log("=== Task data:", taskData)

        if (!taskData.success) {
          throw new Error(taskData.error || "Failed to fetch task")
        }

        // Transform task data
        const transformedTask: TaskData = {
          id: taskData.task.id,
          title: taskData.task.title,
          description: taskData.task.description,
          budget_min: taskData.task.budget_min || 0,
          budget_max: taskData.task.budget_max || 0,
          budget_type: taskData.task.budget_type || "fixed",
          status: taskData.task.status,
          category: taskData.task.category || "General",
          location: taskData.task.location || "Remote",
          skills_required: taskData.task.skills_required || [],
          requirements: taskData.task.requirements || [],
          questions: taskData.task.questions || [],
          applications_count: taskData.task.applications_count || 0,
          views_count: taskData.task.views_count || 0,
          created_at: taskData.task.created_at,
          deadline: taskData.task.deadline || taskData.task.created_at,
          urgency: taskData.task.urgency || "normal",
          client: {
            id: taskData.task.client?.id || "",
            name: taskData.task.client?.name || "Anonymous Client",
            avatar_url: taskData.task.client?.avatar_url || "",
            rating: taskData.task.client?.rating || 4.8,
            reviews: taskData.task.client?.completed_tasks || 0,
            is_verified: taskData.task.client?.is_verified || false,
            location: taskData.task.client?.location || "Not specified",
            join_date: taskData.task.client?.join_date || taskData.task.created_at,
            bio: taskData.task.client?.bio || "Experienced client on Tasklinkers platform",
          },
        }

        setTask(transformedTask)

        // Initialize question responses
        const initialResponses: Record<string, string> = {}
        transformedTask.questions.forEach((question, index) => {
          initialResponses[`question_${index}`] = ""
        })
        setQuestionResponses(initialResponses)

        // Check if user has applied to this task
        const applicationResponse = await fetch(`/api/tasks/${taskId}/my-application`, {
          headers: {
            "user-id": user.id,
          },
        })

        if (applicationResponse.ok) {
          const applicationData = await applicationResponse.json()
          console.log("=== My application data:", applicationData)

          if (applicationData.success && applicationData.application) {
            setMyApplication(applicationData.application)
          }
        }
      } catch (error) {
        console.error("=== Error fetching task:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch task")
      } finally {
        setLoading(false)
      }
    }

    fetchTaskData()
  }, [taskId, user?.id])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB. Please choose a smaller file.`,
          variant: "destructive",
        })
        return
      }

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ]

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type.`,
          variant: "destructive",
        })
        return
      }

      // Create portfolio item with file
      const newItem: PortfolioItem = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        title: file.name.split(".")[0],
        description: "",
        file_url: URL.createObjectURL(file),
        file_type: file.type,
        file_name: file.name,
        file_size: file.size,
        file: file,
      }

      setPortfolioItems((prev) => [...prev, newItem])
    })

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleApply = async () => {
    if (!task || !user?.id) return

    try {
      setApplying(true)

      const applicationData = {
        proposed_budget: Number.parseFloat(proposedBudget),
        budget_type: budgetType,
        estimated_duration: estimatedDuration,
        cover_letter: coverLetter,
        portfolio_items: portfolioItems.map((item) => ({
          title: item.title,
          description: item.description,
          file_url: item.file_url,
          file_type: item.file_type,
          file_name: item.file_name,
          file_size: item.file_size,
        })),
        question_responses: questionResponses,
      }

      const response = await fetch(`/api/tasks/${taskId}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "user-id": user.id,
        },
        body: JSON.stringify(applicationData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Application Submitted!",
          description: "Your detailed application has been sent to the client.",
        })

        // Refresh the page to show the application
        window.location.reload()
      } else {
        throw new Error(data.error || "Failed to submit application")
      }
    } catch (error) {
      console.error("=== Error applying:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit application",
        variant: "destructive",
      })
    } finally {
      setApplying(false)
    }
  }

  const addPortfolioItem = () => {
    if (newPortfolioTitle.trim() && newPortfolioDescription.trim()) {
      const newItem: PortfolioItem = {
        id: Date.now().toString(),
        title: newPortfolioTitle.trim(),
        description: newPortfolioDescription.trim(),
        file_url: "/placeholder.svg?height=200&width=300&text=Portfolio+Item",
        file_type: "image",
        file_name: "portfolio-item.jpg",
        file_size: 0,
      }
      setPortfolioItems([...portfolioItems, newItem])
      setNewPortfolioTitle("")
      setNewPortfolioDescription("")
    }
  }

  const removePortfolioItem = (id: string) => {
    setPortfolioItems(portfolioItems.filter((item) => item.id !== id))
  }

  const updatePortfolioItem = (id: string, updates: Partial<PortfolioItem>) => {
    setPortfolioItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)))
  }

  const updateQuestionResponse = (questionIndex: number, response: string) => {
    setQuestionResponses((prev) => ({
      ...prev,
      [`question_${questionIndex}`]: response,
    }))
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <ImageIcon className="h-4 w-4" />
    if (fileType === "application/pdf") return <FileText className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const canProceedToNext = () => {
    switch (currentTab) {
      case "proposal":
        return proposedBudget && estimatedDuration && coverLetter
      case "portfolio":
        return true // Portfolio is optional
      case "questions":
        return (
          task?.questions.length === 0 || task?.questions.every((_, index) => questionResponses[`question_${index}`])
        )
      case "review":
        return true
      default:
        return false
    }
  }

  const nextTab = () => {
    if (currentTabIndex < tabs.length - 1) {
      setCurrentTab(tabs[currentTabIndex + 1])
    }
  }

  const prevTab = () => {
    if (currentTabIndex > 0) {
      setCurrentTab(tabs[currentTabIndex - 1])
    }
  }

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "interviewing":
        return "bg-blue-100 text-blue-800"
      case "withdrawn":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  const getApplicationStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle2 className="h-4 w-4" />
      case "rejected":
        return <AlertCircle className="h-4 w-4" />
      case "interviewing":
        return <MessageSquare className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
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
                {error || "The task you're looking for doesn't exist or is no longer available."}
              </p>
              <Button onClick={() => router.push("/dashboard/browse")}>Back to Browse Tasks</Button>
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
            <p className="text-muted-foreground">{myApplication ? "Your Application Status" : "Available Task"}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {myApplication && (
            <Badge className={getApplicationStatusColor(myApplication.status)}>
              {getApplicationStatusIcon(myApplication.status)}
              <span className="ml-1 capitalize">{myApplication.status}</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Application Status Alert */}
      {myApplication && (
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">{getApplicationStatusIcon(myApplication.status)}</div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Application Status: {myApplication.status}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Applied on {new Date(myApplication.applied_date).toLocaleDateString()} with a proposed budget of{" "}
                  <span className="font-medium">
                    {formatNaira(myApplication.proposed_budget)}
                    {myApplication.budget_type === "hourly" ? "/hr" : ""}
                  </span>
                </p>
                {myApplication.status === "pending" && (
                  <p className="text-sm text-blue-600">
                    Your application is under review. The client will respond soon.
                  </p>
                )}
                {myApplication.status === "accepted" && (
                  <p className="text-sm text-green-600">
                    Congratulations! Your application has been accepted. You can now start working on this project.
                  </p>
                )}
                {myApplication.status === "rejected" && (
                  <p className="text-sm text-red-600">
                    Unfortunately, your application was not selected for this project.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task Details */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Task Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
            <p className="text-muted-foreground whitespace-pre-wrap">{task.description}</p>

            {task.skills_required.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {task.skills_required.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {task.requirements.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Project Requirements</h4>
                <ul className="list-disc list-inside space-y-1">
                  {task.requirements.map((requirement, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {requirement}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
              <div className="flex items-center gap-2">
                <NairaIcon className="h-4 w-4 text-muted-foreground" />
                <span>
                  {task.budget_type === "fixed"
                    ? `${formatNaira(task.budget_max)} (Fixed Price)`
                    : `${formatNaira(task.budget_max)} (Hourly)`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{task.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Posted: {new Date(task.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={task.client.avatar_url} />
                  <AvatarFallback className="bg-black text-white">
                    {getInitials(task.client.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{task.client.name}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{task.client.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">({task.client.reviews} reviews)</span>
                    {task.client.is_verified && (
                      <Badge variant="secondary" className="text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Member Since</span>
                  <span>{new Date(task.client.join_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Location</span>
                  <span>{task.client.location}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Jobs Posted</span>
                  <span>{task.client.reviews}</span>
                </div>
                <div className="flex justify-between">
                  <span>Category</span>
                  <span>{task.category}</span>
                </div>
                <div className="flex justify-between">
                  <span>Applications</span>
                  <span>{task.applications_count}</span>
                </div>
              </div>

              {task.client.bio && (
                <div>
                  <p className="text-sm text-muted-foreground">{task.client.bio}</p>
                </div>
              )}

              {myApplication?.status === "accepted" && (
                <Button className="w-full" asChild>
                  <Link href={`/dashboard/messages?client=${task.client.id}`}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message Client
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Application Action */}
          {!myApplication && (
            <Card>
              <CardHeader>
                <CardTitle>Apply for this Task</CardTitle>
              </CardHeader>
              <CardContent>
                {!showApplicationForm ? (
                  <Button className="w-full" onClick={() => {
                    if (!user?.isVerified) {
                      setShowDojahModal(true)
                      toast({
                        title: "ID Verification Required",
                        description: "You must verify your identity before applying for tasks.",
                        variant: "destructive",
                      })
                      return
                    }
                    setShowApplicationForm(true)
                  }}>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Detailed Application
                  </Button>
                ) : (
                  <Dialog open={showApplicationForm} onOpenChange={setShowApplicationForm}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Submit Application</DialogTitle>
                        <DialogDescription>
                          Provide detailed information about your proposal for this project.
                        </DialogDescription>
                      </DialogHeader>

                      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="proposal">Proposal</TabsTrigger>
                          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                          <TabsTrigger value="questions">Questions</TabsTrigger>
                          <TabsTrigger value="review">Review</TabsTrigger>
                        </TabsList>

                        <TabsContent value="proposal" className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="budget">Your Proposed Budget</Label>
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <NairaIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  id="budget"
                                  type="number"
                                  placeholder="Enter amount"
                                  value={proposedBudget}
                                  onChange={(e) => setProposedBudget(e.target.value)}
                                  className="pl-10"
                                />
                              </div>
                              <Select value={budgetType} onValueChange={setBudgetType}>
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="fixed">Fixed</SelectItem>
                                  <SelectItem value="hourly">Per Hour</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Client's budget: {formatNaira(task.budget_max)} ({task.budget_type})
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="duration">Estimated Duration</Label>
                            <Input
                              id="duration"
                              placeholder="e.g., 2 weeks, 1 month"
                              value={estimatedDuration}
                              onChange={(e) => setEstimatedDuration(e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="cover-letter">Cover Letter</Label>
                            <Textarea
                              id="cover-letter"
                              placeholder="Explain why you're the best fit for this project. Include your approach, relevant experience, and what makes you unique..."
                              value={coverLetter}
                              onChange={(e) => setCoverLetter(e.target.value)}
                              rows={8}
                            />
                          </div>
                        </TabsContent>

                        <TabsContent value="portfolio" className="space-y-4">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">Add Portfolio Items</h4>
                              <p className="text-sm text-muted-foreground mb-4">
                                Showcase relevant work samples that demonstrate your skills for this project.
                              </p>
                            </div>

                            {/* File Upload Section */}
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm font-medium mb-1">Upload Documents & Images</p>
                              <p className="text-xs text-muted-foreground mb-3">
                                PDF, DOC, DOCX, PPT, PPTX, JPG, PNG, GIF (Max 10MB each)
                              </p>
                              <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm">
                                Choose Files
                              </Button>
                              <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.txt"
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                            </div>

                            {/* Manual Portfolio Entry */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="portfolio-title">Portfolio Title</Label>
                                <Input
                                  id="portfolio-title"
                                  placeholder="e.g., E-commerce Website Design"
                                  value={newPortfolioTitle}
                                  onChange={(e) => setNewPortfolioTitle(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="portfolio-description">Description</Label>
                                <Input
                                  id="portfolio-description"
                                  placeholder="Brief description of the work"
                                  value={newPortfolioDescription}
                                  onChange={(e) => setNewPortfolioDescription(e.target.value)}
                                />
                              </div>
                            </div>

                            <Button
                              type="button"
                              onClick={addPortfolioItem}
                              disabled={!newPortfolioTitle.trim() || !newPortfolioDescription.trim()}
                              variant="outline"
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Portfolio Item
                            </Button>

                            <Separator />

                            <div className="space-y-3">
                              {portfolioItems.map((item) => (
                                <Card key={item.id} className="p-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        {getFileIcon(item.file_type)}
                                        <h5 className="font-medium">{item.title}</h5>
                                        {item.file && (
                                          <Badge variant="secondary" className="text-xs">
                                            {(item.file_size / 1024 / 1024).toFixed(1)}MB
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="space-y-2">
                                        <Input
                                          placeholder="Portfolio title..."
                                          value={item.title}
                                          onChange={(e) => updatePortfolioItem(item.id, { title: e.target.value })}
                                        />
                                        <Textarea
                                          placeholder="Describe this work..."
                                          value={item.description}
                                          onChange={(e) =>
                                            updatePortfolioItem(item.id, { description: e.target.value })
                                          }
                                          rows={2}
                                        />
                                      </div>
                                      {item.file_type.startsWith("image/") && (
                                        <div className="mt-2">
                                          <img
                                            src={item.file_url || "/placeholder.svg"}
                                            alt={item.title}
                                            className="w-full h-32 object-cover rounded border"
                                          />
                                        </div>
                                      )}
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removePortfolioItem(item.id)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </Card>
                              ))}
                              {portfolioItems.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                  <FileText className="h-8 w-8 mx-auto mb-2" />
                                  <p>No portfolio items added yet</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="questions" className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Client Questions</h4>
                            <p className="text-sm text-muted-foreground mb-4">
                              Please answer the following questions from the client.
                            </p>
                          </div>

                          {task.questions.length > 0 ? (
                            <div className="space-y-4">
                              {task.questions.map((question, index) => (
                                <div key={index} className="space-y-2">
                                  <Label htmlFor={`question-${index}`}>
                                    Question {index + 1}: {question}
                                  </Label>
                                  <Textarea
                                    id={`question-${index}`}
                                    placeholder="Your answer..."
                                    value={questionResponses[`question_${index}`] || ""}
                                    onChange={(e) => updateQuestionResponse(index, e.target.value)}
                                    rows={3}
                                  />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                              <p>No specific questions from the client</p>
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="review" className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-4">Review Your Application</h4>
                          </div>

                          <div className="space-y-4">
                            <Card className="p-4">
                              <h5 className="font-medium mb-2">Proposal Summary</h5>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Proposed Budget:</span>
                                  <p className="font-medium">
                                    {proposedBudget ? formatNaira(Number.parseFloat(proposedBudget)) : "Not specified"}
                                    {budgetType === "hourly" ? "/hr" : ""}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Duration:</span>
                                  <p className="font-medium">{estimatedDuration || "Not specified"}</p>
                                </div>
                              </div>
                            </Card>

                            <Card className="p-4">
                              <h5 className="font-medium mb-2">Cover Letter</h5>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {coverLetter || "No cover letter provided"}
                              </p>
                            </Card>

                            <Card className="p-4">
                              <h5 className="font-medium mb-2">Portfolio Items ({portfolioItems.length})</h5>
                              {portfolioItems.length > 0 ? (
                                <div className="space-y-2">
                                  {portfolioItems.map((item) => (
                                    <div key={item.id} className="flex items-center gap-2 text-sm">
                                      {getFileIcon(item.file_type)}
                                      <span className="font-medium">{item.title}</span> - {item.description}
                                      {item.file && (
                                        <Badge variant="secondary" className="text-xs">
                                          {item.file_name}
                                        </Badge>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">No portfolio items added</p>
                              )}
                            </Card>

                            <Card className="p-4">
                              <h5 className="font-medium mb-2">Question Responses</h5>
                              {task.questions.length > 0 ? (
                                <div className="space-y-2">
                                  {task.questions.map((question, index) => (
                                    <div key={index} className="text-sm">
                                      <p className="font-medium">{question}</p>
                                      <p className="text-muted-foreground">
                                        {questionResponses[`question_${index}`] || "No response provided"}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">No questions to answer</p>
                              )}
                            </Card>
                          </div>
                        </TabsContent>
                      </Tabs>

                      {/* Navigation Buttons */}
                      <div className="flex justify-between pt-4 border-t">
                        <Button
                          variant="outline"
                          onClick={prevTab}
                          disabled={currentTabIndex === 0}
                          className="flex items-center gap-2"
                        >
                          <ArrowLeftIcon className="h-4 w-4" />
                          Previous
                        </Button>

                        <div className="flex gap-2">
                          {currentTabIndex < tabs.length - 1 ? (
                            <Button
                              onClick={nextTab}
                              disabled={!canProceedToNext()}
                              className="flex items-center gap-2"
                            >
                              Next
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              onClick={handleApply}
                              disabled={applying || !canProceedToNext()}
                              className="flex items-center gap-2"
                            >
                              {applying ? "Submitting..." : "Submit Application"}
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="outline" onClick={() => setShowApplicationForm(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                <DojahModal
                  open={showDojahModal}
                  onOpenChange={setShowDojahModal}
                  onSuccess={async (result) => {
                    // Determine verification type from Dojah result
                    let verificationType = "individual"
                    if (result?.data?.verification_type === "business" || result?.data?.type === "business") {
                      verificationType = "business"
                    }
                    await updateProfile({ isVerified: true, verification_type: verificationType } as any)
                    toast({
                      title: "ID Verified!",
                      description: `Your identity has been verified as a ${verificationType}. You can now apply for tasks.`,
                    })
                  }}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Application Details Tab (if applied) */}
      {myApplication && (
        <Tabs defaultValue="application" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="application">My Application</TabsTrigger>
            <TabsTrigger value="project">Project Details</TabsTrigger>
          </TabsList>

          <TabsContent value="application">
            <Card>
              <CardHeader>
                <CardTitle>Application Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Proposed Budget</p>
                    <p className="font-semibold">
                      {formatNaira(myApplication.proposed_budget)}
                      {myApplication.budget_type === "hourly" ? "/hr" : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Duration</p>
                    <p className="font-semibold">{myApplication.estimated_duration}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Cover Letter</p>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{myApplication.cover_letter}</p>
                  </div>
                </div>

                {myApplication.portfolio_items && myApplication.portfolio_items.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Portfolio Items</p>
                    <div className="grid grid-cols-2 gap-4">
                      {myApplication.portfolio_items.map((item, index) => (
                        <Card key={index} className="p-3">
                          <div className="flex items-center gap-2">
                            {getFileIcon(item.file_type || "file")}
                            <div>
                              <h6 className="font-medium text-sm">{item.title}</h6>
                              <p className="text-xs text-muted-foreground">{item.description}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Application Date</p>
                    <p className="font-medium">{new Date(myApplication.applied_date).toLocaleDateString()}</p>
                  </div>
                  <Badge className={getApplicationStatusColor(myApplication.status)}>{myApplication.status}</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="project">
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Project Budget</p>
                    <p className="font-semibold">
                      {task.budget_type === "fixed"
                        ? formatNaira(task.budget_max)
                        : `${formatNaira(task.budget_min)} - ${formatNaira(task.budget_max)}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Project Status</p>
                    <p className="font-semibold capitalize">{task.status.replace("_", " ")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Urgency</p>
                    <p className="font-semibold capitalize">{task.urgency}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Your Application Status</p>
                    <div className="flex items-center gap-2">
                      <Badge className={getApplicationStatusColor(myApplication.status)}>
                        {getApplicationStatusIcon(myApplication.status)}
                        <span className="ml-1 capitalize">{myApplication.status}</span>
                      </Badge>
                    </div>
                  </div>
                </div>

                {myApplication.status === "accepted" && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">🎉 Project Awarded!</h4>
                    <p className="text-sm text-green-700">
                      You've been selected for this project. The client may set up escrow protection for secure
                      payments.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
