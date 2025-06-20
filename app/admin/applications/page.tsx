"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  Star,
  Search,
  Filter,
  Calendar,
  DollarSign,
} from "lucide-react"

interface Application {
  id: string
  taskId: string
  taskTitle: string
  freelancerId: string
  freelancerName: string
  freelancerRating: number
  clientId: string
  clientName: string
  proposedAmount: number
  coverLetter: string
  status: "pending" | "accepted" | "rejected" | "withdrawn"
  appliedDate: string
  skills: string[]
  estimatedDuration: string
}

export default function AdminApplicationsPage() {
  const [selectedTab, setSelectedTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const applications: Application[] = [
    {
      id: "app_001",
      taskId: "task_001",
      taskTitle: "E-commerce Website Development",
      freelancerId: "freelancer_001",
      freelancerName: "John Doe",
      freelancerRating: 4.8,
      clientId: "client_001",
      clientName: "Sarah Johnson",
      proposedAmount: 250000, // ₦2,500
      coverLetter:
        "I have 5+ years of experience in e-commerce development with React and Node.js. I've built similar platforms for 10+ clients with excellent results.",
      status: "pending",
      appliedDate: "2024-12-13T10:30:00Z",
      skills: ["React", "Node.js", "MongoDB", "Stripe"],
      estimatedDuration: "3 weeks",
    },
    {
      id: "app_002",
      taskId: "task_002",
      taskTitle: "Mobile App UI/UX Design",
      freelancerId: "freelancer_002",
      freelancerName: "Lisa Wang",
      freelancerRating: 4.9,
      clientId: "client_002",
      clientName: "Mike Chen",
      proposedAmount: 120000, // ₦1,200
      coverLetter:
        "I specialize in mobile app design with a focus on user experience. My designs have helped increase user engagement by 40% on average.",
      status: "accepted",
      appliedDate: "2024-12-12T14:20:00Z",
      skills: ["Figma", "Adobe XD", "Prototyping", "User Research"],
      estimatedDuration: "2 weeks",
    },
    {
      id: "app_003",
      taskId: "task_003",
      taskTitle: "Content Writing for Tech Blog",
      freelancerId: "freelancer_003",
      freelancerName: "David Smith",
      freelancerRating: 4.6,
      clientId: "client_003",
      clientName: "TechCorp Inc.",
      proposedAmount: 75000, // ₦750
      coverLetter:
        "I'm a technical writer with expertise in AI and blockchain. I've written 100+ articles for major tech publications.",
      status: "rejected",
      appliedDate: "2024-12-11T09:15:00Z",
      skills: ["Technical Writing", "SEO", "Research", "AI"],
      estimatedDuration: "1 week",
    },
    {
      id: "app_004",
      taskId: "task_004",
      taskTitle: "Social Media Marketing Campaign",
      freelancerId: "freelancer_004",
      freelancerName: "Emma Wilson",
      freelancerRating: 4.7,
      clientId: "client_004",
      clientName: "StartupXYZ",
      proposedAmount: 180000, // ₦1,800
      coverLetter:
        "I've managed social media campaigns for 50+ brands, achieving an average of 300% increase in engagement and 150% growth in followers.",
      status: "pending",
      appliedDate: "2024-12-13T16:45:00Z",
      skills: ["Social Media", "Content Strategy", "Analytics", "Advertising"],
      estimatedDuration: "4 weeks",
    },
  ]

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
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.taskTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.freelancerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || app.status === statusFilter
    const matchesTab = selectedTab === "all" || app.status === selectedTab

    return matchesSearch && matchesStatus && matchesTab
  })

  const stats = {
    total: applications.length,
    pending: applications.filter((app) => app.status === "pending").length,
    accepted: applications.filter((app) => app.status === "accepted").length,
    rejected: applications.filter((app) => app.status === "rejected").length,
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Task Applications</h1>
          <p className="text-muted-foreground">Manage and monitor all task applications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
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
                          {application.freelancerName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="space-y-3 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{application.taskTitle}</h3>
                            <p className="text-sm text-muted-foreground">
                              Applied by {application.freelancerName} • Client: {application.clientName}
                            </p>
                          </div>
                          <Badge className={getStatusColor(application.status)}>
                            {getStatusIcon(application.status)}
                            <span className="ml-1 capitalize">{application.status}</span>
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Proposed Amount</p>
                            <p className="font-medium">₦{(application.proposedAmount / 100).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Rating</p>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{application.freelancerRating}</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Duration</p>
                            <p className="font-medium">{application.estimatedDuration}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Applied</p>
                            <p className="font-medium">{new Date(application.appliedDate).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium">Cover Letter:</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">{application.coverLetter}</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {application.skills.map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Applied {new Date(application.appliedDate).toLocaleDateString()}</span>
                      <DollarSign className="h-4 w-4 ml-4" />
                      <span>₦{(application.proposedAmount / 100).toLocaleString()}</span>
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
                      {application.status === "pending" && (
                        <>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            Reject
                          </Button>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Accept
                          </Button>
                        </>
                      )}
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
