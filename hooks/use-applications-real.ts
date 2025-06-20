"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"

export interface ApplicationWithDetails {
  id: string
  task_id: string
  freelancer_id: string
  proposed_budget: number
  budget_type: "fixed" | "hourly"
  estimated_duration: string
  cover_letter: string
  attachments: string[]
  status: "pending" | "accepted" | "rejected" | "withdrawn" | "interviewing"
  applied_date: string
  response_date?: string
  feedback?: string
  created_at: string
  updated_at: string
  // Joined data
  task: {
    id: string
    title: string
    description: string
    category: string
    budget_min: number
    budget_max: number
    currency: string
    client: {
      id: string
      name: string
      email: string
      avatar_url?: string
      rating: number
      is_verified: boolean
    }
  }
  freelancer?: {
    id: string
    name: string
    email: string
    avatar_url?: string
    rating: number
    completed_tasks: number
    skills: string[]
    is_verified: boolean
  }
}

// Mock data generator for fallback
const generateMockApplications = (userType: "client" | "freelancer", userId: string): ApplicationWithDetails[] => {
  const mockData: ApplicationWithDetails[] = [
    {
      id: "app-1",
      task_id: "task-1",
      freelancer_id: userType === "freelancer" ? userId : "freelancer-1",
      proposed_budget: 2400000, // ₦2.4M
      budget_type: "fixed",
      estimated_duration: "4-6 weeks",
      cover_letter:
        "I have 5+ years of experience in React and Node.js development. I've built several e-commerce platforms with payment integration including Stripe and PayStack. I can deliver a modern, responsive website that meets your requirements.",
      attachments: [],
      status: "pending",
      applied_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      task: {
        id: "task-1",
        title: "E-commerce Website Development",
        description:
          "Build a modern e-commerce platform with React and Node.js, including payment integration and admin dashboard.",
        category: "Web Development",
        budget_min: 2000000,
        budget_max: 3000000,
        currency: "NGN",
        client: {
          id: "client-1",
          name: "TechCorp Solutions",
          email: "contact@techcorp.ng",
          avatar_url: "/placeholder.svg?height=40&width=40",
          rating: 4.8,
          is_verified: true,
        },
      },
      freelancer:
        userType === "client"
          ? {
              id: "freelancer-1",
              name: "Adebayo Ogundimu",
              email: "adebayo@example.com",
              avatar_url: "/placeholder.svg?height=40&width=40",
              rating: 4.9,
              completed_tasks: 52,
              skills: ["React", "Node.js", "TypeScript", "MongoDB"],
              is_verified: true,
            }
          : undefined,
    },
    {
      id: "app-2",
      task_id: "task-2",
      freelancer_id: userType === "freelancer" ? userId : "freelancer-2",
      proposed_budget: 85000, // ₦85k/hour
      budget_type: "hourly",
      estimated_duration: "2-3 weeks",
      cover_letter:
        "I specialize in mobile app design with modern UI/UX principles. I have experience designing for both iOS and Android platforms and can create intuitive user experiences.",
      attachments: [],
      status: "accepted",
      applied_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      response_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      feedback: "Great portfolio! We're excited to work with you.",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      task: {
        id: "task-2",
        title: "Mobile App UI/UX Design",
        description: "Design a modern mobile app interface for our fitness tracking application.",
        category: "Design",
        budget_min: 70000,
        budget_max: 100000,
        currency: "NGN",
        client: {
          id: "client-2",
          name: "FitLife Nigeria",
          email: "hello@fitlife.ng",
          avatar_url: "/placeholder.svg?height=40&width=40",
          rating: 4.6,
          is_verified: true,
        },
      },
      freelancer:
        userType === "client"
          ? {
              id: "freelancer-2",
              name: "Chioma Okwu",
              email: "chioma@example.com",
              avatar_url: "/placeholder.svg?height=40&width=40",
              rating: 4.8,
              completed_tasks: 38,
              skills: ["Figma", "UI/UX", "Mobile Design", "Prototyping"],
              is_verified: true,
            }
          : undefined,
    },
    {
      id: "app-3",
      task_id: "task-3",
      freelancer_id: userType === "freelancer" ? userId : "freelancer-3",
      proposed_budget: 1200000, // ₦1.2M
      budget_type: "fixed",
      estimated_duration: "3-4 weeks",
      cover_letter:
        "I have extensive experience in Python data analysis and machine learning. I can help you build robust data processing pipelines and generate actionable insights.",
      attachments: [],
      status: "interviewing",
      applied_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      response_date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      feedback: "Your experience looks great! Let's schedule a call to discuss the project requirements.",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      task: {
        id: "task-3",
        title: "Python Data Analysis Script",
        description: "Build data analysis scripts for financial data processing and reporting.",
        category: "Data Science",
        budget_min: 1000000,
        budget_max: 1500000,
        currency: "NGN",
        client: {
          id: "client-3",
          name: "FinTech Innovations",
          email: "data@fintech.ng",
          avatar_url: "/placeholder.svg?height=40&width=40",
          rating: 4.7,
          is_verified: true,
        },
      },
      freelancer:
        userType === "client"
          ? {
              id: "freelancer-3",
              name: "Ibrahim Musa",
              email: "ibrahim@example.com",
              avatar_url: "/placeholder.svg?height=40&width=40",
              rating: 4.6,
              completed_tasks: 29,
              skills: ["Python", "Pandas", "Data Analysis", "Machine Learning"],
              is_verified: false,
            }
          : undefined,
    },
    {
      id: "app-4",
      task_id: "task-4",
      freelancer_id: userType === "freelancer" ? userId : "freelancer-4",
      proposed_budget: 180000, // ₦180k
      budget_type: "fixed",
      estimated_duration: "2 weeks",
      cover_letter:
        "I'm a professional content writer with 4+ years of experience in tech writing and SEO. I've written for several Nigerian fintech companies and understand the local market dynamics. I can deliver high-quality, engaging content that drives conversions.",
      attachments: ["writing-samples.pdf", "seo-strategy.docx"],
      status: "rejected",
      applied_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      response_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      feedback:
        "Thank you for your application. We decided to go with someone who has more experience in our specific industry.",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      task: {
        id: "task-4",
        title: "Content Writing for Fintech Blog",
        description: "Write 10 SEO-optimized blog posts about cryptocurrency and digital payments in Nigeria.",
        category: "Writing & Translation",
        budget_min: 150000,
        budget_max: 250000,
        currency: "NGN",
        client: {
          id: "client-4",
          name: "CryptoNaija",
          email: "content@cryptonaija.com",
          avatar_url: "/placeholder.svg?height=40&width=40",
          rating: 4.5,
          is_verified: true,
        },
      },
      freelancer:
        userType === "client"
          ? {
              id: "freelancer-4",
              name: "Fatima Abdullahi",
              email: "fatima@example.com",
              avatar_url: "/placeholder.svg?height=40&width=40",
              rating: 4.7,
              completed_tasks: 34,
              skills: ["Content Writing", "SEO", "Copywriting", "Research"],
              is_verified: true,
            }
          : undefined,
    },
    {
      id: "app-5",
      task_id: "task-5",
      freelancer_id: userType === "freelancer" ? userId : "freelancer-5",
      proposed_budget: 95000, // ₦95k/hour
      budget_type: "hourly",
      estimated_duration: "1-2 weeks",
      cover_letter:
        "Hello! I'm a digital marketing specialist with expertise in social media management and paid advertising. I've helped over 20 Nigerian businesses grow their online presence and increase sales through strategic social media campaigns. I'd love to help your brand achieve similar results.",
      attachments: ["portfolio-2024.pdf"],
      status: "withdrawn",
      applied_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      task: {
        id: "task-5",
        title: "Social Media Marketing Campaign",
        description: "Manage Instagram and Facebook accounts for a fashion brand, create content and run paid ads.",
        category: "Digital Marketing",
        budget_min: 80000,
        budget_max: 120000,
        currency: "NGN",
        client: {
          id: "client-5",
          name: "Ankara Styles Lagos",
          email: "marketing@ankarastyles.ng",
          avatar_url: "/placeholder.svg?height=40&width=40",
          rating: 4.3,
          is_verified: false,
        },
      },
      freelancer:
        userType === "client"
          ? {
              id: "freelancer-5",
              name: "Kemi Adebayo",
              email: "kemi@example.com",
              avatar_url: "/placeholder.svg?height=40&width=40",
              rating: 4.4,
              completed_tasks: 28,
              skills: ["Social Media Marketing", "Facebook Ads", "Instagram Marketing", "Content Creation"],
              is_verified: false,
            }
          : undefined,
    },
  ]

  return mockData
}

