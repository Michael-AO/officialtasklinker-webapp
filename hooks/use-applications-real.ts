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
  attachments?: string[]
  status: "pending" | "accepted" | "rejected" | "withdrawn" | "interviewing"
  applied_date: string
  response_date?: string
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

  console.log("🔍 useApplicationsReal hook - user:", user?.id, "loading:", loading)

  const fetchRealApplications = async () => {
    if (!user?.id) return []

    try {
      console.log("🔍 Fetching applications for user:", user.id)

      // Use the user ID directly - it's already a proper UUID
      const userId = user.id

      console.log("🔍 Using user ID:", userId)

      // First, get applications where user is the freelancer (sent applications)
      const { data: sentApplications, error: sentError } = await supabase
        .from("applications")
        .select(`
          id,
          task_id,
          freelancer_id,
          proposed_budget,
          budget_type,
          estimated_duration,
          cover_letter,
          attachments,
          status,
          created_at,
          updated_at,
          response_date,
          task:tasks!inner (
            id,
            title,
            description,
            category,
            budget_min,
            budget_max,
            currency,
            client_id
          )
        `)
        .eq("freelancer_id", userId)
        .order("created_at", { ascending: false })

      if (sentError) {
        console.error("❌ Error fetching sent applications:", sentError)
        throw sentError
      }

      console.log("📤 Sent applications found:", sentApplications?.length || 0)
      console.log("📤 Raw sent applications data:", sentApplications)

      // Get client information for sent applications
      const clientIds = sentApplications?.map(app => (app.task as any)?.client_id).filter(Boolean) || []
      let clientsData: any[] = []
      
      if (clientIds.length > 0) {
        const { data: clients, error: clientsError } = await supabase
          .from("users")
          .select("id, name, email, avatar_url, rating, is_verified")
          .in("id", clientIds)
        
        if (clientsError) {
          console.error("❌ Error fetching clients:", clientsError)
        } else {
          clientsData = clients || []
        }
      }

      // Then, get applications where user is the task owner (received applications)
      const { data: receivedApplications, error: receivedError } = await supabase
        .from("applications")
        .select(`
          id,
          task_id,
          freelancer_id,
          proposed_budget,
          budget_type,
          estimated_duration,
          cover_letter,
          attachments,
          status,
          created_at,
          updated_at,
          response_date,
          freelancer:users (
            id,
            name,
            email,
            avatar_url,
            rating,
            completed_tasks,
            skills,
            is_verified
          ),
          task:tasks!inner (
            id,
            title,
            description,
            category,
            budget_min,
            budget_max,
            currency,
            client_id
          )
        `)
        .eq("task.client_id", userId)
        .order("created_at", { ascending: false })

      if (receivedError) {
        console.error("❌ Error fetching received applications:", receivedError)
        throw receivedError
      }

      console.log("📥 Received applications found:", receivedApplications?.length || 0)
      console.log("📥 Raw received applications data:", receivedApplications)

      // Transform sent applications
      const transformedSentApplications = (sentApplications || []).map((app: any) => {
        // Find the client data for this application
        const clientData = clientsData.find(client => client.id === app.task?.client_id)
        
        return {
          id: app.id,
          task_id: app.task_id,
          freelancer_id: app.freelancer_id,
          proposed_budget: app.proposed_budget,
          budget_type: app.budget_type || "fixed",
          estimated_duration: app.estimated_duration || "",
          cover_letter: app.cover_letter,
          attachments: app.attachments || [],
          status: app.status,
          applied_date: app.created_at,
          response_date: app.response_date,
          created_at: app.created_at,
          updated_at: app.updated_at,
          task: app.task ? {
            id: app.task.id,
            title: app.task.title,
            description: app.task.description,
            category: app.task.category,
            budget_min: app.task.budget_min,
            budget_max: app.task.budget_max,
            currency: app.task.currency,
            client: clientData ? {
              id: clientData.id,
              name: clientData.name,
              email: clientData.email,
              avatar_url: clientData.avatar_url,
              rating: clientData.rating || 0,
              is_verified: clientData.is_verified || false,
            } : {
              id: "unknown",
              name: "Unknown Client",
              email: "unknown@example.com",
              avatar_url: undefined,
              rating: 0,
              is_verified: false,
            },
          } : {
            id: "unknown",
            title: "Unknown Task",
            description: "Task details not available",
            category: "Unknown",
            budget_min: 0,
            budget_max: 0,
            currency: "NGN",
            client: {
              id: "unknown",
              name: "Unknown Client",
              email: "unknown@example.com",
              avatar_url: undefined,
              rating: 0,
              is_verified: false,
            },
          },
          freelancer: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar_url: user.avatar,
            rating: user.rating || 0,
            completed_tasks: user.completedTasks || 0,
            skills: user.skills || [],
            is_verified: user.isVerified || false,
          },
        }
      })

      // Transform received applications
      const transformedReceivedApplications = (receivedApplications || []).map((app: any) => ({
        id: app.id,
        task_id: app.task_id,
        freelancer_id: app.freelancer_id,
        proposed_budget: app.proposed_budget,
        budget_type: app.budget_type || "fixed",
        estimated_duration: app.estimated_duration || "",
        cover_letter: app.cover_letter,
        attachments: app.attachments || [],
        status: app.status,
        applied_date: app.created_at,
        response_date: app.response_date,
        created_at: app.created_at,
        updated_at: app.updated_at,
        task: app.task ? {
          id: app.task.id,
          title: app.task.title,
          description: app.task.description,
          category: app.task.category,
          budget_min: app.task.budget_min,
          budget_max: app.task.budget_max,
          currency: app.task.currency,
          client: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar_url: user.avatar,
            rating: user.rating || 0,
            is_verified: user.isVerified || false,
          },
        } : {
          id: "unknown",
          title: "Unknown Task",
          description: "Task details not available",
          category: "Unknown",
          budget_min: 0,
          budget_max: 0,
          currency: "NGN",
          client: {
            id: "unknown",
            name: "Unknown Client",
            email: "unknown@example.com",
            avatar_url: undefined,
            rating: 0,
            is_verified: false,
          },
        },
        freelancer: app.freelancer ? {
          id: app.freelancer.id,
          name: app.freelancer.name,
          email: app.freelancer.email,
          avatar_url: app.freelancer.avatar_url,
          rating: app.freelancer.rating || 0,
          completed_tasks: app.freelancer.completed_tasks || 0,
          skills: app.freelancer.skills || [],
          is_verified: app.freelancer.is_verified || false,
        } : {
          id: "unknown",
          name: "Unknown Freelancer",
          email: "unknown@example.com",
          avatar_url: undefined,
          rating: 0,
          completed_tasks: 0,
          skills: [],
          is_verified: false,
        },
      }))

      // Combine and sort the results
      const combinedData = [...transformedSentApplications, ...transformedReceivedApplications]
      combinedData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      console.log("✅ Fetched applications:", combinedData.length)
      console.log("✅ Sent applications:", transformedSentApplications.length)
      console.log("✅ Received applications:", transformedReceivedApplications.length)

      setIsUsingRealData(true)
      return combinedData
    } catch (error) {
      console.error("❌ Error fetching applications:", error)
      setIsUsingRealData(false)
      // Return empty array instead of mock data
      return []
    }
  }

  const fetchApplications = useCallback(async () => {
    console.log("🔍 fetchApplications called with user:", user?.id)
    
    if (!user) {
      console.log("❌ No user available, skipping fetch")
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log("🔍 Calling fetchRealApplications...")
      const data = await fetchRealApplications()
      console.log("✅ fetchRealApplications returned:", data.length, "applications")
      setApplications(data)
    } catch (err) {
      console.error("❌ Error in fetchApplications:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch applications")
      // Don't fallback to mock data - just show empty state
      setApplications([])
    } finally {
      setLoading(false)
    }
  }, [user])

  const updateApplicationStatus = async (
    applicationId: string,
    status: "accepted" | "rejected" | "interviewing",
  ) => {
    try {
      if (isUsingRealData) {
        const { error } = await supabase
          .from("applications")
          .update({
            status,
            response_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", applicationId)

        if (error) throw error
      }

      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status, response_date: new Date().toISOString() } : app,
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
    console.log("🔍 useEffect triggered, user:", user?.id)
    fetchApplications()
  }, [fetchApplications])

  // Calculate stats - only count applications that belong to the current user
  const userApplications = applications.filter(app => 
    app.freelancer?.id === user?.id || app.task?.client?.id === user?.id
  )
  
  console.log("🔍 User applications filtering:", {
    totalApplications: applications.length,
    userApplicationsCount: userApplications.length,
    userId: user?.id,
    userApplications: userApplications.map(app => ({
      id: app.id,
      freelancerId: app.freelancer?.id,
      clientId: app.task?.client?.id,
      status: app.status
    }))
  })
  
  const stats = {
    total: userApplications.length,
    pending: userApplications.filter((app) => app.status === "pending").length,
    accepted: userApplications.filter((app) => app.status === "accepted").length,
    rejected: userApplications.filter((app) => app.status === "rejected").length,
    interviewing: userApplications.filter((app) => app.status === "interviewing").length,
    withdrawn: userApplications.filter((app) => app.status === "withdrawn").length,
    successRate:
      userApplications.length > 0
        ? Math.round((userApplications.filter((app) => app.status === "accepted").length / userApplications.length) * 100)
        : 0,
  }

  return {
    applications: userApplications, // Return only user's applications
    loading,
    error,
    stats,
    isUsingRealData,
    updateApplicationStatus,
    withdrawApplication,
    refetch: fetchApplications,
  }
}
