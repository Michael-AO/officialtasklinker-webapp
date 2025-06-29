"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  Eye,
  Star,
  CheckCircle,
  X,
  MoreHorizontal,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  UserCheck,
  FileText,
  MessageSquare,
  Settings,
} from "lucide-react"
import { NairaIcon } from "@/components/naira-icon"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

interface Application {
  id: string
  task_id: string
  freelancer_id: string
  proposed_amount: number
  cover_letter: string
  status: "pending" | "accepted" | "rejected" | "withdrawn"
  created_at: string
  estimated_duration: string
  task: {
    title: string
    client: {
      full_name: string
      email: string
    }
  }
  freelancer: {
    full_name: string
    email: string
    user_profiles: {
      skills: string[]
      hourly_rate: number
    }[]
  }
}

interface ApplicationStats {
  total: number
  pending: number
  accepted: number
  rejected: number
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
  })
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchApplications()
    fetchStats()
  }, [])

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select(`
        id,
        task_id,
        freelancer_id,
        proposed_budget,
        cover_letter,
        status,
        created_at,
        estimated_duration,
        tasks (
          title,
          client_id,
          users!tasks_client_id_fkey (
            name,
            email
          )
        ),
        users!applications_freelancer_id_fkey (
          name,
          email
        )
      `)
        .order("created_at", { ascending: false })

      if (error) throw error

      const formattedApplications =
        data?.map((app) => ({
          ...app,
          proposed_amount: app.proposed_budget,
          task: {
            title: app.tasks?.title,
            client: {
              full_name: app.tasks?.users?.name || "Unknown Client",
              email: app.tasks?.users?.email || "",
            },
          },
          freelancer: {
            full_name: app.users?.name || "Unknown Freelancer",
            email: app.users?.email || "",
            user_profiles: [],
          },
        })) || []

      setApplications(formattedApplications)
    } catch (error) {
      console.error("Error fetching applications:", error)
      toast({
        title: "Error",
        description: "Failed to fetch applications",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // Get total applications
      const { count: totalApplications } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })

      // Get applications by status
      const { count: pendingApplications } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending")

      const { count: acceptedApplications } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("status", "accepted")

      const { count: rejectedApplications } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("status", "rejected")

      setStats({
        total: totalApplications || 0,
        pending: pendingApplications || 0,
        accepted: acceptedApplications || 0,
        rejected: rejectedApplications || 0,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "accepted":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "withdrawn":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "accepted":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <X className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.task?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.freelancer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.task?.client?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || app.status === statusFilter
    const matchesTab = selectedTab === "all" || app.status === selectedTab

    return matchesSearch && matchesStatus && matchesTab
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading applications...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Task Applications</h1>
          <p className="text-muted-foreground">Manage and monitor all task applications</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              fetchApplications()
              fetchStats()
            }}
          >
            <Filter className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button>Export Applications</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time applications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting decision</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
            <p className="text-xs text-muted-foreground">Successful matches</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Acceptance rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search applications..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="withdrawn">Withdrawn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Applications</TabsTrigger>
          <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="accepted">Accepted ({stats.accepted})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg?height=40&width=40" />
                        <AvatarFallback>
                          {application.freelancer?.full_name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="space-y-3 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{application.task?.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Applied by {application.freelancer?.full_name} • Client:{" "}
                              {application.task?.client?.full_name}
                            </p>
                          </div>
                          <Badge className={getStatusColor(application.status)}>
                            {getStatusIcon(application.status)}
                            <span className="ml-1 capitalize">{application.status}</span>
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Proposed Amount</p>
                            <p className="font-medium">₦{(application.proposed_amount / 100).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Duration</p>
                            <p className="font-medium">{application.estimated_duration || "Not specified"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Applied</p>
                            <p className="font-medium">{new Date(application.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium">Cover Letter:</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">{application.cover_letter}</p>
                        </div>

                        {application.freelancer?.user_profiles?.[0]?.skills && (
                          <div className="flex flex-wrap gap-2">
                            {application.freelancer.user_profiles[0].skills.map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Applied {new Date(application.created_at).toLocaleDateString()}</span>
                      <NairaIcon className="h-4 w-4 ml-4" />
                      <span>₦{(application.proposed_amount / 100).toLocaleString()}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Contact
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredApplications.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Applications Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "No applications match the current tab selection."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
