"use client"

import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Shield, 
  User, 
  Building,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"

export type VerificationStatus = 
  | "verified" 
  | "pending" 
  | "rejected" 
  | "unverified" 
  | "processing"

export type VerificationType = "identity" | "business" | "professional"

interface VerificationStatusBadgeProps {
  status: VerificationStatus
  type?: VerificationType
  size?: "sm" | "md" | "lg"
  showIcon?: boolean
  className?: string
}

const statusConfig = {
  verified: {
    label: "Verified",
    variant: "default" as const,
    icon: CheckCircle,
    className: "bg-green-100 text-green-800 border-green-200",
    iconClassName: "text-green-600"
  },
  pending: {
    label: "Pending Review",
    variant: "secondary" as const,
    icon: Clock,
    className: "bg-amber-100 text-amber-800 border-amber-200",
    iconClassName: "text-amber-600"
  },
  rejected: {
    label: "Rejected",
    variant: "destructive" as const,
    icon: AlertTriangle,
    className: "bg-red-100 text-red-800 border-red-200",
    iconClassName: "text-red-600"
  },
  unverified: {
    label: "Not Verified",
    variant: "outline" as const,
    icon: Shield,
    className: "bg-gray-100 text-gray-600 border-gray-200",
    iconClassName: "text-gray-500"
  },
  processing: {
    label: "Processing",
    variant: "secondary" as const,
    icon: Loader2,
    className: "bg-blue-100 text-blue-800 border-blue-200",
    iconClassName: "text-blue-600 animate-spin"
  }
}

const typeConfig = {
  identity: {
    label: "Identity",
    icon: User,
    className: "bg-blue-50 text-blue-700 border-blue-200"
  },
  business: {
    label: "Business",
    icon: Building,
    className: "bg-purple-50 text-purple-700 border-purple-200"
  },
  professional: {
    label: "Professional",
    icon: Shield,
    className: "bg-indigo-50 text-indigo-700 border-indigo-200"
  }
}

export function VerificationStatusBadge({
  status,
  type,
  size = "md",
  showIcon = true,
  className
}: VerificationStatusBadgeProps) {
  const config = statusConfig[status]
  const typeInfo = type ? typeConfig[type] : null

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2"
  }

  const IconComponent = config.icon

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant={config.variant}
        className={cn(
          "flex items-center gap-1.5 border font-medium",
          sizeClasses[size],
          config.className,
          className
        )}
      >
        {showIcon && (
          <IconComponent 
            className={cn("h-3 w-3", config.iconClassName)} 
          />
        )}
        <span>{config.label}</span>
      </Badge>
      
      {typeInfo && (
        <Badge
          variant="outline"
          className={cn(
            "flex items-center gap-1.5 text-xs px-2 py-1",
            typeInfo.className
          )}
        >
          <typeInfo.icon className="h-3 w-3" />
          <span>{typeInfo.label}</span>
        </Badge>
      )}
    </div>
  )
}
