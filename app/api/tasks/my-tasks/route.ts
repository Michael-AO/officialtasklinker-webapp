import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for demo (in production, this would be your database)
const mockTasks = [
  {
    id: "task-1",
    title: "E-commerce Website Development",
    description: "Build a modern e-commerce platform with React and Node.js",
    budget_min: 2500,
    budget_max: 4000,
    budget_type: "fixed",
    status: "active",
    category: "Web Development",
    skills_required: ["React", "Node.js", "MongoDB"],
    applications_count: 12,
    created_at: "2024-01-15T10:00:00Z",
    deadline: "2024-02-15T23:59:59Z",
    urgency: "normal",
    location: "Remote",
  },
  {
    id: "task-2",
    title: "Mobile App UI/UX Design",
    description: "Design modern and intuitive mobile app interface",
    budget_min: 1200,
    budget_max: 2000,
    budget_type: "fixed",
    status: "in_progress",
    category: "Design",
    skills_required: ["Figma", "UI/UX", "Mobile Design"],
    applications_count: 8,
    created_at: "2024-01-10T14:30:00Z",
    deadline: "2024-01-30T23:59:59Z",
    urgency: "high",
    location: "Remote",
  },
  {
    id: "task-3",
    title: "Content Writing for Blog",
    description: "Write 10 SEO-optimized blog posts about technology",
    budget_min: 800,
    budget_max: 1200,
    budget_type: "fixed",
    status: "completed",
    category: "Writing",
    skills_required: ["Content Writing", "SEO", "Technology"],
    applications_count: 15,
    created_at: "2023-12-20T09:15:00Z",
    deadline: "2024-01-05T23:59:59Z",
    urgency: "normal",
    location: "Remote",
  },
  {
    id: "task-4",
    title: "Python Data Analysis Script",
    description: "Create data analysis scripts for financial data processing",
    budget_min: 500,
    budget_max: 800,
    budget_type: "fixed",
    status: "draft",
    category: "Data Science",
    skills_required: ["Python", "Pandas", "Data Analysis"],
    applications_count: 0,
    created_at: "2024-01-18T11:45:00Z",
    deadline: "2024-02-20T23:59:59Z",
    urgency: "normal",
    location: "Remote",
  },
]

export async function GET(request: NextRequest) {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    let filteredTasks = [...mockTasks]

    // Apply filters
    if (status && status !== "all") {
      filteredTasks = filteredTasks.filter((task) => task.status === status)
    }

    if (category && category !== "all") {
      filteredTasks = filteredTasks.filter((task) => task.category === category)
    }

    if (search) {
      filteredTasks = filteredTasks.filter(
        (task) =>
          task.title.toLowerCase().includes(search.toLowerCase()) ||
          task.description.toLowerCase().includes(search.toLowerCase()),
      )
    }

    return NextResponse.json({
      success: true,
      tasks: filteredTasks,
      total: filteredTasks.length,
    })
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch tasks" }, { status: 500 })
  }
}

// Add a function to add new tasks to the mock data
export function addTaskToMockData(task: any) {
  mockTasks.unshift(task) // Add to beginning of array
}
