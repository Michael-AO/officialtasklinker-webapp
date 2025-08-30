# Authentication Architecture Documentation

## Overview
This document describes a comprehensive authentication system built with Next.js 14, Supabase, and React Context API. The system provides user authentication, profile management, portfolio management, and real-time state synchronization.

## Technology Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: React Context API
- **Styling**: Tailwind CSS
- **Deployment**: Netlify/Vercel ready

## Core Architecture Components

### 1. Supabase Configuration (`lib/supabase.ts`)
```typescript
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Client-side client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client for admin operations
export const createServerClient = () => {
  const key = supabaseServiceKey || supabaseAnonKey
  return createClient(supabaseUrl, key)
}
```

### 2. Authentication Context (`contexts/auth-context.tsx`)

#### Key Features:
- **Real-time auth state management**
- **Progressive data loading** (basic user data → full profile → portfolio)
- **Timeout handling** for initialization
- **Background data synchronization**
- **Error recovery mechanisms**

#### User Interface:
```typescript
interface User {
  id: string
  email: string
  name: string
  userType: "freelancer" | "client" | "admin"
  avatar?: string
  isVerified: boolean
  joinDate: string
  completedTasks: number
  rating: number
  skills: string[]
  bio: string
  location?: string
  hourlyRate?: number
  profile_completion?: number
  portfolio?: Array<{
    id: string
    title: string
    description: string
    image: string
    url?: string
  }>
}

interface AuthContextType {
  user: User | null
  login: (user: User) => Promise<void>
  logout: () => void
  signOut: () => void
  updateProfile: (updates: Partial<User>) => Promise<void>
  refreshPortfolio: () => Promise<void>
  isLoading: boolean
}
```

#### Initialization Strategy:
1. **Immediate basic user data** from Supabase session
2. **Background profile loading** via API
3. **Background portfolio loading** via API
4. **Timeout protection** (30 seconds)
5. **Fallback initialization** if timeout occurs

### 3. Database Service Layer (`lib/database-service.ts`)

#### UserProfileService Class:
- **Profile CRUD operations**
- **Automatic profile creation** for new users
- **Default settings initialization**
- **Error handling and logging**

#### Key Methods:
```typescript
class UserProfileService {
  static async getProfile(userId: string): Promise<UserProfile | null>
  static async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null>
  static async createProfile(userData: UserProfileInsert): Promise<UserProfile | null>
}
```

### 4. API Routes Structure

#### User Profile API (`app/api/user/profile/update/route.ts`):
- **PUT** method for profile updates
- **UUID conversion** for user IDs
- **Profile completion calculation**
- **Validation and error handling**
- **Service role authentication**

#### Portfolio API (`app/api/user/portfolio/route.ts`):
- **GET** method for fetching portfolio items
- **POST** method for creating portfolio items
- **File upload support**
- **Featured item ordering**

### 5. Database Schema (Supabase)

#### Users Table:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  user_type TEXT CHECK (user_type IN ('freelancer', 'client')) DEFAULT 'freelancer',
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  phone TEXT,
  bio TEXT,
  location TEXT,
  hourly_rate DECIMAL(10,2),
  skills TEXT[] DEFAULT '{}',
  rating DECIMAL(3,2) DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  total_earned DECIMAL(12,2) DEFAULT 0,
  join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  profile_completion INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Portfolio Items Table:
```sql
CREATE TABLE portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  project_url TEXT,
  file_url TEXT,
  file_type TEXT,
  file_name TEXT,
  file_size INTEGER,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Implementation Patterns

### 1. Progressive Loading Pattern
```typescript
// 1. Set basic user data immediately
const basicUserData: User = {
  id: session.user.id,
  email: session.user.email || "",
  name: session.user.user_metadata?.name || "User",
  // ... other basic fields
}
setUser(basicUserData)

// 2. Load full profile in background
setTimeout(async () => {
  const profile = await UserProfileService.getProfile(session.user.id)
  if (profile) {
    setUser(prevUser => ({ ...prevUser, ...profile }))
  }
}, 100)

