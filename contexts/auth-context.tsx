"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { UserProfileService } from "@/lib/database-service"

export interface User {
  id: string
  email: string
  name: string
  userType: "freelancer" | "client" | "admin"
  avatar?: string
  isVerified: boolean
  dojahVerified?: boolean
  verification_type?: "identity" | "business" | "professional" | "admin"
  joinDate: string
  completedTasks: number
  rating: number
  skills: string[]
  bio: string
  location?: string
  hourlyRate?: number
  profile_completion?: number
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
  refreshPortfolio: () => Promise<void>
  refreshUserVerification: () => Promise<void>
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
          
          // Load user profile from database
          const profile = await UserProfileService.getProfile(session.user.id)
          
          if (profile) {
            // Use database profile as source of truth
            const userData: User = {
              id: profile.id,
              email: profile.email,
              name: profile.name,
              userType: profile.user_type as "freelancer" | "client" | "admin",
              avatar: profile.avatar_url || undefined,
              isVerified: profile.is_verified || false,
              dojahVerified: profile.dojah_verified || false,
              verification_type: profile.verification_type as "identity" | "business" | "professional" | "admin" | undefined,
              joinDate: profile.join_date || session.user.created_at || new Date().toISOString(),
              completedTasks: profile.completed_tasks || 0,
              rating: profile.rating || 0,
              skills: profile.skills || [],
              bio: profile.bio || "",
              location: profile.location || undefined,
              hourlyRate: profile.hourly_rate || undefined,
              profile_completion: profile.profile_completion || 0,
              portfolio: [], // Load portfolio separately
            }
            setUser(userData)
            
            // Load portfolio in background
            setTimeout(async () => {
              try {
                const portfolio = await UserProfileService.getPortfolio(session.user.id)
                if (portfolio) {
                  setUser(prevUser => prevUser ? {
                    ...prevUser,
                    portfolio: portfolio
                  } : null)
                }
              } catch (portfolioError) {
                console.warn("⚠️ Portfolio load error:", portfolioError)
              }
            }, 500)
          } else {
            console.warn("⚠️ No profile found for user:", session.user.id)
          }
        } else {
          console.log("ℹ️ No active session found")
        }
      } catch (error) {
        console.error("❌ Error initializing auth:", error)
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
          // User signed in, load profile
          const profile = await UserProfileService.getProfile(session.user.id)
          
          if (profile) {
            const userData: User = {
              id: profile.id,
              email: profile.email,
              name: profile.name,
              userType: profile.user_type as "freelancer" | "client" | "admin",
              avatar: profile.avatar_url || undefined,
              isVerified: profile.is_verified || false,
              dojahVerified: profile.dojah_verified || false,
              verification_type: profile.verification_type as "identity" | "business" | "professional" | "admin" | undefined,
              joinDate: profile.join_date || session.user.created_at || new Date().toISOString(),
              completedTasks: profile.completed_tasks || 0,
              rating: profile.rating || 0,
              skills: profile.skills || [],
              bio: profile.bio || "",
              location: profile.location || undefined,
              hourlyRate: profile.hourly_rate || undefined,
              profile_completion: profile.profile_completion || 0,
              portfolio: [],
            }
            setUser(userData)
            
            // Load portfolio
            try {
              const portfolio = await UserProfileService.getPortfolio(session.user.id)
              if (portfolio) {
                setUser(prevUser => prevUser ? {
                  ...prevUser,
                  portfolio: portfolio
                } : null)
              }
            } catch (portfolioError) {
              console.warn("⚠️ Portfolio load error on sign in:", portfolioError)
            }
          }
        } else if (event === 'SIGNED_OUT') {
          // User signed out, clear state
          setUser(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (userData: User) => {
    setUser(userData)
    // Store in localStorage for persistence
    localStorage.setItem('tasklinkers_user', JSON.stringify(userData))
  }

  const logout = async () => {
    setUser(null)
    localStorage.removeItem('tasklinkers_user')
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    localStorage.removeItem('tasklinkers_user')
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return

    try {
      // Update user in database
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)

      if (error) {
        console.error('Error updating profile:', error)
        throw error
      }

      // Update local state
      setUser(prevUser => prevUser ? { ...prevUser, ...updates } : null)
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  const refreshPortfolio = async () => {
    if (!user) return

    try {
      const portfolio = await UserProfileService.getPortfolio(user.id)
      setUser(prevUser => prevUser ? {
        ...prevUser,
        portfolio: portfolio || []
      } : null)
    } catch (error) {
      console.error('Error refreshing portfolio:', error)
    }
  }

  const refreshUserVerification = async () => {
    if (!user) return

    try {
      const profile = await UserProfileService.getProfile(user.id)
      if (profile) {
        setUser(prevUser => prevUser ? {
          ...prevUser,
          isVerified: profile.is_verified || false,
          dojahVerified: profile.dojah_verified || false,
          verification_type: profile.verification_type as "identity" | "business" | "professional" | "admin" | undefined,
        } : null)
      }
    } catch (error) {
      console.error('Error refreshing verification:', error)
    }
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    signOut,
    updateProfile,
    refreshPortfolio,
    refreshUserVerification,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
