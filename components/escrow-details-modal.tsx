"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, DollarSign, Calendar, MessageSquare, Download, AlertTriangle } from "lucide-react"
import { useEscrow } from "@/contexts/escrow-context"

interface EscrowDetailsModalProps {
  escrowId: string
  isOpen: boolean
  onClose: () => void
}

export function EscrowDetailsModal({ escrowId, isOpen, onClose }: EscrowDetailsModalProps) {
  const { getEscrowById, releaseFunds } = useEscrow()
  const [isReleasing, setIsReleasing] = useState(false)

  const escrow = getEscrowById(escrowId)

  if (!escrow) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "approved":
        return "bg-blue-100 text-blue-800"
      case "disputed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const calculateProgress = () => {
    if (!escrow.milestones || escrow.milestones.length === 0) return 0
    const completed = escrow.milestones.filter((m) => m.status === "completed" || m.status === "approved").length
    return (completed / escrow.milestones.length) * 100
  }

  const handleReleaseMilestone = async (milestoneId: string) => {
    setIsReleasing(true)
    try {
      await releaseFunds(escrowId, milestoneId)
    } catch (error) {
      console.error("Failed to release milestone funds:", error)
    } finally {
      setIsReleasing(false)
    }
  }

  const handleReleaseAll = async () => {
    setIsReleasing(true)
    try {
      await releaseFunds(escrowId)
    } catch (error) {
      console.error("Failed to release funds:", error)
    } finally {
      setIsReleasing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{escrow.taskTitle}</DialogTitle>
          <DialogDescription>Escrow ID: {escrow.id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-xl font-bold">₦{(escrow.amount / 100).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={getStatusColor(escrow.status)}>{escrow.status.replace("_", " ")}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-medium">{new Date(escrow.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              {escrow.milestones && escrow.milestones.length > 0 && (
                <TabsTrigger value="milestones">Milestones</TabsTrigger>
              )}
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Client</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg?height=40&width=40" />
                        <AvatarFallback>
                          {escrow.clientName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{escrow.clientName}</p>
                        <p className="text-sm text-muted-foreground">Project Owner</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Freelancer Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Freelancer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg?height=40&width=40" />
                        <AvatarFallback>
                          {escrow.freelancerName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{escrow.freelancerName}</p>
                        <p className="text-sm text-muted-foreground">Service Provider</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Payment Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Reference:</span>
                    <span className="font-mono text-sm">{escrow.paymentReference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Currency:</span>
                    <span>{escrow.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{new Date(escrow.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span>{new Date(escrow.updatedAt).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message Client
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Receipt
                </Button>
                {escrow.status === "completed" && (
                  <Button onClick={handleReleaseAll} disabled={isReleasing}>
                    {isReleasing ? "Releasing..." : "Release All Funds"}
                  </Button>
                )}
              </div>
            </TabsContent>

            {escrow.milestones && escrow.milestones.length > 0 && (
              <TabsContent value="milestones" className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Project Progress</h3>
                    <span className="text-sm text-muted-foreground">
                      {escrow.milestones.filter((m) => m.status === "completed" || m.status === "approved").length} of{" "}
                      {escrow.milestones.length} completed
                    </span>
                  </div>
                  <Progress value={calculateProgress()} className="h-2" />
                </div>

                <div className="space-y-4">
                  {escrow.milestones.map((milestone, index) => (
                    <Card key={milestone.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{milestone.title}</h4>
                              <Badge className={getStatusColor(milestone.status)}>{milestone.status}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{milestone.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />₦{(milestone.amount / 100).toLocaleString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Due: {new Date(milestone.dueDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {milestone.status === "completed" && (
                              <Button
                                size="sm"
                                onClick={() => handleReleaseMilestone(milestone.id)}
                                disabled={isReleasing}
                              >
                                {isReleasing ? "Releasing..." : "Approve & Release"}
                              </Button>
                            )}
                            {milestone.status === "pending" && (
                              <Button variant="outline" size="sm">
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                Follow Up
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            )}

            <TabsContent value="activity" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Escrow funded successfully</p>
                    <p className="text-xs text-muted-foreground">{new Date(escrow.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Freelancer assigned to project</p>
                    <p className="text-xs text-muted-foreground">{new Date(escrow.updatedAt).toLocaleString()}</p>
                  </div>
                </div>

                {escrow.milestones
                  ?.filter((m) => m.completedAt)
                  .map((milestone) => (
                    <div key={milestone.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Milestone completed: {milestone.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {milestone.completedAt && new Date(milestone.completedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
