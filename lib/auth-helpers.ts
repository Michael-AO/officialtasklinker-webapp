/**
 * Authentication Helper Functions (Client-Side)
 * Enhanced with server-side magic links, rate limiting, and audit logging
 * No Supabase client import - uses fetch to API only (avoids realtime/webpack crash on dashboard).
 */

export interface AuthUser {
  id: string
  email: string
  user_type: 'freelancer' | 'client' | 'admin'
  name: string | null
  is_verified: boolean
  /** Set by API for frontend; demo override when NEXT_PUBLIC_DEMO_VERIFIED_EMAIL matches */
  isVerified?: boolean
  /** Profile picture URL; synced from DB so header/sidebar update in real time after profile edit */
  avatar?: string | null
  /** Optional profile fields (from /api/user/profile or session); used by profile edit */
  bio?: string | null
  location?: string | null
  skills?: string[]
}

export interface SendMagicLinkResponse {
  success: boolean
  message?: string
  error?: string
  errorCode?: string
  expiresIn?: string
}

/**
 * Send Magic Link via server-side API
 * Enhanced with rate limiting and validation
 */
export async function sendMagicLink(
  email: string,
  userType: 'freelancer' | 'client' | 'admin' = 'freelancer'
): Promise<SendMagicLinkResponse> {
  try {
    const response = await fetch('/api/auth/send-magic-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.toLowerCase(),
        user_type: userType,
        type: 'login'
      }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Send magic link error:', error)
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.',
      errorCode: 'NETWORK_ERROR'
    }
  }
}

/**
 * Sign up new user with magic link
 * Enhanced with server-side validation
 */
export async function signUpWithMagicLink(
  email: string,
  firstName: string,
  lastName: string,
  userType: 'freelancer' | 'client'
): Promise<SendMagicLinkResponse> {
  try {
    const response = await fetch('/api/auth/send-magic-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.toLowerCase(),
        user_type: userType,
        type: 'signup',
        first_name: firstName,
        last_name: lastName
      }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Signup error:', error)
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.',
      errorCode: 'NETWORK_ERROR'
    }
  }
}

/**
 * Get current authenticated user
 * Now uses server-side session management
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    // Call server-side API to get current user from JWT session
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include', // Important: include cookies
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.user || null
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

/**
 * Note: User profile creation is now handled server-side during magic link verification
 * These functions are kept for backwards compatibility but are no longer needed
 */

/**
 * Logout user
 * Now uses server-side session management
 */
export async function logout() {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include', // Important: include cookies
    })

    if (!response.ok) {
      throw new Error('Logout failed')
    }

    // Redirect to login page
    window.location.href = '/login'
  } catch (error) {
    console.error('Logout error:', error)
    // Force redirect even on error
    window.location.href = '/login'
  }
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.user_type === 'admin'
}

/**
 * Get user's session token (for API calls)
 * Note: Sessions are now handled via HttpOnly cookies
 * This function is kept for backwards compatibility
 */
export async function getSessionToken(): Promise<string | null> {
  // Sessions are now managed via HttpOnly cookies
  // No need to manually handle tokens on client side
  return null
}

/**
 * Refresh current user data (for context updates)
 */
export async function refreshUser(): Promise<AuthUser | null> {
  return getCurrentUser()
}
