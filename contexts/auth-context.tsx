"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { getCurrentUser, logout as logoutHelper, type AuthUser } from "@/lib/auth-helpers"

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error("Failed to refresh user:", error)
      setUser(null)
    }
  }

  useEffect(() => {
    // Initialize auth state from server session
    const initializeAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("Error initializing auth:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Set up periodic session check (every 5 minutes)
    // This ensures the UI stays in sync with server session state
    const intervalId = setInterval(async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("Session check failed:", error)
        setUser(null)
      }
    }, 5 * 60 * 1000) // 5 minutes

    // Cleanup interval on unmount
    return () => {
      clearInterval(intervalId)
    }
  }, [])

  const logout = async () => {
    try {
      await logoutHelper()
      setUser(null)
      // Redirect is handled by logout helper
    } catch (error) {
      console.error("Logout error:", error)
      // Even if logout fails, clear local state and redirect
      setUser(null)
      window.location.href = "/login"
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
