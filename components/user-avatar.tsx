"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials, getAvatarUrl } from "@/lib/avatar-utils"

interface UserAvatarProps {
  user: {
    id: string
    name?: string | null
    avatar?: string | null
  }
  className?: string
  fallbackClassName?: string
}

export function UserAvatar({ user, className, fallbackClassName }: UserAvatarProps) {
  const avatarUrl = getAvatarUrl(user.avatar, user.id)
  const initials = getInitials(user.name || "User")

  return (
    <Avatar className={className}>
      <AvatarImage 
        src={avatarUrl} 
        alt={user.name || "User"} 
        onError={(e) => {
          // If the default avatar fails to load, hide the image to show fallback
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
        }}
      />
      <AvatarFallback className={fallbackClassName}>
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
