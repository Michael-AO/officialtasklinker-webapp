import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get user initials from a name string
 * @param name - The user's full name
 * @param maxLength - Maximum number of initials to return (default: 2)
 * @returns The user's initials (e.g., "JD" for "John Doe")
 */
export function getInitials(name: string | null | undefined, maxLength: number = 2): string {
  if (!name || typeof name !== 'string') {
    return 'U'
  }
  
  const trimmedName = name.trim()
  if (trimmedName.length === 0) {
    return 'U'
  }
  
  const words = trimmedName.split(' ').filter(word => word.length > 0)
  if (words.length === 0) {
    return 'U'
  }
  
  const initials = words
    .slice(0, maxLength)
    .map(word => word.charAt(0).toUpperCase())
    .join('')
  
  return initials || 'U'
}

// Verified email addresses that can post tasks
const VERIFIED_EMAILS = [
  "admin@tasklinkers.com",
  "michaelasereo@gmail.com", 
  "ceo@tasklinkers.com",
  "michael@tasklinkers.com"
]

/**
 * Check if an email address is verified to post tasks
 */
export function isVerifiedEmail(email: string): boolean {
  return VERIFIED_EMAILS.includes(email.toLowerCase())
}

/**
 * Get the list of verified emails (for admin purposes)
 */
export function getVerifiedEmails(): string[] {
  return [...VERIFIED_EMAILS]
}
