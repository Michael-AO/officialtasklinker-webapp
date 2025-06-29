"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarDays, FileText, Users } from "lucide-react"
import { NairaIcon } from "@/components/naira-icon"
import { ProfileCompletionWizard } from "@/components/profile-completion-wizard"
import { SmartTaskMatching } from "@/components/smart-task-matching"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useRealDashboardData } from "@/hooks/use-real-data"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatNairaCompact } from "@/lib/currency"

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { stats, applications, loading } = useRealDashboardData()
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [showAcceptDialog, setShowAcceptDialog] = useState(false)
  const [isAccepting, setIsAccepting] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  const handleViewApplication = (applicationId: string) => {
    router.push(`/dashboard/applications/${applicationId}`)
  }

  const handleAcceptApplication = async (application: any) => {
    setSelectedApplication(application)
    setShowAcceptDialog(true)
  }

  const confirmAcceptApplication = async () => {
    if (!selectedApplication) return

    setIsAccepting(true)
    try {
      // Simulate API call - replace with your actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Application Accepted!",
        description: `${selectedApplication.freelancer?.name}'s application has been accepted. An escrow has been created.`,
      })

      setShowAcceptDialog(false)
      setSelectedApplication(null)

      // Refresh data after accepting
      // You might want to call a refresh function here
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAccepting(false)
    }
  }

  const handleRefreshApplications = () => {
    // Force a page refresh to get latest data
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards - Using real data with original layout */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : (stats as any)?.activeTasks || 0}</div>
            <p className="text-xs text-muted-foreground">
              {((stats as any)?.activeTasks || 0) > 0 ? "Tasks in progress" : "No active tasks"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : (stats as any)?.pendingApplications || 0}</div>
            <p className="text-xs text-muted-foreground">
              {((stats as any)?.pendingApplications || 0) > 0 ? "Pending review" : "No pending applications"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Earnings</CardTitle>
            <NairaIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : formatNairaCompact((stats as any)?.totalEarnings || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {((stats as any)?.completedTasks || 0) > 0
                ? `From ${(stats as any)?.completedTasks} completed tasks`
                : "Complete tasks to earn"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : Math.round((stats as any)?.completionRate || 0)}%</div>
            <p className="text-xs text-muted-foreground">
              {((stats as any)?.completionRate || 0) >= 90
                ? "Excellent rating"
                : ((stats as any)?.completionRate || 0) >= 70
                  ? "Good rating"
                  : ((stats as any)?.completionRate || 0) > 0
                    ? "Keep improving"
                    : "No rating yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Profile Completion - Restored to original position */}
      <ProfileCompletionWizard />

      {/* Two-column grid layout - Original structure restored */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Smart Task Matching */}
        <SmartTaskMatching />

        {/* Recent Applications - Using real data */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>People who applied to your tasks</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefreshApplications}
                disabled={loading}
              >
                {loading ? "Loading..." : "Refresh"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              </div>
            ) : applications.length > 0 ? (
              <>
                {applications.slice(0, 3).map((application: any) => (
                  <div key={application.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={application.freelancer?.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>
                          {application.freelancer?.name
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("") || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{application.freelancer?.name || "Unknown"}</p>
                        <p className="text-sm text-muted-foreground">{application.task?.title || "Task title"}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewApplication(application.id)}>
                        View
                      </Button>
                      <Button size="sm" onClick={() => handleAcceptApplication(application)}>
                        Accept
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/dashboard/applications">View All Applications</Link>
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="font-medium">No recent applications</p>
                <p className="text-sm">Applications will appear here when freelancers apply to your tasks</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Accept Application Dialog - Enhanced with real data */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Application</DialogTitle>
            <DialogDescription>
              Accept this application and start the project with {selectedApplication?.freelancer?.name}.
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedApplication.freelancer?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>
                    {selectedApplication.freelancer?.name
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("") || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">{selectedApplication.freelancer?.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedApplication.freelancer?.title || "Freelancer"}
                  </p>
                  <p className="text-sm">
                    ⭐ {selectedApplication.freelancer?.rating || "New"} •
                    {selectedApplication.freelancer?.completed_jobs || 0} jobs completed
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p>
                  <strong>Task:</strong> {selectedApplication.task?.title}
                </p>
                <p>
                  <strong>Applied:</strong>{" "}
                  {selectedApplication.created_at
                    ? new Date(selectedApplication.created_at).toLocaleDateString()
                    : "Recently"}
                </p>
                {selectedApplication.proposal_text && (
                  <p>
                    <strong>Proposal:</strong> {selectedApplication.proposal_text}
                  </p>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                By accepting this application, an escrow will be created and the freelancer will be notified to start
                work.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAcceptDialog(false)} disabled={isAccepting}>
              Cancel
            </Button>
            <Button onClick={confirmAcceptApplication} disabled={isAccepting}>
              {isAccepting ? "Accepting..." : "Accept & Create Escrow"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
