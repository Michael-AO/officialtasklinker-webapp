"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"

export function usePinStatus() {
  const { user } = useAuth()
  const [hasPinSetup, setHasPinSetup] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const checkPinStatus = async () => {
    if (!user?.id) {
      setIsLoading(false)
      return false
    }

    try {
      const response = await fetch(`/api/user/pin?user_id=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        const pinStatus = data.hasPinSetup
        setHasPinSetup(pinStatus)
        setIsLoading(false)
        return pinStatus
      }
    } catch (error) {
      console.error("Failed to check PIN status:", error)
    }

    setIsLoading(false)
    return false
  }

  const refreshPinStatus = async () => {
    setIsLoading(true)
    return await checkPinStatus()
  }

  useEffect(() => {
    checkPinStatus()
  }, [user?.id])

  return {
    hasPinSetup,
    isLoading,
    refreshPinStatus,
    setHasPinSetup,
  }
}
