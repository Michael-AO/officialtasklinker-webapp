/**
 * Audit Logger Utility
 * Logs all authentication events for security and compliance
 * Adapted from senior engineer best practices
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null
function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) throw new Error('supabaseKey is required')
    _supabase = createClient(url, key)
  }
  return _supabase
}

export interface AuditLogEntry {
  userId?: string
  email: string
  action: string
  userType?: 'freelancer' | 'client' | 'admin'
  success: boolean
  errorMessage?: string
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, any>
}

export class AuditLogger {
  /**
   * Log magic link sent event
   */
  static async logMagicLinkSent(
    email: string,
    userType: 'freelancer' | 'client' | 'admin',
    type: 'login' | 'signup',
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      email,
      action: `magic_link_sent_${type}`,
      userType,
      success: true,
      metadata
    })
  }

  /**
   * Log magic link verification attempt
   */
  static async logMagicLinkVerification(
    userId: string | undefined,
    email: string,
    userType: 'freelancer' | 'client' | 'admin',
    success: boolean,
    errorMessage?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      userId,
      email,
      action: 'magic_link_verified',
      userType,
      success,
      errorMessage,
      metadata
    })
  }

  /**
   * Log login success
   */
  static async logLoginSuccess(
    userId: string,
    email: string,
    userType: 'freelancer' | 'client' | 'admin',
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      userId,
      email,
      action: 'login_success',
      userType,
      success: true,
      metadata
    })
  }

  /**
   * Log login failure
   */
  static async logLoginFailure(
    email: string,
    errorMessage: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      email,
      action: 'login_failed',
      success: false,
      errorMessage,
      metadata
    })
  }

  /**
   * Log signup attempt
   */
  static async logSignupAttempt(
    email: string,
    userType: 'freelancer' | 'client',
    success: boolean,
    errorMessage?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      email,
      action: 'signup_attempt',
      userType,
      success,
      errorMessage,
      metadata
    })
  }

  /**
   * Log logout
   */
  static async logLogout(
    userId: string,
    email: string,
    userType: 'freelancer' | 'client' | 'admin',
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      userId,
      email,
      action: 'logout',
      userType,
      success: true,
      metadata
    })
  }

  /**
   * Log rate limit exceeded
   */
  static async logRateLimitExceeded(
    email: string,
    action: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      email,
      action: `rate_limit_exceeded_${action}`,
      success: false,
      errorMessage: 'Rate limit exceeded',
      metadata
    })
  }

  /**
   * Log session created
   */
  static async logSessionCreated(
    userId: string,
    email: string,
    userType: 'freelancer' | 'client' | 'admin',
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      userId,
      email,
      action: 'session_created',
      userType,
      success: true,
      metadata
    })
  }

  /**
   * Log session expired
   */
  static async logSessionExpired(
    userId: string,
    email: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      userId,
      email,
      action: 'session_expired',
      success: true,
      metadata
    })
  }

  /**
   * Generic log function - uses database function for consistency
   */
  private static async log(entry: AuditLogEntry): Promise<void> {
    try {
      const { error } = await getSupabase().rpc('log_auth_event', {
        p_user_id: entry.userId || null,
        p_email: entry.email,
        p_action: entry.action,
        p_user_type: entry.userType || null,
        p_success: entry.success,
        p_error_message: entry.errorMessage || null,
        p_ip_address: entry.ipAddress || null,
        p_user_agent: entry.userAgent || null,
        p_metadata: entry.metadata ? JSON.stringify(entry.metadata) : null
      })

      if (error) {
        console.error('Audit log error:', error)
        // Don't throw - logging should not break auth flow
      }
    } catch (error) {
      console.error('Audit logger exception:', error)
      // Silent fail - logging should not break auth flow
    }
  }

  /**
   * Get recent audit logs (admin function)
   */
  static async getRecentLogs(limit: number = 100) {
    try {
      const { data, error } = await getSupabase()
        .from('auth_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Get audit logs error:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Get audit logs exception:', error)
      return []
    }
  }

  /**
   * Get audit logs for specific user (admin function)
   */
  static async getUserLogs(userId: string, limit: number = 50) {
    try {
      const { data, error } = await getSupabase()
        .from('auth_audit_log')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Get user audit logs error:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Get user audit logs exception:', error)
      return []
    }
  }

  /**
   * Get failed login attempts for email (security monitoring)
   */
  static async getFailedLoginAttempts(email: string, hours: number = 24) {
    try {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

      const { data, error } = await getSupabase()
        .from('auth_audit_log')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('success', false)
        .gte('created_at', since)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Get failed login attempts error:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Get failed login attempts exception:', error)
      return []
    }
  }
}

