/**
 * Server Session Manager
 * Handles JWT session creation and validation
 * Uses HttpOnly cookies for maximum security
 * Adapted from healthcare app senior engineer principles
 */

import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { AuditLogger } from './audit-logger'

// Server-side Supabase client with service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// JWT secret key
const getSecretKey = () => {
  const secret = process.env.JWT_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return new TextEncoder().encode(secret)
}

export interface UserData {
  id: string
  email: string
  user_type: 'freelancer' | 'client' | 'admin'
  name?: string
  is_verified?: boolean
}

export interface SessionData extends UserData {
  sessionId: string
  exp: number
  iat: number
}

const COOKIE_NAME = 'tl-auth-token'
const SESSION_DURATION_DAYS = 7

export class ServerSessionManager {
  /**
   * Create session for user and set HttpOnly cookie
   */
  static async createSession(
    userData: UserData,
    metadata?: Record<string, any>
  ): Promise<string> {
    try {
      const sessionId = crypto.randomUUID()
      const secretKey = getSecretKey()
      
      // Calculate expiration
      const expirationTime = Math.floor(Date.now() / 1000) + (SESSION_DURATION_DAYS * 24 * 60 * 60)

      // Create JWT token
      const token = await new SignJWT({ 
        user: userData,
        sessionId 
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(expirationTime)
        .sign(secretKey)

      // Store session in database for tracking
      const expiresAt = new Date(expirationTime * 1000)
      
      await supabase.from('user_sessions').insert({
        id: sessionId,
        user_id: userData.id,
        session_token: token,
        user_type: userData.user_type,
        expires_at: expiresAt.toISOString(),
        ip_address: metadata?.ipAddress || null,
        user_agent: metadata?.userAgent || null,
        is_active: true
      })

      // Set HttpOnly cookie
      const cookieStore = await cookies()
      cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true, // Not accessible via JavaScript (XSS protection)
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'lax', // CSRF protection
        maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60, // 7 days in seconds
        path: '/'
      })

      // Log session creation
      await AuditLogger.logSessionCreated(
        userData.id,
        userData.email,
        userData.user_type,
        { sessionId, ...metadata }
      )

      return token
    } catch (error) {
      console.error('Create session error:', error)
      throw new Error('Failed to create session')
    }
  }

  /**
   * Validate session token and return user data
   */
  static async validateSession(): Promise<SessionData | null> {
    try {
      const cookieStore = await cookies()
      const token = cookieStore.get(COOKIE_NAME)?.value

      if (!token) {
        return null
      }

      const secretKey = getSecretKey()

      // Verify JWT
      const { payload } = await jwtVerify(token, secretKey)
      
      const userData = payload.user as UserData
      const sessionId = payload.sessionId as string

      // Check if session exists and is active in database
      const { data: session, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('is_active', true)
        .single()

      if (error || !session) {
        // Session not found or inactive
        await this.destroySession()
        return null
      }

      // Check if session expired
      const expiresAt = new Date(session.expires_at)
      if (expiresAt < new Date()) {
        await this.destroySession()
        await AuditLogger.logSessionExpired(userData.id, userData.email)
        return null
      }

      // Update last activity
      await supabase
        .from('user_sessions')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('id', sessionId)

      return {
        ...userData,
        sessionId,
        exp: payload.exp as number,
        iat: payload.iat as number
      }
    } catch (error) {
      // Token invalid or expired
      console.error('Validate session error:', error)
      await this.destroySession()
      return null
    }
  }

  /**
   * Destroy current session (logout)
   */
  static async destroySession(): Promise<void> {
    try {
      const cookieStore = await cookies()
      const token = cookieStore.get(COOKIE_NAME)?.value

      if (token) {
        try {
          const secretKey = getSecretKey()
          const { payload } = await jwtVerify(token, secretKey)
          const sessionId = payload.sessionId as string
          const userData = payload.user as UserData

          // Mark session as inactive in database
          await supabase
            .from('user_sessions')
            .update({ is_active: false })
            .eq('id', sessionId)

          // Log logout
          await AuditLogger.logLogout(
            userData.id,
            userData.email,
            userData.user_type
          )
        } catch (error) {
          // Token might be invalid, that's okay
          console.error('Error processing session during destroy:', error)
        }
      }

      // Clear cookie
      cookieStore.delete(COOKIE_NAME)
    } catch (error) {
      console.error('Destroy session error:', error)
    }
  }

  /**
   * Refresh session (extend expiration)
   */
  static async refreshSession(): Promise<boolean> {
    try {
      const sessionData = await this.validateSession()
      
      if (!sessionData) {
        return false
      }

      // Create new session with same user data
      await this.createSession({
        id: sessionData.id,
        email: sessionData.email,
        user_type: sessionData.user_type,
        name: sessionData.name,
        is_verified: sessionData.is_verified
      })

      return true
    } catch (error) {
      console.error('Refresh session error:', error)
      return false
    }
  }

  /**
   * Get current user from session
   */
  static async getCurrentUser(): Promise<UserData | null> {
    const sessionData = await this.validateSession()
    
    if (!sessionData) {
      return null
    }

    return {
      id: sessionData.id,
      email: sessionData.email,
      user_type: sessionData.user_type,
      name: sessionData.name,
      is_verified: sessionData.is_verified
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser()
    return user !== null
  }

  /**
   * Check if user is admin
   */
  static async isAdmin(): Promise<boolean> {
    const user = await this.getCurrentUser()
    return user?.user_type === 'admin'
  }

  /**
   * Get all active sessions for a user (admin function)
   */
  static async getUserSessions(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Get user sessions error:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Get user sessions exception:', error)
      return []
    }
  }

  /**
   * Revoke all sessions for a user (admin function or password reset)
   */
  static async revokeAllUserSessions(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('user_id', userId)

      return !error
    } catch (error) {
      console.error('Revoke all sessions error:', error)
      return false
    }
  }

  /**
   * Cleanup expired sessions (run periodically via cron)
   */
  static async cleanupExpiredSessions(): Promise<number> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

      const { data, error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('is_active', false)
        .lt('created_at', thirtyDaysAgo.toISOString())
        .select('id')

      if (error) {
        console.error('Failed to cleanup expired sessions:', error)
        return 0
      }

      return data?.length || 0
    } catch (error) {
      console.error('Cleanup sessions exception:', error)
      return 0
    }
  }
}