export function useApplicationsReal() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUsingRealData, setIsUsingRealData] = useState(false)

  const fetchRealApplications = async () => {
    if (!user?.id) return []

    try {
      let query = supabase
        .from("applications")
        .select(`
          *,
          task:tasks (
            *,
            client:users!tasks_client_id_fkey (*)
          ),
          freelancer:users!applications_freelancer_id_fkey (*)
        `)
        .order("created_at", { ascending: false })

      // Filter based on user type
      if (user.user_type === "client") {
        query = query.eq("task.client_id", user.id)
      } else if (user.user_type === "freelancer") {
        query = query.eq("freelancer_id", user.id)
      }

      const { data, error } = await query

      if (error) throw error

      setIsUsingRealData(true)
      return data || []
    } catch (error) {
      console.warn("Failed to fetch real applications, using mock data:", error)
      setIsUsingRealData(false)
      return generateMockApplications(user.user_type || "freelancer", user.id)
    }
  }

  const fetchApplications = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const data = await fetchRealApplications()
      setApplications(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch applications")
      // Fallback to mock data
      setApplications(generateMockApplications(user.user_type || "freelancer", user.id))
    } finally {
      setLoading(false)
    }
  }, [user])

  const updateApplicationStatus = async (
    applicationId: string,
    status: "accepted" | "rejected" | "interviewing",
    feedback?: string,
  ) => {
    try {
      if (isUsingRealData) {
        const { error } = await supabase
          .from("applications")
          .update({
            status,
            feedback,
            response_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", applicationId)

        if (error) throw error
      }

      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status, feedback, response_date: new Date().toISOString() } : app,
        ),
      )

      return { success: true }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to update application",
      }
    }
  }

  const withdrawApplication = async (applicationId: string) => {
    try {
      if (isUsingRealData) {
        const { error } = await supabase
          .from("applications")
          .update({
            status: "withdrawn",
            updated_at: new Date().toISOString(),
          })
          .eq("id", applicationId)

        if (error) throw error
      }

      // Update local state
      setApplications((prev) =>
        prev.map((app) => (app.id === applicationId ? { ...app, status: "withdrawn" as const } : app)),
      )

      return { success: true }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to withdraw application",
      }
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  // Calculate stats
  const stats = {
    total: applications.length,
    pending: applications.filter((app) => app.status === "pending").length,
    accepted: applications.filter((app) => app.status === "accepted").length,
    rejected: applications.filter((app) => app.status === "rejected").length,
    interviewing: applications.filter((app) => app.status === "interviewing").length,
    withdrawn: applications.filter((app) => app.status === "withdrawn").length,
    successRate:
      applications.length > 0
        ? Math.round((applications.filter((app) => app.status === "accepted").length / applications.length) * 100)
        : 0,
  }

  return {
    applications,
    loading,
    error,
    stats,
    isUsingRealData,
    updateApplicationStatus,
    withdrawApplication,
    refetch: fetchApplications,
  }
}
