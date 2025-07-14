import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
