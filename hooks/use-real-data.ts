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
  const [data, setData] = useState({
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
  const [data, setData] = useState({
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

        const [stats, applications] = await Promise.all([
          DashboardService.getStats(user.id),
          DashboardService.getRecentApplications(user.id),
        ])

        setData({
          stats,
          applications,
          loading: false,
          error: null,
        })

        // Log real data for comparison
        console.log("🔥 REAL DASHBOARD DATA:", { stats, applications })
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
  const [data, setData] = useState({
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
