"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarDays, FileText, Users, Shield, CheckCircle, User, AlertTriangle } from "lucide-react"
import { NairaIcon } from "@/components/naira-icon"
import { ProfileCompletionWizard } from "@/components/profile-completion-wizard"
import { SmartTaskMatching } from "@/components/smart-task-matching"
import { useDojahModal } from "@/contexts/dojah-modal-context"
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
import { Progress } from "@/components/ui/progress"

export default function DashboardPage() {
  const { user, isLoading, updateProfile } = useAuth()
  const router = useRouter()
  const { stats, applications, loading } = useRealDashboardData()
  const { openDojahModal, setVerificationType, setOnSuccess, setOnError } = useDojahModal()
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [showAcceptDialog, setShowAcceptDialog] = useState(false)
  const [isAccepting, setIsAccepting] = useState(false)

  // Filter applications to only show ones the current user has sent (as freelancer)
  const myApplications = (applications as any[]).filter(app => app.freelancer_id === user?.id)
  
  // Debug logging
  console.log("🔍 Dashboard Debug:", {
    userId: user?.id,
    userIdType: typeof user?.id,
    userIdLength: user?.id?.length,
    applicationsCount: applications.length,
    myApplicationsCount: myApplications.length,
    firstApplication: applications[0],
    userType: user?.userType,
    applications: applications
  })

  useEffect(() => {
    // Only redirect if we're not loading and there's definitely no user
    if (!isLoading && user === null) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Show loading state while authentication is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  // Show loading state if no user (this will only show briefly before redirect)
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

  // Calculate profile completion
  const calculateProfileCompletion = () => {
    if (!user) return 0
    
    let completed = 0
    const total = 3
    if (user.bio && user.bio.trim()) completed++
    if (user.skills && user.skills.length > 0) completed++
    if (user.location && user.location.trim()) completed++
    return Math.round((completed / total) * 100)
  }

  const profileCompletion = calculateProfileCompletion()
  const isProfileIncomplete = profileCompletion < 100

  // Calculate verification status
  const isFullyVerified = user.isVerified && user.dojahVerified
  const needsEmailVerification = !user.isVerified
  const needsIDVerification = user.isVerified && !user.dojahVerified

  // Handle verification success
  const handleVerificationSuccess = async (result: any) => {
    try {
      console.log("🎯 [DASHBOARD] Verification success handler called with result:", result)
      console.log("🎯 [DASHBOARD] User before update:", {
        id: user?.id,
        isVerified: user?.isVerified,
        dojahVerified: user?.dojahVerified,
        verification_type: user?.verification_type
      })
      
      // Determine verification type from Dojah result
      let verificationType = "individual"
      if (result?.data?.verification_type === "business" || result?.data?.type === "business") {
        verificationType = "business"
      }
      
      console.log("🎯 [DASHBOARD] Determined verification type:", verificationType)
      console.log("🎯 [DASHBOARD] Calling updateProfile with:", {
        isVerified: true,
        dojahVerified: true,
        verification_type: verificationType
      })
      
      await updateProfile({ 
        isVerified: true, 
        dojahVerified: true,
        verification_type: verificationType 
      } as any)
      
      console.log("✅ [DASHBOARD] Profile updated successfully")
      
      toast({
        title: "ID Verified! 🎉",
        description: `Your identity has been verified as a ${verificationType}. You can now access all platform features.`,
      })
      
      // Refresh the page to update the verification status
      console.log("🔄 [DASHBOARD] Refreshing page to update verification status")
      window.location.reload()
      
    } catch (error) {
      console.error("❌ [DASHBOARD] Verification update failed:", error)
      toast({
        title: "Verification Update Failed",
        description: "Verification was successful but failed to update your profile. Please contact support.",
        variant: "destructive",
      })
    }
  }

  // Handle verification error
  const handleVerificationError = (error: any) => {
    console.error("❌ [DASHBOARD] Verification error handler called with:", error)
    toast({
      title: "Verification Failed",
      description: "Something went wrong during verification. Please try again.",
      variant: "destructive",
    })
  }

  // Handle starting ID verification
  const handleStartIDVerification = () => {
    console.log("🚀 [DASHBOARD] Starting ID verification...")
    console.log("🚀 [DASHBOARD] User details:", {
      id: user?.id,
      userType: user?.userType,
      isVerified: user?.isVerified,
      dojahVerified: user?.dojahVerified
    })
    
    // Set up the verification type and callbacks
    const verificationType = "identity" // Always use individual ID verification
    console.log("🚀 [DASHBOARD] Setting verification type to:", verificationType)
    setVerificationType(verificationType)
    
    console.log("🚀 [DASHBOARD] Setting success callback:", handleVerificationSuccess.name)
    setOnSuccess(handleVerificationSuccess)
    
    console.log("🚀 [DASHBOARD] Setting error callback:", handleVerificationError.name)
    setOnError(handleVerificationError)
    
    // Open the modal
    console.log("🚀 [DASHBOARD] Opening Dojah modal...")
    openDojahModal()
    
    console.log("🚀 [DASHBOARD] ID verification setup complete")
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

      {/* Profile Completion and Verification Summary Cards - Side by Side */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Completion Card */}
        <Card className={isProfileIncomplete ? "border-gray-200 bg-gray-50" : "border-green-200 bg-green-50"}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${isProfileIncomplete ? "bg-gray-100" : "bg-green-100"}`}>
                  {isProfileIncomplete ? (
                    <User className={`h-5 w-5 ${isProfileIncomplete ? "text-gray-600" : "text-green-600"}`} />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <div>
                  <CardTitle className={isProfileIncomplete ? "text-gray-900" : "text-green-800"}>
                    Profile Completion
                  </CardTitle>
                  <CardDescription className={isProfileIncomplete ? "text-gray-600" : "text-green-700"}>
                    {isProfileIncomplete 
                      ? "Complete your profile to unlock all features"
                      : "Your profile is complete and ready to go!"
                    }
                  </CardDescription>
                </div>
              </div>
              <div className={`text-xs px-2 py-1 rounded-full ${
                isProfileIncomplete 
                  ? "bg-gray-100 text-gray-800" 
                  : "bg-green-100 text-green-800"
              }`}>
                {profileCompletion}%
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={profileCompletion} className="h-2" />
            
            {isProfileIncomplete ? (
              <div className="space-y-3">
                <div className="text-sm text-gray-700">
                  <p className="mb-2">Complete these sections to finish your profile:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    {!user.bio?.trim() && <li>Add your bio</li>}
                    {(!user.skills || user.skills.length === 0) && <li>Add your skills</li>}
                    {!user.location?.trim() && <li>Set your location</li>}
                  </ul>
                </div>
                
                <Button asChild className="w-full">
                  <Link href="/dashboard/profile">
                    Complete Profile
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-sm text-green-700">
                <p>✅ All profile sections are complete!</p>
                <p className="text-xs mt-1">Your profile is fully set up and ready to attract clients.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Verification Status Card */}
        <Card className={isFullyVerified ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${isFullyVerified ? "bg-green-100" : "bg-gray-100"}`}>
                  {isFullyVerified ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Shield className="h-5 w-5 text-gray-600" />
                  )}
                </div>
                <div>
                  <CardTitle className={isFullyVerified ? "text-green-800" : "text-gray-900"}>
                    Verification Status
                  </CardTitle>
                  <CardDescription className={isFullyVerified ? "text-green-700" : "text-gray-600"}>
                    {isFullyVerified 
                      ? "Your account is fully verified"
                      : needsEmailVerification
                        ? "Email verification required"
                        : "ID verification required"
                    }
                  </CardDescription>
                </div>
              </div>
              <div className={`text-xs px-2 py-1 rounded-full ${
                isFullyVerified 
                  ? "bg-green-100 text-green-800" 
                  : "bg-gray-100 text-gray-800"
              }`}>
                {isFullyVerified ? "Verified" : needsEmailVerification ? "Step 1/2" : "Step 2/2"}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isFullyVerified ? (
              <div className="text-sm text-green-700">
                <p>✅ Your account is fully verified!</p>
                <p className="text-xs mt-1">You have access to all platform features.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-gray-700">
                  <p className="mb-2">
                    {needsEmailVerification 
                      ? "Verify your email to unlock platform features"
                      : "Complete ID verification to access all features"
                    }
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    {needsEmailVerification ? (
                      <>
                        <li>Post tasks (clients)</li>
                        <li>Apply to tasks (freelancers)</li>
                        <li>Access full platform features</li>
                      </>
                    ) : (
                      <>
                        <li>Task posting (clients)</li>
                        <li>Task applications (freelancers)</li>
                        <li>All platform features</li>
                      </>
                    )}
                  </ul>
                </div>
                
                <div className="flex gap-2">
                  {needsEmailVerification ? (
                    <Button asChild className="flex-1">
                      <Link href="/verify-email">
                        📧 Verify Email
                      </Link>
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleStartIDVerification}
                      className="flex-1"
                    >
                      🆔 Complete ID Verification
                    </Button>
                  )}
                </div>
                
                {/* Debug Test Button */}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    console.log("🧪 [DEBUG] Test button clicked")
                    console.log("🧪 [DEBUG] Current context state:", {
                      isDojahModalOpen: false, // This will be updated by context
                      verificationType: user?.userType === "client" ? "business" : "identity",
                      userType: user?.userType,
                      isVerified: user?.isVerified,
                      dojahVerified: user?.dojahVerified
                    })
                    
                    // Test opening modal directly
                    setVerificationType(user?.userType === "client" ? "business" : "identity")
                    setOnSuccess((result) => {
                      console.log("🧪 [DEBUG] Test success callback triggered:", result)
                      toast({
                        title: "Test Success!",
                        description: "Modal test callback working correctly",
                      })
                    })
                    setOnError((error) => {
                      console.log("🧪 [DEBUG] Test error callback triggered:", error)
                      toast({
                        title: "Test Error!",
                        description: "Modal test error callback working correctly",
                        variant: "destructive",
                      })
                    })
                    
                    console.log("🧪 [DEBUG] Opening test modal...")
                    openDojahModal()
                  }}
                  className="w-full"
                >
                  🧪 Test Modal (Debug)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Profile Completion Wizard - Only show if profile is incomplete */}
      {isProfileIncomplete && (
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>
              Finish your profile to unlock all features and improve your chances of getting hired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileCompletionWizard />
          </CardContent>
        </Card>
      )}

      {/* Two-column grid layout - Original structure */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Smart Task Matching */}
        <SmartTaskMatching />

        {/* Recent Applications - Using real data */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>Tasks you've applied to</CardDescription>
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
            ) : myApplications.length > 0 ? (
              <>
                {myApplications.slice(0, 3).map((application: any) => (
                  <div key={application.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{application.task?.title || "Task title"}</p>
                      <p className="text-sm text-muted-foreground">
                        {application.task?.client?.name || "Client"} • {application.status}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewApplication(application.id)}>
                        View
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
                <p className="font-medium">No applications yet</p>
                <p className="text-sm">Start applying to tasks to see your applications here</p>
                <Button asChild className="mt-2">
                  <Link href="/dashboard/browse">Browse Tasks</Link>
                </Button>
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
                  <AvatarImage src={selectedApplication.freelancer?.avatar_url} />
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
