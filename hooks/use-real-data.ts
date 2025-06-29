// Hooks that fetch real data but don't break existing components
"use client"

import {
  UserProfileService,
  PortfolioService,
  ReviewsService,
  DashboardService,
  SettingsService,
} from "@/lib/database-service"
import { useAuth } from "@/contexts/auth-context"
import { useState, useEffect } from "react"

// Hook for real profile data
export function useRealProfileData() {
  const { user } = useAuth()
  const [data, setData] = useState<{
    profile: any;
    portfolio: any[];
    reviews: any[];
    loading: boolean;
    error: any;
  }>({
    profile: null,
    portfolio: [],
    reviews: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    async function fetchData() {
      if (!user?.id) return

      try {
        setData((prev) => ({ ...prev, loading: true }))

        const [profile, portfolio, reviews] = await Promise.all([
          UserProfileService.getProfile(user.id),
          PortfolioService.getPortfolio(user.id),
          ReviewsService.getReviews(user.id),
        ])

        setData({
          profile,
          portfolio,
          reviews,
          loading: false,
          error: null,
        })

        // Log real data for comparison
        console.log("🔥 REAL DATA FETCHED:", { profile, portfolio, reviews })
      } catch (error) {
        console.error("Error fetching real profile data:", error)
        setData((prev) => ({ ...prev, loading: false, error }))
      }
    }

    fetchData()
  }, [user?.id])

  return data
}

// Hook for real dashboard data
export function useRealDashboardData() {
  const { user } = useAuth()
  const [data, setData] = useState<{
    stats: any;
    applications: any[];
    loading: boolean;
    error: any;
  }>({
    stats: null,
    applications: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    async function fetchData() {
      if (!user?.id) return

      try {
        setData((prev) => ({ ...prev, loading: true }))

        console.log("🔍 Dashboard Data Fetch - Starting for user:", user.id)

        // Use the same approach as the applications hook to avoid relationship issues
        const { supabase } = await import("@/lib/supabase")
        
        // Get applications where user is the freelancer (sent applications)
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
            response_date
          `)
          .eq("freelancer_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5)

        console.log("🔍 Dashboard - Sent applications query result:", {
          count: sentApplications?.length || 0,
          error: sentError,
          firstApp: sentApplications?.[0]
        })

        if (sentError) {
          console.error("❌ Error fetching sent applications:", sentError)
          throw sentError
        }

        // Get task information for sent applications
        const taskIds = sentApplications?.map(app => app.task_id).filter(Boolean) || []
        let tasksData: any[] = []
        
        console.log("🔍 Dashboard - Task IDs to fetch:", taskIds)
        
        if (taskIds.length > 0) {
          const { data: tasks, error: tasksError } = await supabase
            .from("tasks")
            .select("id, title, description, category, budget_min, budget_max, currency, client_id")
            .in("id", taskIds)
          
          console.log("🔍 Dashboard - Tasks query result:", {
            count: tasks?.length || 0,
            error: tasksError,
            firstTask: tasks?.[0]
          })
          
          if (tasksError) {
            console.error("❌ Error fetching tasks:", tasksError)
          } else {
            tasksData = tasks || []
          }
        }

        // Get client information for sent applications
        const clientIds = tasksData?.map(task => task.client_id).filter(Boolean) || []
        let clientsData: any[] = []
        
        console.log("🔍 Dashboard - Client IDs to fetch:", clientIds)
        
        if (clientIds.length > 0) {
          const { data: clients, error: clientsError } = await supabase
            .from("users")
            .select("id, name, email, avatar_url, rating, is_verified")
            .in("id", clientIds)
          
          console.log("🔍 Dashboard - Clients query result:", {
            count: clients?.length || 0,
            error: clientsError,
            firstClient: clients?.[0]
          })
          
          if (clientsError) {
            console.error("❌ Error fetching clients:", clientsError)
          } else {
            clientsData = clients || []
          }
        }

        // Transform sent applications
        const transformedApplications = (sentApplications || []).map((app: any) => {
          // Find the task data for this application
          const taskData = tasksData.find(task => task.id === app.task_id)
          // Find the client data for this task
          const clientData = clientsData.find(client => client.id === taskData?.client_id)
          
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
            task: taskData ? {
              id: taskData.id,
              title: taskData.title,
              description: taskData.description,
              category: taskData.category,
              budget_min: taskData.budget_min,
              budget_max: taskData.budget_max,
              currency: taskData.currency,
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

        console.log("🔍 Dashboard - Transformed applications:", {
          count: transformedApplications.length,
          firstApp: transformedApplications[0]
        })

        // Get stats
        const stats = await DashboardService.getStats(user.id)

        console.log("🔍 Dashboard - Stats result:", stats)

        setData({
          stats,
          applications: transformedApplications,
          loading: false,
          error: null,
        })

        // Log real data for comparison
        console.log("🔥 REAL DASHBOARD DATA:", { stats, applications: transformedApplications })
      } catch (error) {
        console.error("Error fetching real dashboard data:", error)
        setData((prev) => ({ ...prev, loading: false, error }))
      }
    }

    fetchData()
  }, [user?.id])

  return data
}

// Hook for real settings data
export function useRealSettingsData() {
  const { user } = useAuth()
  const [data, setData] = useState<{
    notifications: any;
    privacy: any;
    loading: boolean;
    error: any;
  }>({
    notifications: null,
    privacy: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    async function fetchData() {
      if (!user?.id) return

      try {
        setData((prev) => ({ ...prev, loading: true }))

        const [notifications, privacy] = await Promise.all([
          SettingsService.getNotificationPreferences(user.id),
          SettingsService.getPrivacySettings(user.id),
        ])

        setData({
          notifications,
          privacy,
          loading: false,
          error: null,
        })

        // Log real data for comparison
        console.log("🔥 REAL SETTINGS DATA:", { notifications, privacy })
      } catch (error) {
        console.error("Error fetching real settings data:", error)
        setData((prev) => ({ ...prev, loading: false, error }))
      }
    }

    fetchData()
  }, [user?.id])

  return data
}
