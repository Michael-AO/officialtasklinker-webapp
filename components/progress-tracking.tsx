"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import {
  CheckCircle2,
  MessageSquare,
  Play,
  Target,
  Trophy,
  AlertTriangle,
  Info,
  Mail,
} from "lucide-react"

interface ProgressTrackingProps {
  applicationId: string
  freelancerEmail: string
  freelancerName: string
  taskTitle: string
  isClient: boolean
}

interface ProgressData {
  first_contact: boolean
  project_kickoff: boolean
  midpoint: boolean
  completed: boolean
  updated_at: string
}

const progressSteps = [
  {
    key: "first_contact",
    label: "First Contact",
    description: "Initial communication established",
    icon: MessageSquare,
    color: "bg-blue-100 text-blue-800",
  },
  {
    key: "project_kickoff",
    label: "Project Kickoff",
    description: "Project officially started",
    icon: Play,
    color: "bg-green-100 text-green-800",
  },
  {
    key: "midpoint",
    label: "Mid Point",
    description: "Project is 50% complete",
    icon: Target,
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    key: "completed",
    label: "Completed",
    description: "Project finished successfully",
    icon: Trophy,
    color: "bg-purple-100 text-purple-800",
  },
]

export function ProgressTracking({
  applicationId,
  freelancerEmail,
  freelancerName,
  taskTitle,
  isClient,
}: ProgressTrackingProps) {
  const { user } = useAuth()
  const [progress, setProgress] = useState<ProgressData>({
    first_contact: false,
    project_kickoff: false,
    midpoint: false,
    completed: false,
    updated_at: "",
  })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [showInstructions, setShowInstructions] = useState(false)

  useEffect(() => {
    fetchProgress()
  }, [applicationId])

  const fetchProgress = async () => {
    if (!user?.id) return

    try {
      const response = await fetch(`/api/applications/${applicationId}/progress`, {
        headers: {
          "user-id": user.id,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setProgress(data.progress)
        }
      }
    } catch (error) {
      console.error("Error fetching progress:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateProgress = async (progressType: string) => {
    if (!user?.id || !isClient) return

    setUpdating(progressType)
    try {
      const response = await fetch(`/api/applications/${applicationId}/progress`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "user-id": user.id,
        },
        body: JSON.stringify({ progress_type: progressType }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setProgress(prev => ({
            ...prev,
            [progressType]: true,
            updated_at: new Date().toISOString(),
          }))
          toast({
            title: "Progress Updated",
            description: `Marked ${progressType.replace("_", " ")} as complete`,
          })
        }
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to update progress",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating progress:", error)
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      })
    } finally {
      setUpdating(null)
    }
  }

  const handleToggle = (progressType: string) => {
    if (!isClient) return

    // Check if this step can be toggled (must be in order)
    const stepIndex = progressSteps.findIndex(step => step.key === progressType)
    const previousStep = progressSteps[stepIndex - 1]
    
    if (previousStep && !progress[previousStep.key as keyof ProgressData]) {
      toast({
        title: "Cannot Skip Steps",
        description: `Please complete ${previousStep.label} first`,
        variant: "destructive",
      })
      return
    }

    updateProgress(progressType)
  }

  const getProgressPercentage = () => {
    const completedSteps = Object.values(progress).filter(Boolean).length - 1 // -1 for updated_at
    return Math.round((completedSteps / 4) * 100)
  }

  const getOverallStatus = () => {
    if (progress.completed) return "Completed"
    if (progress.midpoint) return "In Progress (75%)"
    if (progress.project_kickoff) return "In Progress (50%)"
    if (progress.first_contact) return "In Progress (25%)"
    return "Not Started"
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progress Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {progressSteps.map((step) => (
              <div key={step.key} className="flex items-center space-x-3">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Progress Tracking</CardTitle>
          {isClient && (
            <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Info className="h-4 w-4 mr-2" />
                  Instructions
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Progress Tracking Instructions</DialogTitle>
                  <DialogDescription>
                    Use these toggles to track the freelancer's progress through your project.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">When to use each toggle:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 mt-0.5 text-blue-600" />
                        <div>
                          <strong>First Contact:</strong> After you've had initial communication with the freelancer
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Play className="h-4 w-4 mt-0.5 text-green-600" />
                        <div>
                          <strong>Project Kickoff:</strong> When the freelancer has started working on the project
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Target className="h-4 w-4 mt-0.5 text-yellow-600" />
                        <div>
                          <strong>Mid Point:</strong> When the project is approximately 50% complete
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Trophy className="h-4 w-4 mt-0.5 text-purple-600" />
                        <div>
                          <strong>Completed:</strong> When the project is finished and delivered
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 mt-0.5 text-blue-600" />
                      <div className="text-sm text-blue-800">
                        <strong>Important:</strong> Once you toggle a step, it cannot be undone. Make sure you're certain before marking a step as complete.
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => setShowInstructions(false)}>Got it</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{getOverallStatus()}</Badge>
            <span className="text-sm text-muted-foreground">
              {getProgressPercentage()}% complete
            </span>
          </div>
          {isClient && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const subject = encodeURIComponent(`Re: ${taskTitle} - Project Update`)
                const body = encodeURIComponent(`Hi ${freelancerName},\n\nI hope this email finds you well. I wanted to check in on the progress of our project "${taskTitle}".\n\nCould you please provide an update on:\n- Current status\n- Any challenges you're facing\n- Expected completion timeline\n\nLooking forward to hearing from you.\n\nBest regards,\n${user?.name}`)
                window.open(`mailto:${freelancerEmail}?subject=${subject}&body=${body}`)
              }}
            >
              <Mail className="h-4 w-4 mr-2" />
              Email Freelancer
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {progressSteps.map((step) => {
            const isCompleted = progress[step.key as keyof ProgressData] as boolean
            const Icon = step.icon
            const isUpdating = updating === step.key

            return (
              <div key={step.key} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${isCompleted ? step.color : "bg-gray-100"}`}>
                    <Icon className={`h-4 w-4 ${isCompleted ? "" : "text-gray-400"}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">{step.label}</Label>
                      {isCompleted && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {isClient ? (
                    <Switch
                      checked={isCompleted}
                      onCheckedChange={() => handleToggle(step.key)}
                      disabled={isUpdating || isCompleted}
                    />
                  ) : (
                    <Badge className={isCompleted ? step.color : "bg-gray-100 text-gray-600"}>
                      {isCompleted ? "Complete" : "Pending"}
                    </Badge>
                  )}
                  {isUpdating && <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>}
                </div>
              </div>
            )
          })}
        </div>

        {progress.updated_at && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date(progress.updated_at).toLocaleString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 