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
          setTimeout(() => reject(new Error("Auth initialization timeout")), 30000) // 30 second timeout
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
            
            // Set user state immediately
            const basicUserData: User = {
              id: session.user.id,
              email: session.user.email || "",
              name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "User",
              userType: (session.user.user_metadata?.user_type as "freelancer" | "client") || "client",
              avatar: session.user.user_metadata?.avatar_url || undefined,
              isVerified: session.user.email_confirmed_at ? true : false,
              joinDate: session.user.created_at || new Date().toISOString(),
              completedTasks: 0,
              rating: 0,
              skills: [],
              bio: "",
              portfolio: [],
            }
            setUser(basicUserData)
            setIsLoading(false) // Allow dashboard to render
            
            // Load profile in background
            UserProfileService.getProfile(session.user.id).then(profile => {
              if (profile) {
                setUser(prevUser => prevUser ? {
                  ...prevUser,
                  name: profile.name,
                  avatar: profile.avatar_url || prevUser.avatar,
                  isVerified: profile.is_verified,
                  dojahVerified: profile.dojah_verified,
                  joinDate: profile.join_date,
                  completedTasks: profile.completed_tasks,
                  rating: profile.rating,
                  skills: profile.skills || [],
                  bio: profile.bio || "",
                  location: profile.location || undefined,
                } : null)
              }
            }).catch(profileError => {
              console.warn("⚠️ Profile load error:", profileError)
            })
            
            // Load portfolio data asynchronously (non-blocking)
            setTimeout(async () => {
              try {
                console.log("📁 Loading portfolio data on sign in...")
                
                // Use the API endpoint instead of direct Supabase call
                const portfolioResponse = await fetch("/api/user/portfolio", {
                  method: "GET",
                  headers: {
                    "x-user-id": session.user.id,
                    "Content-Type": "application/json",
                  },
                })

                if (portfolioResponse.ok) {
                  const portfolioResult = await portfolioResponse.json()
                  
                  if (portfolioResult.success && portfolioResult.data) {
                    const portfolioData = portfolioResult.data.map((item: any) => ({
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
                  } else {
                    console.log("📁 No portfolio items found or API error")
                  }
                } else {
                  console.warn("⚠️ Portfolio API error:", portfolioResponse.status, portfolioResponse.statusText)
                  // Don't fail the entire auth initialization for portfolio errors
                }
              } catch (portfolioError) {
                console.warn("⚠️ Portfolio load error on sign in:", portfolioError)
                // Don't fail the entire auth initialization for portfolio errors
              }
            }, 200)
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
        
        // If it's a timeout error, try to get basic session info without portfolio
        if (error instanceof Error && error.message.includes("timeout")) {
          console.log("⏰ Auth timeout, trying fallback initialization...")
          try {
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user) {
              console.log("🔄 Fallback: Found session, setting basic user data")
              const basicUserData: User = {
                id: session.user.id,
                email: session.user.email || "",
                name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "User",
                userType: (session.user.user_metadata?.user_type as "freelancer" | "client") || "client",
                avatar: session.user.user_metadata?.avatar_url || undefined,
                isVerified: session.user.email_confirmed_at ? true : false,
                joinDate: session.user.created_at || new Date().toISOString(),
                completedTasks: 0,
                rating: 0,
                skills: [],
                bio: "",
                portfolio: [],
              }
              setUser(basicUserData)
            }
          } catch (fallbackError) {
            console.error("❌ Fallback initialization also failed:", fallbackError)
          }
        }
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
          // User signed in, set basic data immediately
          const basicUserData: User = {
            id: session.user.id,
            email: session.user.email || "",
            name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "User",
            userType: (session.user.user_metadata?.user_type as "freelancer" | "client") || "client",
            avatar: session.user.user_metadata?.avatar_url || undefined,
            isVerified: session.user.email_confirmed_at ? true : false,
            joinDate: session.user.created_at || new Date().toISOString(),
            completedTasks: 0,
            rating: 0,
            skills: [],
            bio: "",
            portfolio: [],
          }
          
          // Set user immediately
          setUser(basicUserData)
          
          // Load full profile data asynchronously (non-blocking)
          setTimeout(async () => {
            try {
              console.log("📋 Loading full profile data on sign in...")
              const profile = await UserProfileService.getProfile(session.user.id)
              
              if (profile) {
                console.log("✅ Full profile loaded on sign in")
                
                // Update user with full profile data
                setUser(prevUser => prevUser ? {
                  ...prevUser,
                  name: profile.name,
                  avatar: profile.avatar_url || prevUser.avatar,
                  isVerified: profile.is_verified,
                  joinDate: profile.join_date,
                  completedTasks: profile.completed_tasks,
                  rating: profile.rating,
                  skills: profile.skills || [],
                  bio: profile.bio || "",
                  location: profile.location || undefined,
                } : null)
              }
            } catch (profileError) {
              console.warn("⚠️ Profile load error on sign in:", profileError)
            }
          }, 100)
          
          // Load portfolio data asynchronously (non-blocking)
          setTimeout(async () => {
            try {
              console.log("📁 Loading portfolio data on sign in...")
              
              // Use the API endpoint instead of direct Supabase call
              const portfolioResponse = await fetch("/api/user/portfolio", {
                method: "GET",
                headers: {
                  "x-user-id": session.user.id,
                  "Content-Type": "application/json",
                },
              })

              if (portfolioResponse.ok) {
                const portfolioResult = await portfolioResponse.json()
                
                if (portfolioResult.success && portfolioResult.data) {
                  const portfolioData = portfolioResult.data.map((item: any) => ({
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
                } else {
                  console.log("📁 No portfolio items found or API error")
                }
              } else {
                console.warn("⚠️ Portfolio API error:", portfolioResponse.status)
              }
            } catch (portfolioError) {
              console.warn("⚠️ Portfolio load error on sign in:", portfolioError)
            }
          }, 200)
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

  const updateProfile = async (updates: Partial<User> & { verification_type?: string }) => {
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
          skills: updates.skills || user.skills,
          avatar_url: updates.avatar || user.avatar,
          // Pass is_verified and verification_type if present
          ...(typeof updates.isVerified === "boolean" ? { is_verified: updates.isVerified } : {}),
          ...(updates.verification_type ? { verification_type: updates.verification_type } : {}),
        }),
      })

      console.log("📡 Profile update response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Profile update response error:", errorText)

        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: `HTTP ${response.status}: ${errorText}` }
        }

        throw new Error(errorData.error || `Failed to update profile: ${response.status}`)
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

  const refreshPortfolio = async () => {
    if (!user) return

    try {
      console.log("🔄 Refreshing portfolio...")

      // Use the API endpoint instead of direct Supabase call
      const portfolioResponse = await fetch("/api/user/portfolio", {
        method: "GET",
        headers: {
          "x-user-id": user.id,
          "Content-Type": "application/json",
        },
      })

      if (portfolioResponse.ok) {
        const portfolioResult = await portfolioResponse.json()
        
        if (portfolioResult.success && portfolioResult.data) {
          const portfolioData = portfolioResult.data.map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            image: item.image_url || item.file_url || "/placeholder.svg",
            url: item.project_url,
          }))
          console.log("📁 Portfolio refreshed:", portfolioData.length, "items")
          
          // Update user with portfolio data
          setUser(prevUser => prevUser ? {
            ...prevUser,
            portfolio: portfolioData
          } : null)
        } else {
          console.log("📁 No portfolio items found or API error")
        }
      } else {
        console.warn("⚠️ Portfolio API error:", portfolioResponse.status)
      }
    } catch (error) {
      console.warn("⚠️ Portfolio refresh error:", error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, signOut, updateProfile, refreshPortfolio, isLoading }}>
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
