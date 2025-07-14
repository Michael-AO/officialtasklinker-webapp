import { Check } from "lucide-react"
import { Badge } from "./badge"

interface VerifiedBadgeProps {
  className?: string
  size?: "sm" | "md"
}

export function VerifiedBadge({ className = "", size = "sm" }: VerifiedBadgeProps) {
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5"
  
  return (
    <div className={`${iconSize} relative ${className}`}>
      {/* Zigzag border effect */}
      <div className="absolute inset-0 bg-green-500 rounded-full" />
      <div className="absolute inset-0.5 bg-white rounded-full" />
      <div className="absolute inset-1 bg-green-500 rounded-full flex items-center justify-center">
        <Check className="h-2.5 w-2.5 text-white" />
      </div>
    </div>
  )
} 