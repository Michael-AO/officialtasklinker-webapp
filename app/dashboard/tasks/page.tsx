"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Calendar,
  Clock,
  Eye,
  MapPin,
  Plus,
  Search,
  Users,
  Briefcase,
  TrendingUp,
  RefreshCw,
  MoreHorizontal,
} from "lucide-react"
import { NairaIcon } from "@/components/naira-icon"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { formatNaira } from "@/lib/currency"
import { formatDate, getStatusColor, generateTaskCode } from "@/lib/api-utils"
import { toast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const categories = [
  "All Categories",
  "Web Development",
  "Mobile Development",
  "Design",
  "Writing",
  "Programming",
  "Marketing",
  "Data Science",
  "DevOps",
  "AI/ML",
]

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
]

interface Task {
  id: string
  title: string
  description: string
  category: string
  skills_required: string[]
  budget_type: "fixed" | "hourly"
  budget_min: number
  budget_max: number
  currency: string
  status: "draft" | "active" | "in_progress" | "completed" | "cancelled"
  applications_count: number
  views_count: number
  created_at: string
  updated_at: string
  deadline?: string
  urgency: "low" | "normal" | "high"
  location: string
}

export default function MyTasksPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  useEffect(() => {
    if (user) {
      fetchMyTasks()
    }
  }, [user, searchTerm, selectedCategory, selectedStatus, sortBy])

  const fetchMyTasks = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) setRefreshing(true)

      const params = new URLSearchParams()
      params.append("user_id", user?.id || "")

      if (searchTerm) params.append("search", searchTerm)
      if (selectedCategory !== "all") params.append("category", selectedCategory)
      if (selectedStatus !== "all") params.append("status", selectedStatus)

      const response = await fetch(`/api/tasks/my-tasks?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch tasks")
      }

      setTasks(data.tasks || [])

      if (showRefreshToast) {
        toast({
          title: "Tasks Updated",
          description: `Found ${data.tasks?.length || 0} tasks`,
        })
      }
    } catch (error) {
      console.error("Error fetching my tasks:", error)
      toast({
        title: "Error",
        description: "Failed to fetch your tasks. Please try again.",
        variant: "destructive",
      })
      setTasks([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const timeAgo = (date: string) => {
    const now = new Date()
    const posted = new Date(date)
    const diffInHours = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 24) {
      return `${diffInHours} hours ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays} days ago`
    }
  }

  // Calculate stats from tasks
  const stats = {
    totalTasks: tasks.length,
    activeTasks: tasks.filter((task) => task.status === "active").length,
    inProgressTasks: tasks.filter((task) => task.status === "in_progress").length,
    completedTasks: tasks.filter((task) => task.status === "completed").length,
    totalApplications: tasks.reduce((sum, task) => sum + task.applications_count, 0),
    avgBudget:
      tasks.length > 0
        ? Math.round(tasks.reduce((sum, task) => sum + (task.budget_min + task.budget_max) / 2, 0) / tasks.length)
        : 0,
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Authentication Required</h3>
          <p className="text-muted-foreground">Please log in to view your tasks</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Tasks</h1>
            <p className="text-muted-foreground">Loading your tasks...</p>
          </div>
        </div>

        {/* Loading Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Tasks</h1>
          <p className="text-muted-foreground">Manage and track your posted tasks</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchMyTasks(true)} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/dashboard/tasks/new">
              <Plus className="mr-2 h-4 w-4" />
              Post New Task
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTasks}</div>
            <p className="text-xs text-muted-foreground">Currently open</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
            <p className="text-xs text-muted-foreground">From freelancers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Budget</CardTitle>
            <NairaIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNaira(stats.avgBudget)}</div>
            <p className="text-xs text-muted-foreground">Per task</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search your tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.slice(1).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="budget_high">Budget: High to Low</SelectItem>
                    <SelectItem value="budget_low">Budget: Low to High</SelectItem>
                    <SelectItem value="applications">Most Applications</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Showing {tasks.length} tasks</p>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/tasks/${task.id}`} className="hover:underline">
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                    </Link>
                    <Badge variant="outline" className="text-xs">
                      {generateTaskCode(task.id)}
                    </Badge>
                    {task.urgency === "high" && <Badge variant="destructive">Urgent</Badge>}
                    <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <NairaIcon className="h-4 w-4" />
                      {formatNaira(task.budget_min)} - {formatNaira(task.budget_max)}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {task.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Created {timeAgo(task.created_at)}
                    </div>
                    {task.deadline && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Deadline: {formatDate(task.deadline)}
                      </div>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/tasks/${task.id}`}>View Details</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/tasks/${task.id}/applications`}>View Applications</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Edit Task</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Delete Task</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>

                <div className="flex flex-wrap gap-2">
                  {task.skills_required?.slice(0, 4).map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                  {(task.skills_required?.length || 0) > 4 && (
                    <Badge variant="outline">+{(task.skills_required?.length || 0) - 4} more</Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {task.applications_count} applications
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {task.views_count} views
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Updated {timeAgo(task.updated_at)}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/tasks/${task.id}/applications`}>
                        Applications ({task.applications_count})
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href={`/dashboard/tasks/${task.id}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {tasks.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold">No tasks found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedCategory !== "all" || selectedStatus !== "all"
                  ? "Try adjusting your filters"
                  : "You haven't posted any tasks yet"}
              </p>
              <Button asChild>
                <Link href="/dashboard/tasks/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Post Your First Task
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
