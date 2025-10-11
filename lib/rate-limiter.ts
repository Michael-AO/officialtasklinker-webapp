/**
 * Rate Limiter Utility
 * Prevents abuse of authentication endpoints
 * Adapted from senior engineer best practices
 */

import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client with service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export class RateLimiter {
  /**
   * Check if magic link request is allowed
   * Limit: 10 requests per hour per email
   */
  static async checkMagicLinkRequest(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('check_rate_limit', {
        p_identifier: email.toLowerCase(),
        p_action: 'magic_link_request',
        p_max_attempts: 10,
        p_window_minutes: 60
      })

      if (error) {
        console.error('Rate limit check error:', error)
        // Fail closed - deny on error
        return false
      }

      return data === true
    } catch (error) {
      console.error('Rate limiter exception:', error)
      return false
    }
  }

  /**
   * Check if magic link verification is allowed
   * Limit: 3 attempts per token
   */
  static async checkMagicLinkVerification(token: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('check_rate_limit', {
        p_identifier: token,
        p_action: 'magic_link_verification',
        p_max_attempts: 3,
        p_window_minutes: 15 // 15 minute window
      })

      if (error) {
        console.error('Rate limit check error:', error)
        return false
      }

      return data === true
    } catch (error) {
      console.error('Rate limiter exception:', error)
      return false
    }
  }

  /**
   * Manually reset rate limit (admin function)
   */
  static async resetRateLimit(identifier: string, action: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('auth_rate_limits')
        .delete()
        .eq('identifier', identifier)
        .eq('action', action)

      return !error
    } catch (error) {
      console.error('Reset rate limit error:', error)
      return false
    }
  }

  /**
   * Get rate limit status (for debugging/admin)
   */
  static async getRateLimitStatus(identifier: string, action: string) {
    try {
      const { data, error } = await supabase
        .from('auth_rate_limits')
        .select('*')
        .eq('identifier', identifier)
        .eq('action', action)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found (ok)
        console.error('Get rate limit status error:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Get rate limit exception:', error)
      return null
    }
  }

  /**
   * Check if identifier is currently blocked
   */
  static async isBlocked(identifier: string, action: string): Promise<boolean> {
    const status = await this.getRateLimitStatus(identifier, action)
    
    if (!status || !status.blocked_until) {
      return false
    }

    const blockedUntil = new Date(status.blocked_until)
    const now = new Date()
    
    return blockedUntil > now
  }

  /**
   * Get time remaining on block (in minutes)
   */
  static async getBlockTimeRemaining(identifier: string, action: string): Promise<number> {
    const status = await this.getRateLimitStatus(identifier, action)
    
    if (!status || !status.blocked_until) {
      return 0
    }

    const blockedUntil = new Date(status.blocked_until)
    const now = new Date()
    
    if (blockedUntil <= now) {
      return 0
    }

    return Math.ceil((blockedUntil.getTime() - now.getTime()) / (1000 * 60))
  }
}

