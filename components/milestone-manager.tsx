"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CheckCircle2, Clock, Download, FileText, Plus, Upload, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { formatNaira } from "@/lib/currency"
import { NairaIcon } from "@/components/naira-icon"

interface Milestone {
  id: string
  title: string
  description: string
  amount: number
  dueDate: string
  status: "pending" | "in_progress" | "submitted" | "approved" | "rejected"
  deliverables: string[]
  submissions: {
    id: string
    fileName: string
    fileUrl: string
    submittedAt: string
    notes: string
  }[]
  feedback?: string
}

interface MilestoneManagerProps {
  taskId: string
  isClient: boolean
  totalBudget: number
  escrowData?: any
  realMilestones?: any[]
}

export function MilestoneManager({
  taskId,
  isClient,
  totalBudget,
  escrowData,
  realMilestones = [],
}: MilestoneManagerProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [escrowId, setEscrowId] = useState<string | null>(null)
  const [isAddingMilestone, setIsAddingMilestone] = useState(false)
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
    amount: "",
    dueDate: "",
    deliverables: [""],
  })
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null)
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (realMilestones && realMilestones.length > 0) {
      console.log("=== Using real milestones:", realMilestones)

      // Transform escrow milestones to component format
      const transformedMilestones = realMilestones.map((m: any) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        amount: m.amount,
        dueDate: m.due_date || new Date().toISOString().split("T")[0],
        status: m.status,
        deliverables: m.deliverables || [],
        submissions: [], // This would come from a separate submissions table
        feedback: m.feedback,
      }))

      setMilestones(transformedMilestones)
      setEscrowId(escrowData?.id || null)
    } else if (escrowData) {
      // If we have escrow but no milestones, it's a single payment escrow
      console.log("=== Single payment escrow detected")
      setEscrowId(escrowData.id)
      setMilestones([])
    } else {
      // No escrow set up yet - show mock data for demo
      console.log("=== No escrow found, using fallback milestones")
      setMilestones([
        {
          id: "mock-1",
          title: "Project Setup & Planning",
          description: "Initial project setup, database design, and project architecture",
          amount: 75000,
          dueDate: "2024-02-15",
          status: "pending",
          deliverables: ["Database schema", "Project architecture document", "Initial setup"],
          submissions: [],
        },
        {
          id: "mock-2",
          title: "Frontend Development",
          description: "Build the user interface and integrate with backend APIs",
          amount: 125000,
          dueDate: "2024-03-01",
          status: "pending",
          deliverables: ["Responsive UI components", "API integration", "User authentication"],
          submissions: [],
        },
      ])
    }
    setIsLoading(false)
  }, [realMilestones, escrowData])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "submitted":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "in_progress":
        return <Clock className="h-4 w-4" />
      case "submitted":
        return <Upload className="h-4 w-4" />
      case "approved":
        return <CheckCircle2 className="h-4 w-4" />
      case "rejected":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const calculateProgress = () => {
    const approvedMilestones = milestones.filter((m) => m.status === "approved")
    return (approvedMilestones.length / milestones.length) * 100
  }

  const getTotalApprovedAmount = () => {
    return milestones.filter((m) => m.status === "approved").reduce((sum, m) => sum + m.amount, 0)
  }

  const getTotalMilestoneAmount = () => {
    return milestones.reduce((sum, m) => sum + m.amount, 0)
  }

  const handleAddMilestone = async () => {
    if (!newMilestone.title || !newMilestone.amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Save to database if escrow exists
      if (escrowId) {
        const response = await fetch("/api/escrow/milestones", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "user-id": "current-user-id", // From auth context
          },
          body: JSON.stringify({
            escrow_id: escrowId,
            title: newMilestone.title,
            description: newMilestone.description,
            amount: Number.parseInt(newMilestone.amount),
            due_date: newMilestone.dueDate,
            deliverables: newMilestone.deliverables.filter((d) => d.trim()),
          }),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            // Add the new milestone to state
            const milestone: Milestone = {
              id: data.milestone.id,
              title: newMilestone.title,
              description: newMilestone.description,
              amount: Number.parseInt(newMilestone.amount),
              dueDate: newMilestone.dueDate,
              status: "pending",
              deliverables: newMilestone.deliverables.filter((d) => d.trim()),
              submissions: [],
            }

            setMilestones((prev) => [...prev, milestone])
          }
        }
      }

      setNewMilestone({
        title: "",
        description: "",
        amount: "",
        dueDate: "",
        deliverables: [""],
      })
      setIsAddingMilestone(false)

      toast({
        title: "Milestone Added",
        description: "New milestone has been created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add milestone",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApproveMilestone = async (milestoneId: string) => {
    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setMilestones((prev) => prev.map((m) => (m.id === milestoneId ? { ...m, status: "approved" as const } : m)))

      const milestone = milestones.find((m) => m.id === milestoneId)

      toast({
        title: "Milestone Approved!",
        description: `${formatNaira(milestone?.amount || 0)} has been released to the freelancer.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve milestone",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRejectMilestone = async (milestoneId: string) => {
    if (!feedback.trim()) {
      toast({
        title: "Error",
        description: "Please provide feedback for rejection",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setMilestones((prev) =>
        prev.map((m) => (m.id === milestoneId ? { ...m, status: "rejected" as const, feedback } : m)),
      )

      toast({
        title: "Milestone Rejected",
        description: "Feedback has been sent to the freelancer",
      })

      setFeedback("")
      setSelectedMilestone(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject milestone",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Project Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(calculateProgress())}%</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Budget</p>
              <p className="font-semibold flex items-center gap-1">
                <NairaIcon className="h-4 w-4" />
                {formatNaira(getTotalMilestoneAmount())}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Released</p>
              <p className="font-semibold text-green-600 flex items-center gap-1">
                <NairaIcon className="h-4 w-4" />
                {formatNaira(getTotalApprovedAmount())}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Remaining</p>
              <p className="font-semibold flex items-center gap-1">
                <NairaIcon className="h-4 w-4" />
                {formatNaira(getTotalMilestoneAmount() - getTotalApprovedAmount())}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Milestones List */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Milestones</h3>
        {isClient && (
          <Dialog open={isAddingMilestone} onOpenChange={setIsAddingMilestone}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Milestone
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Milestone</DialogTitle>
                <DialogDescription>Create a new milestone for this project</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Milestone Title</Label>
                    <Input
                      id="title"
                      value={newMilestone.title}
                      onChange={(e) => setNewMilestone((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Frontend Development"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (₦)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newMilestone.amount}
                      onChange={(e) => setNewMilestone((prev) => ({ ...prev, amount: e.target.value }))}
                      placeholder="50000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newMilestone.description}
                    onChange={(e) => setNewMilestone((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what needs to be delivered for this milestone"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newMilestone.dueDate}
                    onChange={(e) => setNewMilestone((prev) => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Deliverables</Label>
                  {newMilestone.deliverables.map((deliverable, index) => (
                    <Input
                      key={index}
                      value={deliverable}
                      onChange={(e) => {
                        const newDeliverables = [...newMilestone.deliverables]
                        newDeliverables[index] = e.target.value
                        setNewMilestone((prev) => ({ ...prev, deliverables: newDeliverables }))
                      }}
                      placeholder="e.g., Responsive UI components"
                    />
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setNewMilestone((prev) => ({ ...prev, deliverables: [...prev.deliverables, ""] }))}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Deliverable
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingMilestone(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddMilestone} disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Milestone"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-4">
        {milestones.map((milestone) => (
          <Card key={milestone.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{milestone.title}</h4>
                    <Badge className={getStatusColor(milestone.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(milestone.status)}
                        {milestone.status.replace("_", " ")}
                      </div>
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{milestone.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold flex items-center gap-1">
                    <NairaIcon className="h-4 w-4" />
                    {formatNaira(milestone.amount)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Due: {new Date(milestone.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h5 className="font-medium mb-2">Deliverables:</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {milestone.deliverables.map((deliverable, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-current rounded-full"></span>
                      {deliverable}
                    </li>
                  ))}
                </ul>
              </div>

              {milestone.submissions.length > 0 && (
                <div>
                  <h5 className="font-medium mb-2">Submissions:</h5>
                  <div className="space-y-2">
                    {milestone.submissions.map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{submission.fileName}</p>
                            <p className="text-xs text-muted-foreground">
                              Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                            </p>
                            {submission.notes && <p className="text-xs text-muted-foreground">{submission.notes}</p>}
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {milestone.feedback && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <h5 className="font-medium text-red-800 mb-1">Feedback:</h5>
                  <p className="text-sm text-red-700">{milestone.feedback}</p>
                </div>
              )}

              {isClient && milestone.status === "submitted" && (
                <div className="flex gap-2 pt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" onClick={() => setSelectedMilestone(milestone)}>
                        Reject
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reject Milestone</DialogTitle>
                        <DialogDescription>Provide feedback for the freelancer to improve their work</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Explain what needs to be improved..."
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          rows={4}
                        />
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedMilestone(null)}>
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleRejectMilestone(milestone.id)}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Rejecting..." : "Reject & Send Feedback"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button onClick={() => handleApproveMilestone(milestone.id)} disabled={isSubmitting}>
                    {isSubmitting ? "Approving..." : `Approve & Release ${formatNaira(milestone.amount)}`}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
