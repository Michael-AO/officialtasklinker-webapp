"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

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
  updateProfile: (updates: Partial<User>) => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user data on mount
    try {
      const storedUser = localStorage.getItem("tasklinkers_user")
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
      }
    } catch (error) {
      console.error("Error loading user from localStorage:", error)
      localStorage.removeItem("tasklinkers_user")
    }
    setIsLoading(false)
  }, [])

  const login = async (userData: User) => {
    try {
      setUser(userData)
      localStorage.setItem("tasklinkers_user", JSON.stringify(userData))
    } catch (error) {
      console.error("Error saving user to localStorage:", error)
      throw new Error("Failed to save user data")
    }
  }

  const logout = () => {
    try {
      setUser(null)
      localStorage.removeItem("tasklinkers_user")
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return

    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    localStorage.setItem("tasklinkers_user", JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile, isLoading }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
