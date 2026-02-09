"use client"

import { useAuth } from "@/contexts/auth-context"
import { useState, useEffect } from "react"

/**
 * Dashboard data via API only - no Supabase/database-service imports
 * so the client bundle never loads @supabase/realtime-js (avoids webpack .call error).
 */
export function useRealDashboardData() {
  const { user } = useAuth()
  const [data, setData] = useState<{
    stats: any
    applications: any[]
    loading: boolean
    error: any
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

        const [statsRes, applicationsRes] = await Promise.all([
          fetch("/api/user/stats", { credentials: "include" }),
          fetch("/api/applications/recent", { credentials: "include" }),
        ])

        const statsJson = await statsRes.json()
        const applicationsJson = await applicationsRes.json()

        const stats = statsJson.success ? statsJson.data : null
        const rawApplications = applicationsJson.success ? (applicationsJson.applications || []) : []

        const transformedApplications = rawApplications.map((app: any) => ({
          id: app.id,
          task_id: app.task_id,
          freelancer_id: user.id,
          proposed_budget: app.proposed_budget,
          budget_type: "fixed",
          estimated_duration: "",
          cover_letter: app.cover_letter,
          attachments: [],
          status: app.status,
          applied_date: app.applied_date,
          response_date: null,
          created_at: app.applied_date,
          updated_at: app.applied_date,
          task: {
            id: app.task_id,
            title: app.task_title,
            description: "",
            category: "",
            budget_min: app.task_budget_min,
            budget_max: app.task_budget_max,
            currency: "NGN",
            client: {
              id: "unknown",
              name: app.client_name || "Unknown Client",
              email: app.client_email || "",
              avatar_url: undefined,
              rating: 0,
              is_verified: false,
            },
          },
          freelancer: {
            id: user.id,
            name: user.name ?? "",
            email: user.email ?? "",
            avatar_url: (user as any).avatar,
            rating: (user as any).rating || 0,
            completed_tasks: (user as any).completedTasks || 0,
            skills: (user as any).skills || [],
            is_verified: user.isVerified || false,
          },
        }))

        setData({
          stats,
          applications: transformedApplications,
          loading: false,
          error: null,
        })
      } catch (error) {
        console.error("Error fetching real dashboard data:", error)
        setData((prev) => ({ ...prev, loading: false, error }))
      }
    }

    fetchData()
  }, [user?.id, user?.name, user?.email, user?.isVerified])

  return data
}
