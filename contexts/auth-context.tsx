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
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Error getting session:", error)
          setIsLoading(false)
          return
        }

        if (session?.user) {
          // User is authenticated, get their profile
          const profile = await UserProfileService.getProfile(session.user.id)
          
          if (profile) {
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
              portfolio: [],
            }
            setUser(userData)
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id)
        
        if (event === 'SIGNED_IN' && session?.user) {
          // User signed in, get their profile
          const profile = await UserProfileService.getProfile(session.user.id)
          
          if (profile) {
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
              portfolio: [],
            }
            setUser(userData)
          }
        } else if (event === 'SIGNED_OUT') {
          // User signed out
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

    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
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
