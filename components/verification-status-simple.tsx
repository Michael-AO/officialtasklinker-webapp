"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, CheckCircle, Clock, XCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface VerificationStatus {
  status: "verified" | "pending" | "unverified" | "rejected"
  type?: string
  last_updated?: string
}

export function VerificationStatusSimple() {
  const { user } = useAuth()
  const [status, setStatus] = useState<VerificationStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchVerificationStatus()
    }
  }, [user])

  const fetchVerificationStatus = async () => {
    try {
      if (!user) return
      
      const response = await fetch("/api/verification/status", {
        headers: {
          'x-user-id': user.id
        }
      })
      const data = await response.json()
      setStatus(data.status)
    } catch (error) {
      console.error("Failed to fetch verification status:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">Loading verification status...</div>
        </CardContent>
      </Card>
    )
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "verified":
        return {
          icon: CheckCircle,
          color: "text-green-500",
          badge: "default",
          title: "Verified",
          description: "Your identity has been successfully verified"
        }
      case "pending":
        return {
          icon: Clock,
          color: "text-yellow-500",
          badge: "secondary",
          title: "Under Review",
          description: "Our AI system is reviewing your documents"
        }
      case "rejected":
        return {
          icon: XCircle,
          color: "text-red-500",
          badge: "destructive",
          title: "Verification Failed",
          description: "Please check the reason and resubmit"
        }
      default:
        return {
          icon: Shield,
          color: "text-gray-500",
          badge: "outline",
          title: "Not Verified",
          description: "Complete verification to access all features"
        }
    }
  }

  const config = getStatusConfig(status?.status || "unverified")
  const StatusIcon = config.icon

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-${config.color.replace('text-', '')}/10`}>
              <StatusIcon className={`h-6 w-6 ${config.color}`} />
            </div>
            <div>
              <h3 className="font-semibold">{config.title}</h3>
              <p className="text-sm text-muted-foreground">{config.description}</p>
              {status?.last_updated && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last updated: {new Date(status.last_updated).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <Badge variant={config.badge as any}>
            {config.title}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