// 3. Load portfolio in background
setTimeout(async () => {
  const portfolio = await fetch("/api/user/portfolio", {
    headers: { "x-user-id": session.user.id }
  })
  // Update user with portfolio data
}, 200)
```

### 2. Error Recovery Pattern
```typescript
try {
  // Primary operation
  await primaryOperation()
} catch (error) {
  if (error.message.includes("timeout")) {
    // Fallback operation
    await fallbackOperation()
  }
} finally {
  setIsLoading(false)
}
```

### 3. API Authentication Pattern
```typescript
// Client-side: Pass user ID in headers
const response = await fetch("/api/user/profile/update", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "user-id": user.id,
  },
  body: JSON.stringify(updates)
})

// Server-side: Extract and validate user ID
const userId = request.headers.get("user-id")
if (!userId) {
  return NextResponse.json({ error: "User ID required" }, { status: 401 })
}
```

### 4. State Synchronization Pattern
```typescript
const updateProfile = async (updates: Partial<User>) => {
  // 1. Call API
  const response = await fetch("/api/user/profile/update", {
    method: "PUT",
    headers: { "user-id": user.id },
    body: JSON.stringify(updates)
  })
  
  // 2. Update local state
  if (response.ok) {
    setUser(prevUser => ({ ...prevUser, ...updates }))
  }
}
```

## Environment Variables Required

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional: Email service (if using email notifications)
BREVO_API_KEY=your_brevo_api_key
```

## Setup Instructions

### 1. Database Setup
1. Create Supabase project
2. Run the database migration scripts
3. Set up Row Level Security (RLS) policies
4. Configure authentication providers

### 2. Environment Configuration
1. Copy environment variables
2. Configure Supabase URL and keys
3. Set up email service (optional)

### 3. Authentication Provider Setup
```typescript
// In your root layout
import { AuthProvider } from "@/contexts/auth-context"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

### 4. Usage in Components
```typescript
import { useAuth } from "@/contexts/auth-context"

export default function MyComponent() {
  const { user, updateProfile, isLoading } = useAuth()
  
  if (isLoading) return <div>Loading...</div>
  if (!user) return <div>Please sign in</div>
  
  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <button onClick={() => updateProfile({ name: "New Name" })}>
        Update Name
      </button>
    </div>
  )
}
```

## Security Considerations

### 1. Row Level Security (RLS)
- Enable RLS on all user-related tables
- Create policies for user data access
- Use service role for admin operations

### 2. API Security
- Validate user ID in all API routes
- Use service role for database operations
- Implement proper error handling

### 3. Client-Side Security
- Never expose service role key to client
- Validate all user inputs
- Implement proper session management

## Performance Optimizations

### 1. Progressive Loading
- Load basic user data immediately
- Load detailed data in background
- Implement loading states

### 2. Caching Strategy
- Cache user profile data
- Implement optimistic updates
- Use React Query for advanced caching (optional)

### 3. Error Handling
- Implement timeout protection
- Provide fallback mechanisms
- Graceful degradation

## Testing Strategy

### 1. Unit Tests
- Test auth context functions
- Test API route handlers
- Test database service methods

### 2. Integration Tests
- Test authentication flow
- Test profile update flow
- Test portfolio management

### 3. E2E Tests
- Test complete user journey
- Test error scenarios
- Test performance under load

## Deployment Considerations

### 1. Environment Variables
- Set production environment variables
- Use secure key management
- Validate environment setup

### 2. Database Migration
- Run migrations before deployment
- Test migration scripts
- Backup production data

### 3. Monitoring
- Set up error tracking
- Monitor authentication metrics
- Track performance metrics

## Common Issues and Solutions

### 1. Authentication Timeout
- Implement timeout protection
- Provide fallback initialization
- Add retry mechanisms

### 2. Profile Loading Issues
- Check database permissions
- Verify API route configuration
- Debug network requests

### 3. Portfolio Management
- Ensure portfolio table exists
- Check file upload permissions
- Validate file types and sizes

## Extension Points

### 1. Additional User Types
- Add new user types to the enum
- Update database schema
- Modify auth context

### 2. Enhanced Profile Features
- Add social media links
- Implement profile verification
- Add profile analytics

### 3. Advanced Portfolio Features
- Add portfolio categories
- Implement portfolio sharing
- Add portfolio analytics

This architecture provides a solid foundation for user authentication and profile management in Next.js applications with Supabase. It's designed to be scalable, maintainable, and secure while providing excellent user experience through progressive loading and error recovery mechanisms.
