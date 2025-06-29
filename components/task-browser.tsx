"use client"

import { useState, useEffect } from "react"
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
import { NairaIcon } from "@/components/naira-icon"

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
const budgetRanges = ["All Budgets", "Under ₦50,000", "₦50,000 - ₦100,000", "₦100,000 - ₦250,000", "₦250,000 - ₦500,000", "Over ₦500,000"]

interface Task {
  id: string
  client_id: string
  title: string
  description: string
  category: string
  subcategory?: string
  skills_required: string[]
  budget_type: "fixed" | "hourly"
  budget_min: number
  budget_max: number
  currency: string
  duration: string
  location: string
  experience_level: string
  urgency: "low" | "normal" | "high"
  status: string
  applications_count: number
  views_count: number
  created_at: string
  client: {
    id: string
    name: string
    rating: number
    location: string
  }
}

export default function BrowseTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedExperience, setSelectedExperience] = useState("All Levels")
  const [selectedBudget, setSelectedBudget] = useState("All Budgets")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState("list")
  const [savedTasks, setSavedTasks] = useState<string[]>([])

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const fetchTasks = async (showRefreshing = false, page = 1) => {
    try {
      if (showRefreshing) setRefreshing(true)
      else if (page === 1) setLoading(true)

      setError(null)

      const params = new URLSearchParams()

      // Add filters
      if (selectedCategory !== "All Categories") params.append("category", selectedCategory)
      if (searchTerm) params.append("search", searchTerm)
      if (selectedExperience !== "All Levels") params.append("experience", selectedExperience)

      // Map budget ranges to min/max values
      if (selectedBudget !== "All Budgets") {
        switch (selectedBudget) {
          case "Under ₦50,000":
            params.append("budget_max", "50000")
            break
          case "₦50,000 - ₦100,000":
            params.append("budget_min", "50000")
            params.append("budget_max", "100000")
            break
          case "₦100,000 - ₦250,000":
            params.append("budget_min", "100000")
            params.append("budget_max", "250000")
            break
          case "₦250,000 - ₦500,000":
            params.append("budget_min", "250000")
            params.append("budget_max", "500000")
            break
          case "Over ₦500,000":
            params.append("budget_min", "500000")
            break
        }
      }

      params.append("sort", sortBy)
      params.append("page", page.toString())
      params.append("limit", "10")

      console.log("Fetching tasks with params:", params.toString())

      const response = await fetch(`/api/tasks?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch tasks`)
      }

      const data = await response.json()

      if (data.success) {
        if (page === 1) {
          setTasks(data.tasks)
        } else {
          setTasks((prev) => [...prev, ...data.tasks])
        }

        setCurrentPage(page)
        setTotalPages(data.pagination?.pages || 1)
        setHasMore(data.pagination?.hasNext || false)

        console.log("Tasks loaded:", data.tasks.length, "Total pages:", data.pagination?.pages)
      } else {
        throw new Error(data.error || "Failed to fetch tasks")
      }
    } catch (err) {
      console.error("Error fetching tasks:", err)
      setError(err instanceof Error ? err.message : "Failed to load tasks")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchTasks()
  }, [])

  // Refetch when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1)
      fetchTasks(false, 1)
    }, 500) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedCategory, selectedExperience, selectedBudget, sortBy])

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchTasks(false, currentPage + 1)
    }
  }

  const toggleSaveTask = (taskId: string) => {
    setSavedTasks((prev) => (prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]))
  }

  const timeAgo = (date: string) => {
    const now = new Date()
    const posted = new Date(date)
    const diffInHours = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours} hours ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} days ago`

    const diffInWeeks = Math.floor(diffInDays / 7)
    return `${diffInWeeks} weeks ago`
  }

  // Calculate stats from tasks
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
        : 0, // Calculate based on tasks with applications vs total tasks
  }

  // Add this after the stats calculation for debugging
  console.log("Browse page debug:", {
    tasksLoaded: tasks.length,
    loading,
    error,
    stats,
    firstTask: tasks[0]
      ? {
          id: tasks[0].id,
          title: tasks[0].title,
          source: "database",
        }
      : null,
  })

  if (loading && tasks.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-6 w-24" />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-20 mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-18" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error && tasks.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold text-red-600">Error Loading Tasks</h3>
              <p className="text-gray-600">{error}</p>
              <Button onClick={() => fetchTasks()} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Browse Tasks</h1>
          <p className="text-muted-foreground">Find your next project and start earning</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchTasks(true)} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
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

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Tasks</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">Active opportunities</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Budget</CardTitle>
            <NairaIcon className="h-4 w-4 text-muted-foreground" />
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
            <p className="text-xs text-muted-foreground">tasks with applications</p>
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
          Showing {tasks.length} tasks {hasMore && "(more available)"}
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
                      <NairaIcon className="h-4 w-4" />
                      {formatCurrency(task.budget_max)}
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

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <Button onClick={loadMore} disabled={loading} variant="outline" size="lg">
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More Tasks"
            )}
          </Button>
        </div>
      )}

      {/* No Results */}
      {tasks.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold">No tasks found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria or filters</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("All Categories")
                  setSelectedBudget("All Budgets")
                  setSelectedExperience("All Levels")
                  setSortBy("newest")
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
