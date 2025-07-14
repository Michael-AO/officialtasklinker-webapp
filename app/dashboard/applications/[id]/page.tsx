"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { VerifiedBadge } from "@/components/ui/verified-badge"
import { isVerifiedEmail } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { formatNaira } from "@/lib/currency"
import { ProgressTracking } from "@/components/progress-tracking"
import {
  ArrowLeft,
  Clock,
  Eye,
  EyeOff,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Calendar,
  MapPin,
  DollarSign,
  FileText,
  Star,
  TrendingUp,
  Briefcase,
} from "lucide-react"
import Link from "next/link"

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  interviewing: "bg-blue-100 text-blue-800",
  withdrawn: "bg-gray-100 text-gray-800",
}

const statusIcons = {
  pending: <Clock className="h-4 w-4" />,
  accepted: <CheckCircle2 className="h-4 w-4" />,
  rejected: <XCircle className="h-4 w-4" />,
  interviewing: <MessageSquare className="h-4 w-4" />,
  withdrawn: <User className="h-4 w-4" />,
}

const statusDescriptions = {
  pending: "Your application is under review by the client",
  accepted: "Congratulations! Your application has been accepted",
  rejected: "Your application was not selected for this project",
  interviewing: "The client wants to discuss the project with you",
  withdrawn: "You withdrew your application for this project",
}

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [application, setApplication] = useState<any>(null)
  const [task, setTask] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const applicationId = params.id as string

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      if (!user?.id || !applicationId) return

      setLoading(true)
      try {
        // Fetch application details
        const response = await fetch(`/api/applications/${applicationId}`, {
          headers: {
            "x-user-id": user.id,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch application details")
        }

        const data = await response.json()
        if (data.success) {
          setApplication(data.application)
          setTask(data.task)
        } else {
          throw new Error(data.error || "Failed to load application")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchApplicationDetails()
  }, [user?.id, applicationId])

  const handleWithdrawApplication = async () => {
    if (!application || application.status !== "pending") return

    if (!confirm("Are you sure you want to withdraw your application? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/applications/${applicationId}/withdraw`, {
        method: "POST",
        headers: {
          "x-user-id": user?.id || "",
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setApplication((prev: any) => ({ ...prev, status: "withdrawn" }))
        }
      }
    } catch (err) {
      console.error("Failed to withdraw application:", err)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 24) {
      return `${diffInHours} hours ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays} days ago`
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !application) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-600">Application Not Found</h3>
              <p className="text-muted-foreground mt-2">
                {error || "The application you're looking for doesn't exist or you don't have permission to view it."}
              </p>
              <Button asChild className="mt-4">
                <Link href="/dashboard/applications">Back to Applications</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Application Details</h1>
          <p className="text-muted-foreground">
            Applied {formatTimeAgo(application.created_at)}
          </p>
        </div>
      </div>

      {/* Status Banner */}
      <Card className={`border-l-4 border-l-${application.status === 'accepted' ? 'green' : application.status === 'rejected' ? 'red' : 'yellow'}-500`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {statusIcons[application.status as keyof typeof statusIcons]}
              <div>
                <h3 className="font-semibold capitalize">{application.status}</h3>
                <p className="text-sm text-muted-foreground">
                  {statusDescriptions[application.status as keyof typeof statusDescriptions]}
                </p>
              </div>
            </div>
            <Badge className={statusColors[application.status as keyof typeof statusColors]}>
              {application.status.toUpperCase()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Project Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Project Details</CardTitle>
              {task?.client?.is_verified && <VerifiedBadge />}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{task?.title}</h3>
              <p className="text-muted-foreground">{task?.description}</p>
            </div>

            <div className="grid gap-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{formatNaira(task?.budget || 0)}</span>
                <span className="text-sm text-muted-foreground">
                  {task?.budget_type === 'fixed' ? 'Fixed Price' : 'Hourly Rate'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Posted {formatTimeAgo(task?.created_at)}
                </span>
              </div>

              {task?.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{task.location}</span>
                </div>
              )}

              {task?.category && (
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline">{task.category}</Badge>
                </div>
              )}
            </div>

            {/* Client Information */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Client Information</h4>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                                          <AvatarImage src={task?.client?.avatar_url} />
                  <AvatarFallback>
                    {task?.client?.name?.split(" ").map((n: string) => n[0]).join("") || "C"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{task?.client?.name}</span>
                    {task?.client?.is_verified && <VerifiedBadge />}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>⭐ {task?.client?.rating || "New"}</span>
                    <span>{task?.client?.completed_tasks || 0} projects completed</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Details */}
        <Card>
          <CardHeader>
            <CardTitle>Your Application</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Proposed Budget</h4>
              <p className="text-lg font-medium">{formatNaira(application.proposed_budget || 0)}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Cover Letter</h4>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm">{application.cover_letter || "No cover letter provided"}</p>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Applied {formatTimeAgo(application.created_at)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {application.viewed_by_client ? (
                  <>
                    <Eye className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">Viewed by client</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Not viewed yet</span>
                  </>
                )}
              </div>

              {application.viewed_at && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Viewed {formatTimeAgo(application.viewed_at)}
                  </span>
                </div>
              )}
            </div>

            {/* Progress Tracking for accepted applications */}
            {application.status === "accepted" && (
              <div className="border-t pt-4">
                <ProgressTracking
                  applicationId={application.id}
                  freelancerEmail={user?.email || ""}
                  freelancerName={user?.name || ""}
                  taskTitle={task?.title || "Task"}
                  isClient={false}
                />
              </div>
            )}

            {/* Actions */}
            <div className="border-t pt-4 space-y-2">
              {application.status === "pending" && (
                <Button 
                  variant="outline" 
                  onClick={handleWithdrawApplication}
                  className="w-full"
                >
                  Withdraw Application
                </Button>
              )}

              {application.status === "accepted" && (
                <Button asChild className="w-full">
                  <Link href={`/dashboard/tasks/${task?.id}`}>
                    View Project
                  </Link>
                </Button>
              )}

              <Button variant="outline" asChild className="w-full">
                <Link href="/dashboard/applications">
                  Back to Applications
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
