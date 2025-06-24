"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Bookmark,
  Calendar,
  Clock,
  DollarSign,
  Eye,
  Filter,
  MapPin,
  Search,
  Star,
  Users,
  Briefcase,
  TrendingUp,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { formatCurrency, getStatusColor, generateTaskCode } from "@/lib/api-utils"
import { toast } from "@/hooks/use-toast"

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

const experienceLevels = ["All Levels", "entry", "intermediate", "expert"]
const budgetRanges = ["All Budgets", "Under $500", "$500 - $1,000", "$1,000 - $2,500", "$2,500 - $5,000", "Over $5,000"]

interface Task {
  id: string
  client_id: string
  title: string
  description: string
  category: string
  subcategory: string | null
  skills_required: string[]
  budget_type: "fixed" | "hourly"
  budget_min: number
  budget_max: number
  currency: string
  duration: string
  location: string
  experience_level: string
  urgency: "low" | "normal" | "high"
  status: "draft" | "active" | "in_progress" | "completed" | "cancelled"
  applications_count: number
  views_count: number
  created_at: string
  client?: {
    id: string
    name: string
    rating: number
    location: string
  }
}

export default function BrowseTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedExperience, setSelectedExperience] = useState("All Levels")
  const [selectedBudget, setSelectedBudget] = useState("All Budgets")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState("list")
  const [savedTasks, setSavedTasks] = useState<string[]>([])
  const [debugInfo, setDebugInfo] = useState<any>(null)

  // Fetch tasks from API - only real database data
  const fetchTasks = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) setRefreshing(true)

      console.log("=== FRONTEND: Starting fetch ===")

      // Build query parameters
      const params = new URLSearchParams()

      if (searchTerm) params.append("search", searchTerm)
      if (selectedCategory !== "All Categories") params.append("category", selectedCategory)
      if (selectedExperience !== "All Levels") params.append("experience_level", selectedExperience)
      if (sortBy) params.append("sort_by", sortBy)

      // Add budget filters
      if (selectedBudget !== "All Budgets") {
        switch (selectedBudget) {
          case "Under $500":
            params.append("budget_max", "500")
            break
          case "$500 - $1,000":
            params.append("budget_min", "500")
            params.append("budget_max", "1000")
            break
          case "$1,000 - $2,500":
            params.append("budget_min", "1000")
            params.append("budget_max", "2500")
            break
          case "$2,500 - $5,000":
            params.append("budget_min", "2500")
            params.append("budget_max", "5000")
            break
          case "Over $5,000":
            params.append("budget_min", "5000")
            break
        }
      }

      const apiUrl = `/api/tasks/browse?${params.toString()}`
      console.log("=== FRONTEND: API URL ===", apiUrl)

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      console.log("=== FRONTEND: Response status ===", response.status)
      console.log("=== FRONTEND: Response headers ===", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error("=== FRONTEND: API Error ===", errorText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("=== FRONTEND: Full API Response ===", data)

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch tasks")
      }

      const fetchedTasks = data.tasks || []
      console.log("=== FRONTEND: Tasks received ===", fetchedTasks.length)
      console.log("=== FRONTEND: First task ===", fetchedTasks[0])
      console.log("=== FRONTEND: Debug info ===", data.debug)

      setTasks(fetchedTasks)
      setDebugInfo(data.debug)

      if (showRefreshToast) {
        toast({
          title: "Tasks Updated",
          description: `Found ${fetchedTasks.length} tasks from ${data.debug?.source || "database"}`,
        })
      }
    } catch (error) {
      console.error("=== FRONTEND: Error fetching tasks ===", error)
      toast({
        title: "Database Error",
        description: "Failed to fetch tasks from database. Check console for details.",
        variant: "destructive",
      })
      setTasks([])
      setDebugInfo({ source: "ERROR", error: error.message })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Initial load and when filters change
  useEffect(() => {
    console.log("=== FRONTEND: useEffect triggered ===")
    fetchTasks()
  }, [sortBy, searchTerm, selectedCategory, selectedExperience, selectedBudget])

  const toggleSaveTask = (taskId: string) => {
    setSavedTasks((prev) => (prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]))
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

  // Calculate stats from real tasks only
  const stats = {
    totalTasks: tasks.length,
    avgBudget:
      tasks.length > 0
        ? Math.round(tasks.reduce((sum, task) => sum + (task.budget_min + task.budget_max) / 2, 0) / tasks.length)
        : 0,
    avgApplications:
      tasks.length > 0 ? Math.round(tasks.reduce((sum, task) => sum + task.applications_count, 0) / tasks.length) : 0,
    successRate:
      tasks.length > 0
        ? Math.round((tasks.filter((task) => task.applications_count > 0).length / tasks.length) * 100)
        : 0,
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Browse Tasks</h1>
            <p className="text-muted-foreground">Loading tasks from database...</p>
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

        {/* Loading Tasks */}
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
          <h1 className="text-3xl font-bold">Browse Tasks</h1>
          <p className="text-muted-foreground">
            Find your next project and start earning
            {debugInfo && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Source: {debugInfo.source} | {debugInfo.timestamp}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchTasks(true)} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh DB
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Advanced Filters
          </Button>
          <Button variant="outline" size="sm">
            <TrendingUp className="mr-2 h-4 w-4" />
            Trending
          </Button>
        </div>
      </div>

      {/* Debug Info */}
      {debugInfo && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="text-sm">
              <strong>Debug Info:</strong> Source: {debugInfo.source}, Time: {debugInfo.timestamp}
              {debugInfo.error && <span className="text-red-600 ml-2">Error: {debugInfo.error}</span>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Tasks</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">From {debugInfo?.source || "database"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.avgBudget)}</div>
            <p className="text-xs text-muted-foreground">Per project</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Competition</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgApplications}</div>
            <p className="text-xs text-muted-foreground">avg applications</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.successRate > 0 ? "tasks with applications" : "no applications yet"}
            </p>
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
                    placeholder="Search tasks, skills, or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Experience" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level === "All Levels" ? level : level.charAt(0).toUpperCase() + level.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedBudget} onValueChange={setSelectedBudget}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Budget" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgetRanges.map((range) => (
                      <SelectItem key={range} value={range}>
                        {range}
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
        <p className="text-sm text-muted-foreground">
          Showing {tasks.length} tasks from {debugInfo?.source || "database"}
        </p>
        <Tabs value={viewMode} onValueChange={setViewMode}>
          <TabsList>
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="grid">Grid</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Task List */}
      <div className={viewMode === "grid" ? "grid gap-6 md:grid-cols-2" : "space-y-4"}>
        {tasks.map((task) => (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/browse/${task.id}`} className="hover:underline">
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
                      <DollarSign className="h-4 w-4" />
                      {formatCurrency(task.budget_min)} - {formatCurrency(task.budget_max)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {task.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {task.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {timeAgo(task.created_at)}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSaveTask(task.id)}
                  className={savedTasks.includes(task.id) ? "text-blue-600" : ""}
                >
                  <Bookmark className={`h-4 w-4 ${savedTasks.includes(task.id) ? "fill-current" : ""}`} />
                </Button>
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
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>
                          {task.client?.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "C"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{task.client?.name || "Client"}</span>
                      <Badge variant="outline" className="text-xs">
                        Verified
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{task.client?.rating || "4.8"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {task.applications_count}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {task.views_count}
                      </div>
                    </div>
                    <Button size="sm" asChild>
                      <Link href={`/dashboard/browse/${task.id}`}>View Details</Link>
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
              <p className="text-muted-foreground">
                {debugInfo?.source === "REAL_DATABASE"
                  ? "No tasks in database match your filters"
                  : "No tasks available"}
              </p>
              <div className="mt-4">
                <Button variant="outline" onClick={() => fetchTasks(true)}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Database
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
