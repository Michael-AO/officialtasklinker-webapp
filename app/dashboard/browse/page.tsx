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
  Eye,
  MapPin,
  MoreHorizontal,
  Search,
  Star,
  Users,
  Briefcase,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NairaIcon } from "@/components/naira-icon"
import Link from "next/link"
import { formatCurrency, getStatusColor, generateTaskCode } from "@/lib/api-utils"
import { toast } from "@/hooks/use-toast"
import { VerifiedBadge } from "@/components/ui/verified-badge"
import { isVerifiedEmail } from "@/lib/utils"

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
  "Medicine and Health",
]

const experienceLevels = ["All Levels", "entry", "intermediate", "expert"]
const budgetRanges = ["All Budgets", "Under ₦50,000", "₦50,000 - ₦100,000", "₦100,000 - ₦250,000", "₦250,000 - ₦500,000", "Over ₦500,000"]

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
    email?: string
    avatar_url?: string | null
  }
}

export default function BrowseTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedExperience, setSelectedExperience] = useState("All Levels")
  const [selectedBudget, setSelectedBudget] = useState("All Budgets")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState("list")
  const [savedTasks, setSavedTasks] = useState<string[]>([])
  const [debugInfo, setDebugInfo] = useState<any>(null)

  // Fetch tasks from API - only real database data
  const fetchTasks = async () => {
    try {
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
    } catch (error) {
      console.error("Error fetching tasks:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch tasks. Please try again.",
        variant: "destructive",
      })
      setTasks([])
    } finally {
      setLoading(false)
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

  // Calculate stats
  const stats = {
    totalTasks: tasks.length,
    totalBudget: tasks.reduce((sum, task) => sum + task.budget_max, 0),
    avgBudget: tasks.length > 0 ? Math.round(tasks.reduce((sum, task) => sum + task.budget_max, 0) / tasks.length) : 0,
    totalApplications: tasks.reduce((sum, task) => sum + task.applications_count, 0),
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
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
            <p className="text-xs text-muted-foreground">total applications</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <NairaIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalBudget)}</div>
            <p className="text-xs text-muted-foreground">total budget</p>
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

      {/* Task List - card design: header (avatar, name, posted), tags, title, description, price, Apply now */}
      <div className={viewMode === "grid" ? "grid gap-6 md:grid-cols-2" : "space-y-4"}>
        {tasks.map((task) => (
          <Card key={task.id} className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              {/* Header: avatar, name + posted time, menu */}
              <div className="flex items-start gap-3 p-4 pb-2">
                <Avatar className="h-10 w-10 shrink-0 rounded-full border border-gray-100">
                  <AvatarImage src={task.client?.avatar_url ?? undefined} alt={task.client?.name} />
                  <AvatarFallback className="bg-brand/10 text-sm font-medium text-brand">
                    {task.client?.name?.split(" ").map((n) => n[0]).join("") || "C"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground truncate">{task.client?.name || "Client"}</p>
                  <p className="text-xs text-muted-foreground">Posted {timeAgo(task.created_at)}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-full">
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => toggleSaveTask(task.id)}>
                      <Bookmark className={`mr-2 h-4 w-4 ${savedTasks.includes(task.id) ? "fill-current" : ""}`} />
                      {savedTasks.includes(task.id) ? "Unsave" : "Save task"}
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/browse/${task.id}`}>View details</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {/* Skills / category pills */}
              <div className="flex flex-wrap gap-2 px-4 pb-2">
                {task.category && (
                  <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
                    {task.category}
                  </span>
                )}
                {(task.skills_required || []).slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              {/* Headline + description */}
              <div className="px-4 pb-3">
                <Link href={`/dashboard/browse/${task.id}`} className="hover:underline focus:outline-none">
                  <h3 className="text-lg font-semibold leading-tight text-foreground line-clamp-2">{task.title}</h3>
                </Link>
                <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{task.description}</p>
              </div>
              {/* Price row: amount left, type pill right */}
              <div className="flex items-center justify-between gap-2 px-4 pb-4">
                <div className="flex items-center gap-1">
                  <NairaIcon className="h-5 w-5 text-brand" />
                  <span className="text-xl font-semibold text-brand">
                    {task.budget_type === "hourly"
                      ? `${formatCurrency(task.budget_max)}/hr`
                      : formatCurrency(task.budget_max)}
                  </span>
                </div>
                <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium capitalize text-brand">
                  {task.budget_type === "hourly" ? "Hourly" : "Fixed"}
                </span>
              </div>
              {/* Full-width Apply now button */}
              <div className="border-t bg-brand/5 px-4 py-3">
                <Button className="w-full rounded-lg bg-brand font-medium text-brand-foreground hover:bg-brand/90" asChild>
                  <Link href={`/dashboard/browse/${task.id}`}>Apply now</Link>
                </Button>
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
