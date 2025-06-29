"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { UserProfileService } from "@/lib/database-service"

export interface User {
  id: string
  email: string
  name: string
  userType: "freelancer" | "client"
  avatar?: string
  isVerified: boolean
  joinDate: string
  completedTasks: number
  rating: number
  skills: string[]
  bio: string
  location?: string
  hourlyRate?: number
  portfolio?: Array<{
    id: string
    title: string
    description: string
    image: string
    url?: string
  }>
}

interface AuthContextType {
  user: User | null
  login: (user: User) => Promise<void>
  logout: () => void
  signOut: () => void
  updateProfile: (updates: Partial<User>) => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialize auth state from Supabase session
    const initializeAuth = async () => {
      try {
        console.log("🔄 Initializing auth state...")
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Auth initialization timeout")), 10000) // 10 second timeout
        })
        
        const authPromise = (async () => {
          // Get current session
          const { data: { session }, error } = await supabase.auth.getSession()
          
          if (error) {
            console.error("❌ Error getting session:", error)
            setIsLoading(false)
            return
          }

          console.log("📋 Session check result:", session ? "Session found" : "No session")

          if (session?.user) {
            console.log("👤 User found in session:", session.user.id)
            
            // User is authenticated, get their profile
            const profile = await UserProfileService.getProfile(session.user.id)
            
            if (profile) {
              console.log("✅ User profile loaded successfully")
              
              // Create user data first without portfolio
              const userData: User = {
                id: profile.id,
                email: profile.email,
                name: profile.name,
                userType: profile.user_type as "freelancer" | "client",
                avatar: profile.avatar_url || undefined,
                isVerified: profile.is_verified,
                joinDate: profile.join_date,
                completedTasks: profile.completed_tasks,
                rating: profile.rating,
                skills: profile.skills || [],
                bio: profile.bio || "",
                location: profile.location || undefined,
                hourlyRate: profile.hourly_rate || undefined,
                portfolio: [], // Start with empty portfolio
              }
              
              // Set user immediately to prevent loading state
              setUser(userData)
              
              // Load portfolio data asynchronously (non-blocking)
              try {
                console.log("📁 Loading portfolio data...")
                const { data: portfolio, error: portfolioError } = await supabase
                  .from("portfolio_items")
                  .select("*")
                  .eq("user_id", session.user.id)
                  .order("is_featured", { ascending: false })
                  .order("created_at", { ascending: false })

                if (!portfolioError && portfolio) {
                  const portfolioData = portfolio.map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    image: item.image_url || item.file_url || "/placeholder.svg",
                    url: item.project_url,
                  }))
                  console.log("📁 Portfolio loaded:", portfolioData.length, "items")
                  
                  // Update user with portfolio data
                  setUser(prevUser => prevUser ? {
                    ...prevUser,
                    portfolio: portfolioData
                  } : null)
                } else if (portfolioError && portfolioError.code !== "42P01") {
                  console.warn("⚠️ Portfolio load warning:", portfolioError.message)
                }
              } catch (portfolioError) {
                console.warn("⚠️ Portfolio load error:", portfolioError)
              }
            } else {
              console.log("⚠️ No profile found for user, but session exists")
            }
          } else {
            console.log("ℹ️ No active session found")
          }
        })()
        
        // Race between auth initialization and timeout
        await Promise.race([authPromise, timeoutPromise])
        
      } catch (error) {
        console.error("❌ Error initializing auth:", error)
        // Set loading to false even if there's an error
        setIsLoading(false)
      } finally {
        console.log("✅ Auth initialization complete")
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔄 Auth state changed:", event, session?.user?.id)
        
        if (event === 'SIGNED_IN' && session?.user) {
          // User signed in, get their profile
          const profile = await UserProfileService.getProfile(session.user.id)
          
          if (profile) {
            // Create user data first without portfolio
            const userData: User = {
              id: profile.id,
              email: profile.email,
              name: profile.name,
              userType: profile.user_type as "freelancer" | "client",
              avatar: profile.avatar_url || undefined,
              isVerified: profile.is_verified,
              joinDate: profile.join_date,
              completedTasks: profile.completed_tasks,
              rating: profile.rating,
              skills: profile.skills || [],
              bio: profile.bio || "",
              location: profile.location || undefined,
              hourlyRate: profile.hourly_rate || undefined,
              portfolio: [], // Start with empty portfolio
            }
            
            // Set user immediately
            setUser(userData)
            
            // Load portfolio data asynchronously (non-blocking)
            try {
              const { data: portfolio, error: portfolioError } = await supabase
                .from("portfolio_items")
                .select("*")
                .eq("user_id", session.user.id)
                .order("is_featured", { ascending: false })
                .order("created_at", { ascending: false })

              if (!portfolioError && portfolio) {
                const portfolioData = portfolio.map((item: any) => ({
                  id: item.id,
                  title: item.title,
                  description: item.description,
                  image: item.image_url || item.file_url || "/placeholder.svg",
                  url: item.project_url,
                }))
                console.log("📁 Portfolio loaded on sign in:", portfolioData.length, "items")
                
                // Update user with portfolio data
                setUser(prevUser => prevUser ? {
                  ...prevUser,
                  portfolio: portfolioData
                } : null)
              }
            } catch (portfolioError) {
              console.warn("⚠️ Portfolio load error on sign in:", portfolioError)
            }
          }
        } else if (event === 'SIGNED_OUT') {
          // User signed out
          console.log("👋 User signed out")
          setUser(null)
        } else if (event === 'TOKEN_REFRESHED') {
          console.log("🔄 Token refreshed")
          // Optionally refresh user data here if needed
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (userData: User) => {
    setUser(userData)
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  const signOut = () => {
    logout()
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return

    try {
      console.log("🔄 Updating profile with:", updates)

      // Call the profile update API
      const response = await fetch("/api/user/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "user-id": user.id,
        },
        body: JSON.stringify({
          name: updates.name || user.name,
          bio: updates.bio || user.bio,
          location: updates.location || user.location,
          hourly_rate: updates.hourlyRate || user.hourlyRate,
          skills: updates.skills || user.skills,
          avatar_url: updates.avatar || user.avatar,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update profile")
      }

      const result = await response.json()
      console.log("✅ Profile updated successfully:", result)

      // Update local state
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
    } catch (error) {
      console.error("❌ Profile update error:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, signOut, updateProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
