# 🔐 Magic Link Authentication Implementation Guide
## TaskLinkers - Passwordless Authentication System

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [What Was Implemented](#what-was-implemented)
3. [Setup Instructions](#setup-instructions)
4. [Testing the System](#testing-the-system)
5. [API Reference](#api-reference)
6. [Security Features](#security-features)
7. [Migration from Password Auth](#migration-from-password-auth)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This implementation provides a **passwordless authentication system** using magic links (secure email-based login links) with JWT session management. The system is based on proven principles from a successful healthcare platform and adapted for the TaskLinkers job board.

### Key Features Implemented
- ✅ Passwordless magic link authentication (no password storage!)
- ✅ JWT-based session management with HttpOnly cookies
- ✅ Rate limiting and brute force protection
- ✅ Comprehensive audit logging for compliance
- ✅ Atomic magic link verification (single-use tokens)
- ✅ Role-based access control (freelancer, client, admin)
- ✅ Automatic session cleanup
- ✅ Professional email templates

---

## 📦 What Was Implemented

### 1. Database Schema (`scripts/magic-link-auth-schema.sql`)
New tables created:
- **magic_links** - Stores passwordless authentication tokens
- **user_sessions** - Manages JWT session lifecycle
- **audit_logs** - Compliance-grade activity tracking
- **rate_limit_attempts** - DDoS and brute force protection

### 2. Core Authentication Libraries

#### `lib/magic-link-auth.ts`
- Magic link generation and verification
- User creation/authentication logic
- Admin email restrictions
- Token expiration handling

#### `lib/server-session-manager.ts`
- JWT session creation and validation
- HttpOnly cookie management
- Session invalidation (logout)
- Session cleanup utilities

#### `lib/client-session-manager.ts`
- Client-side session helpers
- Authentication status checks
- Role-based access utilities

#### `lib/rate-limiter.ts`
- Per-email rate limiting (10 magic links/hour)
- Per-token verification limits (3 attempts/hour)
- Per-IP global rate limiting (100 requests/hour)
- Automatic cleanup of old attempts

#### `lib/audit-logger.ts`
- Compliance-grade event logging
- Login/logout tracking
- Magic link activity logging
- Security event detection

### 3. Email Service Updates (`lib/email-service.ts`)
- Professional magic link email templates
- Separate designs for signup vs login
- Security notices and expiration warnings
- Responsive HTML email design

### 4. API Routes

#### `POST /api/auth/send-magic-link`
Sends magic link for signup or login
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "user_type": "freelancer",
  "type": "signup"
}
```

#### `GET /api/auth/verify-magic-link`
Verifies magic link token and creates session
```
/api/auth/verify-magic-link?token=uuid&user_type=freelancer
```

#### `POST /api/auth/logout`
Invalidates session and clears cookies

#### `GET /api/auth/me`
Returns current authenticated user session

---

## 🚀 Setup Instructions

### Step 1: Install Dependencies

The required dependency `jose` has already been installed:
```bash
npm install jose --legacy-peer-deps
```

### Step 2: Set Up Environment Variables

1. Copy the template:
   ```bash
   cp MAGIC_LINK_ENV_TEMPLATE.txt .env.local
   ```

2. **Generate JWT_SECRET** (CRITICAL):
   ```bash
   # Method 1: Using Node.js
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   
   # Method 2: Using OpenSSL
   openssl rand -hex 32
   ```

3. Add to `.env.local`:
   ```env
   JWT_SECRET=<your-generated-secret-here>
   ```

4. Verify all other environment variables are set:
   - `NEXT_PUBLIC_SUPABASE_URL` ✅ (already configured)
   - `SUPABASE_SERVICE_ROLE_KEY` ✅ (already configured)
   - `BREVO_API_KEY` ✅ (already configured)
   - `NEXT_PUBLIC_SENDER_EMAIL` ✅ (already configured)
   - `NEXT_PUBLIC_APP_URL` (set to your domain or `http://localhost:3000`)

### Step 3: Run Database Migration

1. Open Supabase SQL Editor
2. Copy and run the entire contents of `scripts/magic-link-auth-schema.sql`
3. Verify tables created:
   - magic_links
   - user_sessions
   - audit_logs
   - rate_limit_attempts

### Step 4: Update Existing Pages (TODO)

You'll need to create new login/signup pages that use the magic link flow. See the **Creating New Pages** section below.

### Step 5: Update Middleware (TODO)

Update your `middleware.ts` to use JWT session validation:

```typescript
import { ServerSessionManager } from '@/lib/server-session-manager'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/api/auth/send-magic-link', 
                       '/api/auth/verify-magic-link', '/api/auth/me']
  
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check authentication for protected routes
  const session = await ServerSessionManager.getSessionFromRequest(request)

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Role-based access control
  if (pathname.startsWith('/admin') && session.user_type !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/tasks/:path*',
    // Add other protected routes
  ]
}
```

---

## 🧪 Testing the System

### Manual Testing Checklist

#### 1. Signup Flow
1. Go to `/signup` (you'll need to create this page)
2. Enter email, name, and select user type
3. Click "Send Magic Link"
4. Check email for magic link
5. Click link → should redirect to dashboard with session cookie set
6. Verify session persists on page refresh

#### 2. Login Flow
1. Go to `/login`
2. Enter email and select user type
3. Click "Send Magic Link"
4. Check email
5. Click link → should redirect to dashboard

#### 3. Security Testing
- [ ] Try to reuse the same magic link (should fail)
- [ ] Wait 24 hours and try an old magic link (should expire)
- [ ] Request 11+ magic links in an hour (should hit rate limit)
- [ ] Try to access `/api/auth/verify-magic-link` with wrong user_type
- [ ] Check cookies are HttpOnly (DevTools → Application → Cookies)

#### 4. Session Management
- [ ] Session persists across page refreshes
- [ ] Logout clears session
- [ ] Cannot access protected routes after logout
- [ ] Old sessions expire after 7 days

### Testing with Curl

```bash
# Send magic link (signup)
curl -X POST http://localhost:3000/api/auth/send-magic-link \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","user_type":"freelancer","type":"signup"}'

# Get current session
curl -X GET http://localhost:3000/api/auth/me \
  -H "Cookie: tasklinkers_session=<your-jwt-token>"

# Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Cookie: tasklinkers_session=<your-jwt-token>"
```

---

## 📚 API Reference

### Send Magic Link
```typescript
POST /api/auth/send-magic-link

Request:
{
  email: string              // Required
  name: string               // Required for signup
  user_type: UserType        // 'freelancer' | 'client' | 'admin'
  type: MagicLinkType        // 'signup' | 'login'
}

Response (Success):
{
  success: true,
  message: "Magic link sent! Please check your email at test@example.com"
}

Response (Error):
{
  success: false,
  error: "Error message"
}
```

### Verify Magic Link
```typescript
GET /api/auth/verify-magic-link?token={uuid}&user_type={type}

Success: Redirects to /dashboard with session cookie set
Error: Redirects to /login?error={error_code}
```

### Get Current Session
```typescript
GET /api/auth/me

Response (Authenticated):
{
  success: true,
  is_authenticated: true,
  user: {
    id: string,
    email: string,
    name: string,
    user_type: UserType,
    avatar?: string,
    is_verified: boolean,
    is_active: boolean
  }
}

Response (Not Authenticated):
{
  success: false,
  error: "Not authenticated",
  is_authenticated: false
}
```

### Logout
```typescript
POST /api/auth/logout

Response:
{
  success: true,
  message: "Logged out successfully"
}
```

---

## 🔒 Security Features

### 1. HttpOnly Cookies
- Session tokens stored in HttpOnly cookies
- Cannot be accessed via JavaScript (XSS protection)
- Automatically sent with requests
- Secure flag in production (HTTPS only)

### 2. Rate Limiting
- **Magic link requests**: 10 per hour per email
- **Magic link verification**: 3 attempts per token
- **Global IP limit**: 100 auth attempts per hour
- Automatic cleanup of old rate limit records

### 3. Token Security
- Cryptographically secure UUID v4 tokens
- Single-use only (atomic verification)
- 24-hour expiration (15 minutes for admin)
- Cannot be reused or guessed

### 4. Audit Logging
- All auth events logged with:
  - User ID
  - IP address
  - User agent
  - Event type
  - Timestamp
- Compliance-grade for regulations
- Suspicious activity detection

### 5. Session Management
- JWT signed with HS256 algorithm
- 7-day session duration
- Automatic cleanup of expired sessions
- Session invalidation on logout

---

## 🔄 Migration from Password Auth

### Current Password-Based Auth Issues
Your current system has several security risks:
1. ❌ No route protection in middleware
2. ❌ Insecure email verification (user ID as token)
3. ❌ Mixed verification states (confusing logic)
4. ❌ No rate limiting
5. ❌ No audit logging

### Migration Strategy

#### Option 1: Clean Cut (Recommended)
1. Run database migration to add new tables
2. Keep existing `users` table (compatible)
3. Update login/signup pages to use magic links
4. Disable password-based endpoints
5. Users re-authenticate via magic link

#### Option 2: Gradual Migration
1. Run database migration
2. Keep both auth systems running
3. Add "Login with Magic Link" option
4. Gradually migrate users
5. Deprecate password auth later

### Compatibility Notes
- ✅ Existing `users` table is compatible
- ✅ User IDs remain the same
- ✅ No data loss
- ⚠️ Users will need to re-authenticate once

---

## 🐛 Troubleshooting

### Magic Link Not Received
**Check:**
1. Brevo API key is correct
2. Sender email is verified in Brevo
3. Check spam folder
4. Check Brevo dashboard for delivery status
5. Check server logs for email errors

### Session Not Persisting
**Check:**
1. JWT_SECRET is set in `.env.local`
2. Cookie is being set (DevTools → Application → Cookies)
3. Domain matches (localhost vs 127.0.0.1 issue)
4. Middleware is not clearing the cookie

### "Unauthorized" Errors
**Check:**
1. Session hasn't expired (7 days)
2. JWT_SECRET hasn't changed
3. Cookie is being sent with requests
4. Middleware is running correctly

### Rate Limit Errors
**Solution:**
- Wait for rate limit window to expire (1 hour)
- In development, clear rate_limit_attempts table:
  ```sql
  DELETE FROM rate_limit_attempts WHERE created_at < NOW() - INTERVAL '1 hour';
  ```

### Magic Link Already Used
**Cause:** Magic links are single-use only

**Solution:** Request a new magic link

---

## 📊 Database Maintenance

### Cleanup Functions (Run Periodically)

```sql
-- Cleanup expired magic links (7+ days old)
SELECT cleanup_expired_magic_links();

-- Cleanup old rate limit attempts (24+ hours old)
SELECT cleanup_old_rate_limits();

-- Cleanup expired sessions (30+ days after invalidation)
SELECT cleanup_expired_sessions();

-- Cleanup old audit logs (1+ year old)
SELECT cleanup_old_audit_logs();
```

### Set Up Cron Jobs (Optional)
If your Supabase plan supports pg_cron:
```sql
-- Run cleanup every 6 hours
SELECT cron.schedule('cleanup-magic-links', '0 */6 * * *', 
  'SELECT cleanup_expired_magic_links()');
SELECT cron.schedule('cleanup-rate-limits', '0 */6 * * *', 
  'SELECT cleanup_old_rate_limits()');
SELECT cron.schedule('cleanup-sessions', '0 0 * * *', 
  'SELECT cleanup_expired_sessions()');
```

---

## 🎓 Next Steps

### 1. Create UI Pages (Required)
You need to create:
- `/app/login-magic/page.tsx` - Magic link login page
- `/app/signup-magic/page.tsx` - Magic link signup page
- Update `/app/dashboard/page.tsx` - To show welcome message for new users

### 2. Update Auth Context (Recommended)
Update `/contexts/auth-context.tsx` to use the new session manager:
```typescript
import { ClientSessionManager } from '@/lib/client-session-manager'

// Replace existing auth logic with:
const { user, loading } = useSession() // Custom hook using ClientSessionManager
```

### 3. Protect API Routes (Critical)
Add authentication checks to your API routes:
```typescript
import { ServerSessionManager } from '@/lib/server-session-manager'

export async function POST(request: NextRequest) {
  const session = await ServerSessionManager.getSessionFromRequest(request)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Your protected logic here
}
```

### 4. Add Role-Based Access Control
```typescript
if (session.user_type !== 'admin') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

---

## 📞 Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Review audit logs in database for clues
3. Check server logs for detailed errors
4. Verify all environment variables are set correctly

---

## ✅ Pre-Deployment Checklist

Before deploying to production:
- [ ] JWT_SECRET is a secure 256-bit random string
- [ ] All environment variables are set in production
- [ ] Database migration has been run
- [ ] Email service is configured and tested
- [ ] Middleware is protecting all routes
- [ ] Session cookies have `secure: true` in production
- [ ] Rate limiting is active
- [ ] Audit logging is working
- [ ] All tests pass
- [ ] Cleanup cron jobs are configured

---

**Last Updated:** October 8, 2025
**Version:** 1.0.0
**Implementation Status:** Core libraries complete, UI pages pending

