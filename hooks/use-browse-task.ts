"use client"

import { useState, useEffect, useCallback } from "react"

export interface Task {
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
  status: "draft" | "active" | "in_progress" | "completed" | "cancelled"
  applications_count: number
  views_count: number
  deadline?: string
  created_at: string
  client?: {
    id: string
    name: string
    rating: number
    avatar_url?: string
    location?: string
  }
}

export interface BrowseTasksFilters {
  category?: string
  budget_min?: number
  budget_max?: number
  budget_type?: "fixed" | "hourly"
  experience_level?: string
  location?: string
  skills?: string[]
  search?: string
  sort_by?: "newest" | "budget_high" | "budget_low" | "deadline"
}

export type { Task, BrowseTasksFilters }

export function useBrowseTasks(filters: BrowseTasksFilters = {}) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const fetchTasks = useCallback(
    async (page = 1, reset = false) => {
      try {
        setLoading(true)
        setError(null)

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Filter mock data based on filters
        let filteredTasks = getMockTasks()

        // Apply search filter
        if (filters.search) {
          filteredTasks = filteredTasks.filter(
            (task) =>
              task.title.toLowerCase().includes(filters.search!.toLowerCase()) ||
              task.description.toLowerCase().includes(filters.search!.toLowerCase()) ||
              task.skills_required.some((skill) => skill.toLowerCase().includes(filters.search!.toLowerCase())),
          )
        }

        // Apply category filter
        if (filters.category && filters.category !== "All Categories") {
          filteredTasks = filteredTasks.filter((task) => task.category === filters.category)
        }

        // Apply experience level filter
        if (filters.experience_level && filters.experience_level !== "All Levels") {
          filteredTasks = filteredTasks.filter((task) => task.experience_level === filters.experience_level)
        }

        // Apply budget filter
        if (filters.budget_min !== undefined) {
          filteredTasks = filteredTasks.filter((task) => task.budget_max >= filters.budget_min!)
        }
        if (filters.budget_max !== undefined) {
          filteredTasks = filteredTasks.filter((task) => task.budget_min <= filters.budget_max!)
        }

        // Apply sorting
        if (filters.sort_by) {
          switch (filters.sort_by) {
            case "budget_high":
              filteredTasks.sort((a, b) => b.budget_min + b.budget_max - (a.budget_min + a.budget_max))
              break
            case "budget_low":
              filteredTasks.sort((a, b) => a.budget_min + a.budget_max - (b.budget_min + b.budget_max))
              break
            case "newest":
              filteredTasks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              break
            default:
              break
          }
        }

        // Simulate pagination
        const limit = 20
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit
        const paginatedTasks = filteredTasks.slice(startIndex, endIndex)

        if (reset || page === 1) {
          setTasks(paginatedTasks)
        } else {
          setTasks((prev) => [...prev, ...paginatedTasks])
        }

        setTotalCount(filteredTasks.length)
        setHasMore(endIndex < filteredTasks.length)
        setCurrentPage(page)
      } catch (err) {
        console.error("Browse tasks error:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    },
    [JSON.stringify(filters)],
  )

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchTasks(currentPage + 1, false)
    }
  }

  const refresh = () => {
    fetchTasks(1, true)
  }

  useEffect(() => {
    fetchTasks(1, true)
  }, [fetchTasks])

  return {
    tasks,
    loading,
    error,
    totalCount,
    hasMore,
    loadMore,
    refresh,
  }
}

// Mock data for development
function getMockTasks(): Task[] {
  return [
    {
      id: "1",
      client_id: "client-1",
      title: "E-commerce Website Development",
      description:
        "Build a modern e-commerce platform with React and Node.js. Need someone experienced with payment integration and responsive design.",
      category: "Web Development",
      subcategory: "Full Stack",
      skills_required: ["React", "Node.js", "MongoDB", "Stripe"],
      budget_type: "fixed",
      budget_min: 2500,
      budget_max: 4000,
      currency: "USD",
      duration: "6-8 weeks",
      location: "Remote",
      experience_level: "intermediate",
      urgency: "normal",
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
      budget_type: "fixed",
      budget_min: 1200,
      budget_max: 2000,
      currency: "USD",
      duration: "3-4 weeks",
      location: "Remote",
      experience_level: "intermediate",
      urgency: "high",
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
      budget_type: "fixed",
      budget_min: 800,
      budget_max: 1200,
      currency: "USD",
      duration: "4-5 weeks",
      location: "Remote",
      experience_level: "intermediate",
      urgency: "normal",
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
      budget_type: "fixed",
      budget_min: 500,
      budget_max: 800,
      currency: "USD",
      duration: "2-3 weeks",
      location: "Remote",
      experience_level: "entry",
      urgency: "normal",
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
      budget_type: "fixed",
      budget_min: 1000,
      budget_max: 1800,
      currency: "USD",
      duration: "3-4 weeks",
      location: "Remote",
      experience_level: "intermediate",
      urgency: "normal",
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
      budget_type: "fixed",
      budget_min: 300,
      budget_max: 600,
      currency: "USD",
      duration: "1-2 weeks",
      location: "Remote",
      experience_level: "intermediate",
      urgency: "normal",
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
    {
      id: "7",
      client_id: "client-7",
      title: "Social Media Marketing Campaign",
      description: "Develop and execute a comprehensive social media marketing strategy for a B2B SaaS company.",
      category: "Marketing",
      subcategory: "Social Media",
      skills_required: ["Social Media Marketing", "Content Strategy", "Analytics"],
      budget_type: "fixed",
      budget_min: 1500,
      budget_max: 2500,
      currency: "USD",
      duration: "4-6 weeks",
      location: "Remote",
      experience_level: "expert",
      urgency: "high",
      status: "active",
      applications_count: 18,
      views_count: 145,
      created_at: "2024-01-21T12:15:00Z",
      client: {
        id: "client-7",
        name: "SaaS Solutions Inc",
        rating: 4.9,
        location: "San Francisco, CA",
      },
    },
  ]
}

// Export the hook as both named and default export
export default useBrowseTasks
