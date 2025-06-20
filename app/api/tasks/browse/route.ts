import { type NextRequest, NextResponse } from "next/server"

// Extended mock data for browse
const mockBrowseTasks = [
  {
    id: "browse-1",
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
    id: "browse-2",
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
    id: "browse-3",
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
    id: "browse-4",
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
    id: "browse-5",
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
]

export async function GET(request: NextRequest) {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 400))

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search")
    const category = searchParams.get("category")
    const experience_level = searchParams.get("experience_level")
    const budget_min = searchParams.get("budget_min")
    const budget_max = searchParams.get("budget_max")
    const sort_by = searchParams.get("sort_by")

    let filteredTasks = [...mockBrowseTasks]

    // Apply filters
    if (search) {
      filteredTasks = filteredTasks.filter(
        (task) =>
          task.title.toLowerCase().includes(search.toLowerCase()) ||
          task.description.toLowerCase().includes(search.toLowerCase()) ||
          task.skills_required.some((skill) => skill.toLowerCase().includes(search.toLowerCase())),
      )
    }

    if (category) {
      filteredTasks = filteredTasks.filter((task) => task.category === category)
    }

    if (experience_level) {
      filteredTasks = filteredTasks.filter((task) => task.experience_level === experience_level)
    }

    if (budget_min) {
      filteredTasks = filteredTasks.filter((task) => task.budget_max >= Number.parseInt(budget_min))
    }

    if (budget_max) {
      filteredTasks = filteredTasks.filter((task) => task.budget_min <= Number.parseInt(budget_max))
    }

    // Apply sorting
    if (sort_by) {
      switch (sort_by) {
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

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      tasks: paginatedTasks,
      total: filteredTasks.length,
      has_more: endIndex < filteredTasks.length,
      page,
      limit,
    })
  } catch (error) {
    console.error("Error fetching browse tasks:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch tasks" }, { status: 500 })
  }
}
