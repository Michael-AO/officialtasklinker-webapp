import { type NextRequest, NextResponse } from "next/server"

// Mock data for task details - in a real app, this would come from your database
const mockTaskDetails = {
  "1": {
    id: "1",
    title: "Build a Modern E-commerce Website",
    description:
      "We need a full-stack e-commerce website built with React and Node.js. The site should include user authentication, product catalog, shopping cart, payment integration, and admin dashboard. Must be responsive and SEO-friendly.",
    category: "Web Development",
    subcategory: "Full Stack Development",
    skills_required: ["React", "Node.js", "MongoDB", "Stripe API", "CSS"],
    budget_type: "fixed",
    budget_min: 2500,
    budget_max: 4000,
    currency: "USD",
    duration: "6-8 weeks",
    location: "Remote",
    experience_level: "intermediate",
    urgency: "normal",
    status: "open",
    applications_count: 12,
    views_count: 156,
    deadline: "2024-02-15",
    created_at: "2024-01-15T10:00:00Z",
    requirements: [
      "Experience with React and modern JavaScript",
      "Knowledge of payment gateway integration",
      "Portfolio of similar e-commerce projects",
      "Available for regular communication during EST hours",
    ],
    questions: [
      "Have you built e-commerce sites before?",
      "Can you provide examples of your React work?",
      "Are you familiar with Stripe integration?",
    ],
    attachments: ["wireframes.pdf", "brand-guidelines.pdf"],
    client: {
      id: "client-1",
      name: "Sarah Johnson",
      avatar_url: "/placeholder.svg?height=40&width=40",
      rating: 4.8,
      completed_tasks: 15,
      total_earned: 25000,
      location: "San Francisco, CA",
      bio: "Experienced tech entrepreneur with 10+ years in software development.",
      join_date: "2022-03-15T10:00:00Z",
    },
  },
  "2": {
    id: "2",
    title: "Mobile App UI/UX Design",
    description:
      "Looking for a talented designer to create a modern, intuitive UI/UX for our fitness tracking mobile app. Need complete design system, wireframes, and high-fidelity mockups for both iOS and Android.",
    category: "Design",
    subcategory: "Mobile Design",
    skills_required: ["Figma", "UI/UX Design", "Mobile Design", "Prototyping"],
    budget_type: "fixed",
    budget_min: 1500,
    budget_max: 2500,
    currency: "USD",
    duration: "4-6 weeks",
    location: "Remote",
    experience_level: "intermediate",
    urgency: "high",
    status: "open",
    applications_count: 8,
    views_count: 89,
    deadline: "2024-02-01",
    created_at: "2024-01-10T14:30:00Z",
    requirements: [
      "3+ years of mobile app design experience",
      "Proficiency in Figma or Sketch",
      "Understanding of iOS and Android design guidelines",
      "Portfolio showcasing mobile app designs",
    ],
    questions: [
      "Can you show examples of fitness or health app designs?",
      "How do you approach user research and testing?",
      "What's your typical design process timeline?",
    ],
    attachments: ["app-requirements.pdf"],
    client: {
      id: "client-2",
      name: "Mike Chen",
      avatar_url: "/placeholder.svg?height=40&width=40",
      rating: 4.9,
      completed_tasks: 23,
      total_earned: 45000,
      location: "New York, NY",
      bio: "Product manager at a growing startup, passionate about creating user-centered experiences.",
      join_date: "2021-08-20T09:15:00Z",
    },
  },
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const taskId = params.id

    // Get task from mock data
    const task = mockTaskDetails[taskId as keyof typeof mockTaskDetails]

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Mock similar tasks
    const similarTasks = Object.values(mockTaskDetails)
      .filter((t) => t.id !== taskId && t.category === task.category)
      .slice(0, 3)
      .map((t) => ({
        id: t.id,
        title: t.title,
        budget_min: t.budget_min,
        budget_max: t.budget_max,
        applications_count: t.applications_count,
      }))

    return NextResponse.json({
      task,
      is_saved: false, // Mock - would check user's saved tasks
      similar_tasks: similarTasks,
    })
  } catch (error) {
    console.error("Task detail API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
