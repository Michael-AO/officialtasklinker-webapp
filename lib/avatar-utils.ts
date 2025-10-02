/**
 * Avatar utilities for handling default avatars
 */

// List of default avatar images available
export const DEFAULT_AVATARS = [
  '/placeholder-user.jpg',
  '/default-avatar-1.svg',
  '/default-avatar-2.svg', 
  '/default-avatar-3.svg',
  '/default-avatar-4.svg',
  '/default-avatar-5.svg',
]

/**
 * Get a default avatar URL based on user ID
 * This ensures the same user always gets the same default avatar
 */
export function getDefaultAvatar(userId: string): string {
  if (!userId) return DEFAULT_AVATARS[0]
  
  // Use user ID to consistently pick the same avatar
  const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % DEFAULT_AVATARS.length
  return DEFAULT_AVATARS[index]
}

/**
 * Get avatar URL with fallback to default
 */
export function getAvatarUrl(avatarUrl: string | null | undefined, userId: string): string {
  if (avatarUrl && avatarUrl.trim() !== '') {
    return avatarUrl
  }
  return getDefaultAvatar(userId)
}

/**
 * Get user initials from name
 */
export function getInitials(name: string): string {
  if (!name || name.trim() === '') return 'U'
  
  const words = name.trim().split(/\s+/)
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase()
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
}
