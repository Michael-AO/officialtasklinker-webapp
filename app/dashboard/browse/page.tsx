"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "lucide-react"
import Link from "next/link"
import { formatCurrency, getStatusColor, generateTaskCode } from "@/lib/api-utils"

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

// Static mock data
const mockTasks = [
  {
    id: "1",
    client_id: "client-1",
    title: "E-commerce Website Development",
    description:
      "Build a modern e-commerce platform with React and Node.js. Need someone experienced with payment integration and responsive design.",
    category: "Web Development",
    subcategory: "Full Stack",
    skills_required: ["React", "Node.js", "MongoDB", "Stripe"],
    budget_type: "fixed" as const,
    budget_min: 2500,
    budget_max: 4000,
    currency: "USD",
    duration: "6-8 weeks",
    location: "Remote",
    experience_level: "intermediate",
    urgency: "normal" as const,
    status: "active",
    applications_count: 12,
    views_count: 156,
    created_at: "2024-01-15T10:00:00Z",
    client: {
      id: "client-1",
      name: "TechCorp Solutions",
      rating: 4.8,
      location: "San Francisco, CA",
    },
  },
  {
    id: "2",
    client_id: "client-2",
    title: "Mobile App UI/UX Design",
    description:
      "Design a modern mobile app interface for a fitness tracking application. Looking for creative designs with great user experience.",
    category: "Design",
    subcategory: "UI/UX Design",
    skills_required: ["Figma", "Adobe XD", "Prototyping", "Mobile Design"],
    budget_type: "fixed" as const,
    budget_min: 1200,
    budget_max: 2000,
    currency: "USD",
    duration: "3-4 weeks",
    location: "Remote",
    experience_level: "intermediate",
    urgency: "high" as const,
    status: "active",
    applications_count: 8,
    views_count: 89,
    created_at: "2024-01-16T14:30:00Z",
    client: {
      id: "client-2",
      name: "FitLife Inc",
      rating: 4.6,
      location: "New York, NY",
    },
  },
  {
    id: "3",
    client_id: "client-3",
    title: "Content Writing for Tech Blog",
    description:
      "Write engaging articles about emerging technologies, AI, and software development. Need 10 articles, 1500+ words each.",
    category: "Writing",
    subcategory: "Content Writing",
    skills_required: ["Technical Writing", "SEO", "Research", "Technology"],
    budget_type: "fixed" as const,
    budget_min: 800,
    budget_max: 1200,
    currency: "USD",
    duration: "4-5 weeks",
    location: "Remote",
    experience_level: "intermediate",
    urgency: "normal" as const,
    status: "active",
    applications_count: 15,
    views_count: 203,
    created_at: "2024-01-17T09:15:00Z",
    client: {
      id: "client-3",
      name: "Digital Insights",
      rating: 4.9,
      location: "Austin, TX",
    },
  },
  {
    id: "4",
    client_id: "client-4",
    title: "Python Data Analysis Script",
    description:
      "Create Python scripts for analyzing sales data and generating reports. Experience with pandas, matplotlib required.",
    category: "Programming",
    subcategory: "Data Science",
    skills_required: ["Python", "Pandas", "Matplotlib", "Data Analysis"],
    budget_type: "fixed" as const,
    budget_min: 500,
    budget_max: 800,
    currency: "USD",
    duration: "2-3 weeks",
    location: "Remote",
    experience_level: "entry",
    urgency: "normal" as const,
    status: "active",
    applications_count: 6,
    views_count: 67,
    created_at: "2024-01-18T11:45:00Z",
    client: {
      id: "client-4",
      name: "DataCorp Analytics",
      rating: 4.7,
      location: "Chicago, IL",
    },
  },
  {
    id: "5",
    client_id: "client-5",
    title: "WordPress Website Customization",
    description:
      "Customize existing WordPress theme, add custom functionality, and optimize for speed. Need someone familiar with PHP and WordPress development.",
    category: "Web Development",
    subcategory: "WordPress",
    skills_required: ["WordPress", "PHP", "CSS", "JavaScript"],
    budget_type: "fixed" as const,
    budget_min: 1000,
    budget_max: 1800,
    currency: "USD",
    duration: "3-4 weeks",
    location: "Remote",
    experience_level: "intermediate",
    urgency: "normal" as const,
    status: "active",
    applications_count: 9,
    views_count: 124,
    created_at: "2024-01-19T16:20:00Z",
    client: {
      id: "client-5",
      name: "Small Biz Solutions",
      rating: 4.5,
      location: "Denver, CO",
    },
  },
  {
    id: "6",
    client_id: "client-6",
    title: "Logo Design for Startup",
    description: "Create a modern, memorable logo for a tech startup. Need multiple concepts and revisions included.",
    category: "Design",
    subcategory: "Logo Design",
    skills_required: ["Logo Design", "Adobe Illustrator", "Branding"],
    budget_type: "fixed" as const,
    budget_min: 300,
    budget_max: 600,
    currency: "USD",
    duration: "1-2 weeks",
    location: "Remote",
    experience_level: "intermediate",
    urgency: "normal" as const,
    status: "active",
    applications_count: 22,
    views_count: 89,
    created_at: "2024-01-20T08:30:00Z",
    client: {
      id: "client-6",
      name: "StartupCo",
      rating: 4.3,
      location: "Austin, TX",
    },
  },
]

export default function BrowseTasksPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedExperience, setSelectedExperience] = useState("All Levels")
  const [selectedBudget, setSelectedBudget] = useState("All Budgets")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState("list")
  const [savedTasks, setSavedTasks] = useState<string[]>([])

  // Filter tasks based on current filters
  const filteredTasks = mockTasks.filter((task) => {
    const matchesSearch =
      !searchTerm ||
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.skills_required.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === "All Categories" || task.category === selectedCategory

    const matchesExperience = selectedExperience === "All Levels" || task.experience_level === selectedExperience

    return matchesSearch && matchesCategory && matchesExperience
  })

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

  // Calculate stats from tasks
  const stats = {
    totalTasks: filteredTasks.length,
    avgBudget:
      filteredTasks.length > 0
        ? Math.round(
            filteredTasks.reduce((sum, task) => sum + (task.budget_min + task.budget_max) / 2, 0) /
              filteredTasks.length,
          )
        : 0,
    avgApplications:
      filteredTasks.length > 0
        ? Math.round(filteredTasks.reduce((sum, task) => sum + task.applications_count, 0) / filteredTasks.length)
        : 0,
    successRate: 78, // Static value
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Browse Tasks</h1>
          <p className="text-muted-foreground">Find your next project and start earning</p>
        </div>
        <div className="flex gap-2">
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
            <p className="text-xs text-muted-foreground">your win rate</p>
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
          Showing {filteredTasks.length} of {mockTasks.length} tasks
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
        {filteredTasks.map((task) => (
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
      {filteredTasks.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold">No tasks found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria or filters</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
