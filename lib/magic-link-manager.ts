/**
 * Magic Link Manager
 * Server-side magic link creation and verification
 * Implements atomic single-use tokens and comprehensive security
 * Adapted from healthcare app senior engineer principles
 */

import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import { RateLimiter } from './rate-limiter'
import { AuditLogger } from './audit-logger'

// Server-side Supabase client with service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export type UserType = 'freelancer' | 'client' | 'admin'
export type MagicLinkType = 'login' | 'signup'

export interface MagicLinkResult {
  success: boolean
  token?: string
  expiresAt?: Date
  error?: string
  errorCode?: string
}

export interface VerificationResult {
  success: boolean
  user?: {
    id: string
    email: string
    user_type: UserType
    name?: string
  }
  error?: string
  errorCode?: string
}

export class MagicLinkManager {
  /**
   * Get magic link expiry time based on user type
   * Default: 24 hours for all users
   * Can be customized for different security requirements
   */
  private static getMagicLinkExpiry(): number {
    // For TaskLinker, we use 24 hours for all users
    // Can be adjusted based on security requirements
    return 24 * 60 * 60 * 1000 // 24 hours in milliseconds
  }

  /**
   * Create magic link for user authentication
   * Server-side only - never expose this to client
   */
  static async createMagicLink(
    email: string,
    userType: UserType,
    type: MagicLinkType = 'login',
    metadata?: Record<string, any>
  ): Promise<MagicLinkResult> {
    try {
      const normalizedEmail = email.toLowerCase().trim()

      // Step 1: Rate limit check
      const rateLimitAllowed = await RateLimiter.checkMagicLinkRequest(normalizedEmail)
      if (!rateLimitAllowed) {
        await AuditLogger.logRateLimitExceeded(normalizedEmail, 'magic_link_request')
        
        const blockedMinutes = await RateLimiter.getBlockTimeRemaining(
          normalizedEmail,
          'magic_link_request'
        )
        
        return {
          success: false,
          error: blockedMinutes > 0
            ? `Too many attempts. Please try again in ${blockedMinutes} minutes.`
            : 'Too many requests. Please try again later.',
          errorCode: 'RATE_LIMIT_EXCEEDED'
        }
      }

      // Step 2: Validate user exists (for login) or doesn't exist (for signup)
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email, user_type, is_verified, is_active')
        .eq('email', normalizedEmail)
        .single()

      if (type === 'login') {
        if (!existingUser) {
          await AuditLogger.logLoginFailure(normalizedEmail, 'User not found')
          return {
            success: false,
            error: 'No account found with this email. Please sign up first.',
            errorCode: 'USER_NOT_FOUND'
          }
        }

        // Check if user type matches
        if (existingUser.user_type !== userType) {
          await AuditLogger.logLoginFailure(
            normalizedEmail,
            `User type mismatch: expected ${userType}, got ${existingUser.user_type}`
          )
          return {
            success: false,
            error: `This email is registered as a ${existingUser.user_type}. Please use the correct login page.`,
            errorCode: 'USER_TYPE_MISMATCH'
          }
        }

        // Check if user is active
        if (existingUser.is_active === false) {
          await AuditLogger.logLoginFailure(normalizedEmail, 'Account is inactive')
          return {
            success: false,
            error: 'Your account has been deactivated. Please contact support.',
            errorCode: 'ACCOUNT_INACTIVE'
          }
        }
      } else if (type === 'signup') {
        if (existingUser) {
          await AuditLogger.logSignupAttempt(
            normalizedEmail,
            userType as 'freelancer' | 'client',
            false,
            'Email already exists'
          )
          return {
            success: false,
            error: 'An account with this email already exists. Please login instead.',
            errorCode: 'USER_EXISTS'
          }
        }
      }

      // Step 3: Generate unique token
      const token = randomUUID()
      const expiryMs = this.getMagicLinkExpiry()
      const expiresAt = new Date(Date.now() + expiryMs)

      // Step 4: Store magic link in database
      const { error: insertError } = await supabase.from('magic_links').insert({
        email: normalizedEmail,
        token,
        type,
        user_type: userType,
        expires_at: expiresAt.toISOString(),
        metadata: metadata ? JSON.stringify(metadata) : null
      })

      if (insertError) {
        console.error('Failed to create magic link:', insertError)
        return {
          success: false,
          error: 'Failed to create magic link. Please try again.',
          errorCode: 'DATABASE_ERROR'
        }
      }

      // Step 5: Log successful creation
      await AuditLogger.logMagicLinkSent(normalizedEmail, userType, type, {
        ...metadata,
        expiresAt: expiresAt.toISOString()
      })

      return {
        success: true,
        token,
        expiresAt
      }
    } catch (error) {
      console.error('Create magic link exception:', error)
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
        errorCode: 'INTERNAL_ERROR'
      }
    }
  }

  /**
   * Verify magic link token (atomic single-use)
   * This is the critical security function - ensures tokens can only be used once
   */
  static async verifyMagicLink(
    token: string,
    userType: UserType
  ): Promise<VerificationResult> {
    try {
      // Step 1: Rate limit check on verification attempts
      const rateLimitAllowed = await RateLimiter.checkMagicLinkVerification(token)
      if (!rateLimitAllowed) {
        await AuditLogger.logRateLimitExceeded('unknown', 'magic_link_verification', {
          token: token.substring(0, 8) + '...' // Log partial token for debugging
        })

        return {
          success: false,
          error: 'Too many verification attempts. Please request a new magic link.',
          errorCode: 'RATE_LIMIT_EXCEEDED'
        }
      }

      // Step 2: Find magic link in database
      const { data: magicLink, error: fetchError } = await supabase
        .from('magic_links')
        .select('*')
        .eq('token', token)
        .eq('user_type', userType)
        .is('used_at', null) // Critical: Must not be used already
        .single()

      if (fetchError || !magicLink) {
        await AuditLogger.logMagicLinkVerification(
          undefined,
          'unknown',
          userType,
          false,
          'Invalid or expired magic link'
        )

        return {
          success: false,
          error: 'Invalid or expired magic link. Please request a new one.',
          errorCode: 'INVALID_TOKEN'
        }
      }

      // Step 3: Check expiration
      const expiresAt = new Date(magicLink.expires_at)
      const now = new Date()

      if (expiresAt < now) {
        await AuditLogger.logMagicLinkVerification(
          undefined,
          magicLink.email,
          userType,
          false,
          'Magic link expired'
        )

        return {
          success: false,
          error: 'This magic link has expired. Please request a new one.',
          errorCode: 'EXPIRED'
        }
      }

      // Step 4: ATOMIC UPDATE - Mark as used (prevents race conditions)
      // This is the critical security feature: uses database-level atomic operation
      // to ensure the token can only be used once, even with concurrent requests
      const { data: updatedLink, error: updateError } = await supabase
        .from('magic_links')
        .update({ used_at: now.toISOString() })
        .eq('id', magicLink.id)
        .is('used_at', null) // Critical: Only update if STILL unused
        .select()
        .single()

      if (updateError || !updatedLink) {
        // Token was already used by another request (race condition)
        await AuditLogger.logMagicLinkVerification(
          undefined,
          magicLink.email,
          userType,
          false,
          'Magic link already used'
        )

        return {
          success: false,
          error: 'This magic link has already been used. Please request a new one.',
          errorCode: 'ALREADY_USED'
        }
      }

      // Step 5: Get or create user based on type
      let user

      if (magicLink.type === 'login') {
        // Login: Get existing user
        const { data: existingUser, error: userError } = await supabase
          .from('users')
          .select('id, email, user_type, name, is_verified, is_active')
          .eq('email', magicLink.email)
          .single()

        if (userError || !existingUser) {
          await AuditLogger.logMagicLinkVerification(
            undefined,
            magicLink.email,
            userType,
            false,
            'User not found'
          )

          return {
            success: false,
            error: 'User account not found.',
            errorCode: 'USER_NOT_FOUND'
          }
        }

        if (!existingUser.is_active) {
          await AuditLogger.logMagicLinkVerification(
            existingUser.id,
            magicLink.email,
            userType,
            false,
            'Account is inactive'
          )

          return {
            success: false,
            error: 'Your account has been deactivated. Please contact support.',
            errorCode: 'ACCOUNT_INACTIVE'
          }
        }

        user = existingUser
      } else {
        // Signup: Create new user (if metadata provided)
        const metadata = magicLink.metadata
          ? (typeof magicLink.metadata === 'string'
              ? JSON.parse(magicLink.metadata)
              : magicLink.metadata)
          : {}

        // Combine first and last name into single name field (matching existing schema)
        const fullName = [metadata.firstName, metadata.lastName]
          .filter(Boolean)
          .join(' ') || 'User'

        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            email: magicLink.email,
            user_type: userType,
            name: fullName,
            is_verified: true, // Email verified via magic link
            is_active: true,
            created_at: now.toISOString()
          })
          .select('id, email, user_type, name')
          .single()

        if (createError || !newUser) {
          console.error('Failed to create user:', createError)
          await AuditLogger.logMagicLinkVerification(
            undefined,
            magicLink.email,
            userType,
            false,
            'Failed to create user account'
          )

          return {
            success: false,
            error: 'Failed to create user account. Please try again.',
            errorCode: 'USER_CREATE_FAILED'
          }
        }

        user = newUser

        // Log successful signup
        await AuditLogger.logSignupAttempt(
          magicLink.email,
          userType as 'freelancer' | 'client',
          true
        )
      }

      // Step 6: Log successful verification
      await AuditLogger.logMagicLinkVerification(
        user.id,
        user.email,
        userType,
        true,
        undefined,
        { type: magicLink.type }
      )

      await AuditLogger.logLoginSuccess(user.id, user.email, userType)

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          user_type: user.user_type,
          name: user.name
        }
      }
    } catch (error) {
      console.error('Verify magic link exception:', error)
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
        errorCode: 'INTERNAL_ERROR'
      }
    }
  }

  /**
   * Clean up expired magic links (run periodically via cron)
   */
  static async cleanupExpiredLinks(): Promise<number> {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

      const { data, error } = await supabase
        .from('magic_links')
        .delete()
        .lt('expires_at', sevenDaysAgo.toISOString())
        .select('id')

      if (error) {
        console.error('Failed to cleanup expired links:', error)
        return 0
      }

      return data?.length || 0
    } catch (error) {
      console.error('Cleanup exception:', error)
      return 0
    }
  }

  /**
   * Get magic link status (for debugging/admin)
   */
  static async getMagicLinkStatus(token: string) {
    try {
      const { data, error } = await supabase
        .from('magic_links')
        .select('*')
        .eq('token', token)
        .single()

      if (error) {
        return null
      }

      return {
        ...data,
        isExpired: new Date(data.expires_at) < new Date(),
        isUsed: data.used_at !== null
      }
    } catch (error) {
      console.error('Get magic link status exception:', error)
      return null
    }
  }
}

