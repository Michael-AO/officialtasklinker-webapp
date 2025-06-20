import { supabase } from "./supabaseClient"
import type { Database } from "@/types/supabase"

type Tables = Database["public"]["Tables"]
type User = Tables["users"]["Row"]

// Enhanced Database Service that handles missing user profiles
export class DatabaseService {
  // Get or create user profile from Supabase Auth
  static async getOrCreateUserProfile(authUser: any): Promise<User | null> {
    if (!authUser?.id) return null

    try {
      // First, try to get existing user profile
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single()

      if (existingUser && !fetchError) {
        console.log("✅ Found existing user profile:", existingUser)
        return existingUser
      }

      // If user doesn't exist, create from auth data
      console.log("🔄 Creating user profile from auth data...")

      const newUserData: Tables["users"]["Insert"] = {
        id: authUser.id,
        email: authUser.email,
        name:
          `${authUser.user_metadata?.first_name || ""} ${authUser.user_metadata?.last_name || ""}`.trim() ||
          authUser.email.split("@")[0],
        user_type: authUser.user_metadata?.user_type || "freelancer",
        avatar_url: authUser.user_metadata?.avatar_url || null,
        is_verified: authUser.email_confirmed_at ? true : false,
        phone: authUser.user_metadata?.phone || null,
        bio: null,
        location: null,
        hourly_rate: null,
        skills: [],
        rating: 0,
        completed_tasks: 0,
        total_earned: 0,
        join_date: authUser.created_at || new Date().toISOString(),
        last_active: new Date().toISOString(),
        is_active: true,
      }

      const { data: newUser, error: createError } = await supabase.from("users").insert(newUserData).select().single()

      if (createError) {
        console.error("❌ Error creating user profile:", createError)
        throw createError
      }

      console.log("✅ Created new user profile:", newUser)

      // Also create default settings
      await this.createDefaultSettings(newUser.id)

      return newUser
    } catch (error) {
      console.error("❌ Error in getOrCreateUserProfile:", error)
      return null
    }
  }

  // Create default settings for new user
  static async createDefaultSettings(userId: string) {
    try {
      // Create default notification preferences
      await supabase.from("user_notification_preferences").upsert({
        user_id: userId,
        email_new_tasks: true,
        email_messages: true,
        email_payments: true,
        email_task_updates: true,
        push_notifications: true,
        browser_notifications: false,
        weekly_digest: false,
        marketing_emails: false,
      })

      // Create default privacy settings
      await supabase.from("user_privacy_settings").upsert({
        user_id: userId,
        profile_visible: true,
        show_earnings: false,
        show_location: true,
        show_last_active: true,
        allow_search_engines: true,
        discoverable_by_email: false,
        data_sharing: false,
        analytics_tracking: true,
      })

      console.log("✅ Created default settings for user:", userId)
    } catch (error) {
      console.error("❌ Error creating default settings:", error)
    }
  }
}

// User Profile Service
export class UserProfileService {
  static async getProfile(userId: string): Promise<User | null> {
    try {
      // Get current auth user
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        console.log("❌ No authenticated user found")
        return null
      }

      // Get or create user profile
      const profile = await DatabaseService.getOrCreateUserProfile(authUser)
      return profile
    } catch (error) {
      console.error("❌ Error getting profile:", error)
      return null
    }
  }

  static async updateProfile(userId: string, updates: Tables["users"]["Update"]): Promise<User | null> {
    try {
      const { data, error } = await supabase.from("users").update(updates).eq("id", userId).select().single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("❌ Error updating profile:", error)
      return null
    }
  }
}

// Portfolio Service
export class PortfolioService {
  static async getPortfolio(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("portfolio_items")
        .select("*")
        .eq("user_id", userId)
        .order("is_featured", { ascending: false })

      if (error && error.code !== "42P01") {
        // Ignore table doesn't exist error
        throw error
      }

      return data || []
    } catch (error) {
      console.error("❌ Error getting portfolio:", error)
      return []
    }
  }
}

// Reviews Service
export class ReviewsService {
  static async getReviews(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("user_reviews")
        .select(`
          *,
          reviewer:users!reviewer_id(name, avatar_url)
        `)
        .eq("reviewee_id", userId)
        .order("created_at", { ascending: false })

      if (error && error.code !== "42P01") {
        // Ignore table doesn't exist error
        throw error
      }

      return data || []
    } catch (error) {
      console.error("❌ Error getting reviews:", error)
      return []
    }
  }
}

// Dashboard Service
export class DashboardService {
  static async getStats(userId: string): Promise<any> {
    try {
      // Get user profile first
      const profile = await UserProfileService.getProfile(userId)

      if (!profile) {
        return {
          activeTasks: 0,
          pendingApplications: 0,
          totalEarnings: 0,
          completionRate: 0,
          completedTasks: 0,
        }
      }

      // Get active tasks count
      const { count: activeTasks } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("client_id", userId)
        .in("status", ["active", "in_progress"])

      // Get pending applications count
      const { count: pendingApplications } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("freelancer_id", userId)
        .eq("status", "pending")

      return {
        activeTasks: activeTasks || 0,
        pendingApplications: pendingApplications || 0,
        totalEarnings: profile.total_earned || 0,
        completionRate: profile.rating ? (profile.rating / 5) * 100 : 0,
        completedTasks: profile.completed_tasks || 0,
      }
    } catch (error) {
      console.error("❌ Error getting dashboard stats:", error)
      return {
        activeTasks: 0,
        pendingApplications: 0,
        totalEarnings: 0,
        completionRate: 0,
        completedTasks: 0,
      }
    }
  }

  static async getRecentApplications(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select(`
          *,
          freelancer:users!freelancer_id(name, avatar_url, rating),
          task:tasks!task_id(title)
        `)
        .eq("task.client_id", userId)
        .eq("status", "pending")
        .order("applied_date", { ascending: false })
        .limit(5)

      if (error && error.code !== "42P01") {
        throw error
      }

      return data || []
    } catch (error) {
      console.error("❌ Error getting recent applications:", error)
      return []
    }
  }
}

// Settings Service
export class SettingsService {
  static async getNotificationPreferences(userId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from("user_notification_preferences")
        .select("*")
        .eq("user_id", userId)
        .single()

      if (error && error.code === "PGRST116") {
        // No record found, create default
        await DatabaseService.createDefaultSettings(userId)
        return await this.getNotificationPreferences(userId)
      }

      if (error && error.code !== "42P01") {
        throw error
      }

      return data
    } catch (error) {
      console.error("❌ Error getting notification preferences:", error)
      return null
    }
  }

  static async getPrivacySettings(userId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase.from("user_privacy_settings").select("*").eq("user_id", userId).single()

      if (error && error.code === "PGRST116") {
        // No record found, create default
        await DatabaseService.createDefaultSettings(userId)
        return await this.getPrivacySettings(userId)
      }

      if (error && error.code !== "42P01") {
        throw error
      }

      return data
    } catch (error) {
      console.error("❌ Error getting privacy settings:", error)
      return null
    }
  }
}
