# TaskLinker - Comprehensive Codebase Overview

**Generated:** January 26, 2026  
**Project:** TaskLinker - Freelance Marketplace Platform  
**Tech Stack:** Next.js 15, TypeScript, Supabase, Tailwind CSS

---

## 1. Features Implemented

### 🔐 Authentication & User Management
- **Magic Link Authentication** - Passwordless email-based login
- **JWT Session Management** - HttpOnly cookies for security
- **Email Verification** - 6-digit OTP system via Brevo
- **Password Reset** - Forgot/reset password flow
- **Role-Based Access Control** - Freelancer, Client, Admin roles
- **Session Management** - Automatic token refresh
- **Rate Limiting** - 10 magic links/hour, 3 verification attempts
- **Audit Logging** - Compliance-grade event tracking

### 👤 User Profiles & Management
- **Profile System** - Comprehensive user profiles with completion tracking
- **Profile Completion Wizard** - 5-section guided setup:
  1. Profile Picture
  2. Bio
  3. Skills & Expertise
  4. Location & Hourly Rate
  5. Portfolio Items
- **Avatar Management** - Upload and manage profile pictures
- **Skills Management** - Add/remove skills with visual indicators
- **Portfolio System** - Upload and showcase work samples (images, PDFs, documents)
- **Profile Editing** - Real-time profile updates
- **User Statistics** - Completion rate, earnings, ratings, completed tasks

### 📋 Task Management
- **Task Creation** - Clients can post detailed tasks with:
  - Category and subcategory selection
  - Budget setting (fixed price or hourly)
  - Skill requirements
  - File attachments
  - Custom questions for applicants
  - Deadline management
  - Experience level requirements
- **Task Browsing** - Freelancers can:
  - Browse available projects
  - Filter by category, budget, skills, location
  - Search functionality
  - View task details and client information
- **Task Applications** - Multi-step application process:
  1. Proposal (cover letter, budget, timeline)
  2. Portfolio showcase
  3. Answer client questions
  4. Review and submit
- **Application Management** - Track application status (pending, accepted, rejected, withdrawn, interviewing)
- **Smart Task Matching** - AI-powered task recommendations for freelancers

### 💰 Financial Management & Payments
- **Escrow System** - Secure payment holding for tasks
- **Paystack Integration** - Payment processing for Nigerian market
- **Payment Milestones** - Track project progress payments
- **Withdrawal System** - Freelancers can withdraw earnings
- **Bank Account Management** - Add and manage bank accounts
- **Transaction History** - Complete financial activity tracking
- **Receipt Generation** - Automated receipt creation
- **Currency Support** - Multi-currency support (NGN, USD, etc.)

### 🆔 Identity Verification
- **Dojah Integration** - Automated identity verification (KYC)
- **Manual Verification** - Document-based verification for admin review
- **Verification Types**:
  - Identity verification (government ID, passport, driver's license)
  - Business verification (business license, registration)
  - Professional verification
- **Verification Status Tracking** - Real-time status updates
- **Document Upload** - Secure document storage
- **Admin Verification Queue** - Admin dashboard for reviewing submissions
- **Emergency Bypass** - Admin can instantly verify users

### 💬 Messaging & Communication
- **Messaging System** - Client-freelancer communication
- **Conversations** - Threaded message conversations
- **File Attachments** - Send files in messages
- **Read Receipts** - Message read status tracking
- **Real-time Updates** - Live message synchronization

### 🔔 Notifications
- **In-App Notifications** - Dashboard notifications
- **Email Notifications** - Brevo email service integration
- **Push Notifications** - Browser push notification support
- **Notification Types**:
  - Application status updates
  - New task matches
  - Payment releases
  - Profile views
  - Task deadlines
  - Messages

### 🛡️ Security Features
- **Row Level Security (RLS)** - Database-level access control
- **CSRF Protection** - Cross-site request forgery prevention
- **XSS Prevention** - Input sanitization
- **Secure File Uploads** - Validated file uploads (max 10MB)
- **Session Security** - HttpOnly cookies
- **Rate Limiting** - API endpoint protection
- **Audit Trails** - Complete action logging

### 👨‍💼 Admin Dashboard
- **User Management** - View and manage all users
- **Task Management** - Monitor and moderate tasks
- **Application Management** - Review applications
- **Verification Management** - Review verification requests
- **Support Requests** - Handle customer support tickets
- **Revenue Management** - Track platform revenue and fees
- **Analytics Dashboard** - Platform metrics and statistics
- **Settings Management** - Platform configuration

### 📊 Analytics & Reporting
- **User Statistics** - Completion rates, earnings, ratings
- **Task Analytics** - Task views, applications, completion rates
- **Financial Analytics** - Revenue, fees, pending payments
- **Platform Metrics** - User growth, engagement metrics
- **Performance Tracking** - Response times, success rates

### 🎨 UI/UX Features
- **Responsive Design** - Mobile-first approach
- **Dark Mode** - Theme switching support
- **Component Library** - 50+ reusable UI components (Radix UI)
- **Loading States** - Visual feedback during operations
- **Error Handling** - User-friendly error messages
- **Form Validation** - Real-time input validation
- **Toast Notifications** - Action feedback system

---

## 2. User Roles

### 👨‍💻 Freelancer
- Browse and search tasks
- Submit applications
- Manage portfolio
- Track earnings and payments
- Withdraw funds
- Manage profile and skills
- Receive notifications
- Message clients
- View application status

### 👨‍💼 Client
- Create and manage tasks
- Review applications
- Accept/reject freelancers
- Manage escrow payments
- Release payments
- Provide feedback and ratings
- Message freelancers
- Track project progress

### 🔧 Admin
- User management (view, edit, delete)
- Task moderation
- Application oversight
- Verification approval/rejection
- Support request handling
- Revenue management
- Platform analytics
- System configuration
- Emergency user verification bypass

---

## 3. Data Models / Database Tables

### Core Tables

#### `users`
- User profiles and authentication
- Fields: id, email, name, user_type, avatar_url, is_verified, dojah_verified, phone, bio, location, hourly_rate, skills[], rating, completed_tasks, total_earned, join_date, last_active, is_active

#### `tasks`
- Project listings
- Fields: id, client_id, title, description, category, subcategory, skills_required[], budget_type, budget_min, budget_max, currency, duration, location, experience_level, urgency, status, visibility, requirements[], questions[], attachments[], applications_count, views_count, deadline

#### `applications`
- Freelancer applications to tasks
- Fields: id, task_id, freelancer_id, proposed_budget, budget_type, estimated_duration, cover_letter, attachments[], status, applied_date, response_date, feedback

#### `escrow_accounts`
- Payment escrow management
- Fields: id, task_id, client_id, freelancer_id, amount, currency, status, milestones[], payment_reference, release_conditions, dispute_reason

#### `messages`
- User messaging system
- Fields: id, conversation_id, sender_id, receiver_id, content, message_type, attachments[], is_read

#### `notifications`
- User notifications
- Fields: id, user_id, title, message, type, data, is_read, created_at

### Authentication Tables

#### `magic_links`
- Magic link tokens for passwordless auth
- Fields: id, email, token, type, user_type, expires_at, used_at, created_at

#### `user_sessions`
- JWT session tracking
- Fields: id, user_id, session_token, user_type, expires_at, ip_address, user_agent, is_active

#### `audit_logs`
- Security audit trail
- Fields: id, user_id, email, action, user_type, success, ip_address, user_agent, details, created_at

#### `rate_limit_attempts`
- Rate limiting tracking
- Fields: id, identifier, action_type, attempts, window_start, created_at

### Verification Tables

#### `user_verification_requests`
- Manual verification submissions
- Fields: id, user_id, verification_type, documents[], submitted_data, status, reviewed_by, review_notes, reviewed_at

### Admin Tables

#### `admin_sessions`
- Admin session management
- Fields: id, admin_id, session_token, ip_address, user_agent, is_active, expires_at, last_accessed_at

#### `admin_activity_log`
- Admin action tracking
- Fields: id, admin_id, action_type, resource_type, resource_id, description, old_values, new_values, ip_address, user_agent, session_id

#### `platform_analytics`
- Platform metrics snapshots
- Fields: id, date, hour, total_users, new_users_today, active_users_today, freelancers_count, clients_count, total_tasks, new_tasks_today, revenue_today, platform_fees_today, etc.

#### `support_requests`
- Customer support tickets
- Fields: id, user_id, subject, message, category, priority, status, assigned_to, resolution_notes, created_at, updated_at

#### `feature_flags`
- Feature toggle management
- Fields: id, name, description, is_enabled, target_user_types[], rollout_percentage, created_at, updated_at

### Additional Tables

#### `portfolio_items`
- User portfolio work samples
- Fields: id, user_id, title, description, file_url, file_type, created_at

#### `email_otps`
- Email verification codes
- Fields: id, email, otp, type, expires_at, used, created_at

#### `admin_users`
- Admin user accounts
- Fields: id, email, name, role, permissions[], is_active, last_login

---

## 4. API Endpoints

### Authentication (`/api/auth/`)
- `POST /api/auth/send-magic-link` - Send magic link for login/signup
- `GET /api/auth/verify-magic-link` - Verify magic link token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user session

### Tasks (`/api/tasks/`)
- `GET /api/tasks` - List all tasks
- `POST /api/tasks/create` - Create new task
- `GET /api/tasks/browse` - Browse tasks with filters
- `GET /api/tasks/[id]` - Get task details
- `PUT /api/tasks/[id]/update` - Update task
- `GET /api/tasks/[id]/applications` - Get task applications
- `POST /api/tasks/[id]/applications/[applicationId]/accept` - Accept application
- `POST /api/tasks/[id]/applications/[applicationId]/reject` - Reject application
- `POST /api/tasks/apply` - Apply to task
- `GET /api/tasks/my-tasks` - Get user's tasks
- `GET /api/tasks/smart-matches` - Get smart task matches
- `GET /api/tasks/[id]/similar` - Get similar tasks
- `GET /api/tasks/[id]/escrow-status` - Get escrow status

### Applications (`/api/applications/`)
- `GET /api/applications/[id]` - Get application details
- `GET /api/applications/recent` - Get recent applications
- `POST /api/applications/[id]/progress` - Update application progress
- `POST /api/applications/[id]/withdraw` - Withdraw application

### Escrow (`/api/escrow/`)
- `POST /api/escrow/create` - Create escrow account
- `GET /api/escrow/[taskId]` - Get escrow details
- `POST /api/escrow/milestone` - Create/update milestone
- `POST /api/escrow/release` - Release escrow payment
- `POST /api/escrow/verify` - Verify payment

### Payments (`/api/paystack/`)
- `POST /api/paystack/initialize` - Initialize payment
- `POST /api/paystack/verify` - Verify payment
- `GET /api/paystack/test-connection` - Test Paystack connection

### User Profile (`/api/user/`)
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile/update` - Update user profile
- `GET /api/user/stats` - Get user statistics
- `GET /api/user/portfolio` - Get user portfolio
- `GET /api/user/reviews` - Get user reviews
- `GET /api/user/notification-preferences` - Get notification settings
- `PUT /api/user/notification-preferences` - Update notification settings
- `GET /api/user/privacy-settings` - Get privacy settings
- `PUT /api/user/privacy-settings` - Update privacy settings

### Verification (`/api/verification/`)
- `GET /api/verification/status` - Get verification status
- `POST /api/verification/manual` - Submit manual verification
- `POST /api/verification/manual-submit` - Submit verification documents

### Admin (`/api/admin/`)
- `GET /api/admin/users` - List all users
- `GET /api/admin/tasks` - List all tasks
- `GET /api/admin/tasks/id` - Get task by ID
- `GET /api/admin/applications` - List all applications
- `GET /api/admin/verification/requests` - Get verification requests
- `POST /api/admin/verification/[id]/approve` - Approve verification
- `POST /api/admin/verification/[id]/reject` - Reject verification
- `GET /api/admin/verifications` - List all verifications
- `GET /api/admin/verifications/[id]` - Get verification details
- `GET /api/admin/support-requests` - List support requests
- `GET /api/admin/support-requests/[id]` - Get support request
- `GET /api/admin/revenue/pending` - Get pending revenue
- `GET /api/admin/revenue/history` - Get revenue history
- `GET /api/admin/revenue/config` - Get revenue config
- `POST /api/admin/revenue/withdraw` - Withdraw revenue
- `GET /api/admin/settings` - Get admin settings
- `PUT /api/admin/settings` - Update admin settings

### Messages (`/api/messages/`)
- `GET /api/messages/conversations` - Get user conversations
- `POST /api/messages/send` - Send message

### Upload (`/api/upload/`)
- `POST /api/upload/avatar` - Upload avatar
- `POST /api/upload/portfolio` - Upload portfolio item

### Bank Accounts (`/api/bank-accounts/`)
- `GET /api/bank-accounts` - List bank accounts
- `POST /api/bank-accounts` - Add bank account
- `PUT /api/bank-accounts/[id]/default` - Set default bank account

### Banks (`/api/banks/`)
- `GET /api/banks` - List Nigerian banks
- `POST /api/banks/verify` - Verify bank account

### Withdrawals (`/api/withdrawals/`)
- `GET /api/withdrawals` - List withdrawals
- `POST /api/withdrawals` - Create withdrawal request

### Webhooks (`/api/webhooks/`)
- `POST /api/webhooks/paystack` - Paystack webhook handler

### Push Notifications (`/api/push/`)
- `POST /api/push/subscribe` - Subscribe to push notifications
- `POST /api/push/send` - Send push notification

### Support (`/api/support/`)
- `POST /api/support` - Create support request

### Receipts (`/api/receipts/`)
- `POST /api/receipts/generate` - Generate receipt

---

## 5. External Integrations

### Supabase
- **Database** - PostgreSQL database with Row Level Security
- **Authentication** - User authentication and session management
- **Storage** - File storage for avatars, portfolios, documents
- **Real-time** - Real-time data synchronization
- **Functions** - Serverless functions

### Brevo (formerly Sendinblue)
- **Email Service** - Transactional email delivery
- **Templates** - Magic link emails, verification emails, notifications
- **SMTP** - Email sending via API

### Paystack
- **Payment Processing** - Nigerian payment gateway
- **Escrow Payments** - Secure payment holding
- **Webhooks** - Payment status updates
- **Bank Verification** - Nigerian bank account verification

### Dojah
- **Identity Verification** - KYC/AML compliance
- **Document Verification** - Government ID verification
- **Business Verification** - Business registration verification
- **SDK Integration** - React SDK for verification widget

### Browser APIs
- **Push Notifications** - Browser push notification API
- **Service Workers** - PWA support

---

## 6. Major Components & Modules

### Core Libraries (`lib/`)

#### Authentication
- `auth-helpers.ts` - Client-side auth helpers
- `auth.ts` - Auth configuration
- `server-session-manager.ts` - JWT session management
- `magic-link-manager.ts` - Magic link generation/verification
- `rate-limiter.ts` - API rate limiting

#### Services
- `email-service.ts` - Brevo email integration
- `paystack-service.ts` - Paystack payment integration
- `paystack-config.ts` - Paystack configuration
- `verification-service.ts` - Identity verification service
- `withdrawal-service.ts` - Withdrawal processing
- `database-service.ts` - Database operations
- `push-notifications.ts` - Push notification service

#### Utilities
- `supabase.ts` - Supabase client setup
- `supabaseClient.ts` - Client-side Supabase client
- `utils.ts` - General utilities
- `api-utils.ts` - API helper functions
- `currency.ts` - Currency formatting
- `avatar-utils.ts` - Avatar management
- `audit-logger.ts` - Audit logging system

### UI Components (`components/`)

#### Core Components
- `dashboard-header.tsx` - Main dashboard header
- `app-sidebar.tsx` - Application sidebar navigation
- `admin-sidebar.tsx` - Admin sidebar navigation
- `admin-chart.tsx` - Admin analytics charts
- `brand-logo.tsx` - Brand logo component

#### Task Management
- `task-browser.tsx` - Task browsing interface
- `task-posting-form.tsx` - Task creation form
- `smart-task-matching.tsx` - Smart matching component
- `view-application-modal.tsx` - Application viewing modal

#### Profile & User
- `profile-completion.tsx` - Profile completion wizard
- `profile-completion-wizard.tsx` - Step-by-step wizard
- `user-avatar.tsx` - User avatar component
- `verification-gate.tsx` - Verification requirement gate
- `verification-status-card.tsx` - Verification status display

#### Verification
- `enhanced-id-verification.tsx` - Enhanced verification component
- `identity-verification.tsx` - Identity verification form
- `manual-verification-form.tsx` - Manual verification form
- `ManualVerificationFallback.tsx` - Fallback verification
- `verification-status.tsx` - Verification status display
- `verification-status-badge.tsx` - Status badge
- `verification-status-simple.tsx` - Simple status display

#### Payments & Financial
- `escrow-setup-modal.tsx` - Escrow setup
- `escrow-details-modal.tsx` - Escrow details
- `payment-modal.tsx` - Payment processing
- `payment-link-modal.tsx` - Payment link generation
- `payment-settings.tsx` - Payment configuration
- `withdrawal-modal.tsx` - Withdrawal request
- `bank-account-management.tsx` - Bank account management
- `bank-account-modal.tsx` - Bank account modal
- `receipt-generator.tsx` - Receipt generation
- `currency-display.tsx` - Currency formatting
- `naira-icon.tsx` - Nigerian Naira icon

#### Messaging & Communication
- `support-modal.tsx` - Support request modal
- `notification-dropdown.tsx` - Notification dropdown

#### Settings & Preferences
- `dashboard-preferences.tsx` - User preferences
- `company-settings.tsx` - Company settings
- `security-settings.tsx` - Security settings
- `pin-setup-modal.tsx` - PIN setup

#### Admin
- `admin-sidebar.tsx` - Admin navigation
- `admin-chart.tsx` - Analytics charts

#### Utilities
- `file-upload.tsx` - File upload component
- `progress-tracking.tsx` - Progress tracking
- `dispute-modal.tsx` - Dispute resolution
- `milestone-manager.tsx` - Milestone management
- `global-search.tsx` - Global search
- `saved-filters.tsx` - Saved filter management
- `theme-provider.tsx` - Theme management

#### UI Component Library (`components/ui/`)
- 50+ reusable components built on Radix UI:
  - Form components (input, select, textarea, checkbox, radio)
  - Layout components (card, sheet, dialog, drawer, tabs)
  - Navigation (sidebar, breadcrumb, navigation-menu)
  - Feedback (toast, alert, progress, skeleton)
  - Data display (table, badge, avatar, chart)
  - And more...

### Contexts (`contexts/`)
- `auth-context.tsx` - Authentication state management
- Additional context providers for app state

### Hooks (`hooks/`)
- `use-applications-real.ts` - Application data hook
- `use-browse-task.ts` - Task browsing hook
- `use-mobile.tsx` - Mobile detection hook
- `use-pin-status.ts` - PIN status hook
- `use-real-data.ts` - Real data fetching hook
- `use-support-count.ts` - Support count hook
- `use-toast.ts` - Toast notification hook
- `useEnhancedVerification.ts` - Verification hook

### Pages (`app/`)

#### Public Pages
- `/` - Landing page
- `/login` - Login page
- `/signup` - Signup page
- `/forgot-password` - Password reset
- `/reset-password` - Password reset confirmation
- `/legal` - Legal information
- `/auth/callback` - Auth callback handler

#### Dashboard Pages (`/dashboard/`)
- `/dashboard` - Main dashboard
- `/dashboard/tasks` - Task management
- `/dashboard/tasks/create` - Create task
- `/dashboard/tasks/[id]` - Task details
- `/dashboard/tasks/[id]/edit` - Edit task
- `/dashboard/tasks/[id]/applications` - Task applications
- `/dashboard/browse` - Browse tasks
- `/dashboard/browse/[id]` - Task details (browse view)
- `/dashboard/applications` - My applications
- `/dashboard/applications/[id]` - Application details
- `/dashboard/profile` - User profile
- `/dashboard/profile/edit` - Edit profile
- `/dashboard/messages` - Messaging
- `/dashboard/settings` - Settings
- `/dashboard/payments` - Payment management
- `/dashboard/payments/escrow` - Escrow management
- `/dashboard/payments/withdrawals` - Withdrawals
- `/dashboard/verification` - Verification status
- `/dashboard/verification/enhanced` - Enhanced verification
- `/dashboard/verification/manual` - Manual verification
- `/dashboard/escrow` - Escrow overview
- `/dashboard/escrow/setup` - Escrow setup

#### Admin Pages (`/admin/`)
- `/admin/dashboard` - Admin dashboard
- `/admin/users` - User management
- `/admin/tasks` - Task management
- `/admin/applications` - Application management
- `/admin/verification` - Verification management
- `/admin/verifications` - All verifications
- `/admin/support` - Support requests
- `/admin/settings` - Admin settings

---

## 7. Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Recharts** - Chart library
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Sonner** - Toast notifications
- **Next Themes** - Theme management

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Storage
  - Real-time subscriptions
- **Jose** - JWT handling
- **Node.js 20.x** - Runtime environment

### External Services
- **Brevo** - Email service
- **Paystack** - Payment processing
- **Dojah** - Identity verification

### Development Tools
- **TypeScript** - Type checking
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

---

## 8. Security Features

- **Row Level Security (RLS)** - Database-level access control
- **JWT Authentication** - Secure token-based auth
- **HttpOnly Cookies** - XSS protection
- **CSRF Protection** - Cross-site request forgery prevention
- **Rate Limiting** - API abuse prevention
- **Input Validation** - Zod schema validation
- **File Upload Validation** - Size and type restrictions
- **Audit Logging** - Complete action tracking
- **Secure File Storage** - Supabase Storage with access controls
- **Environment Variables** - Secure configuration management

---

## 9. Database Architecture

### Primary Database: Supabase PostgreSQL

#### Key Features
- **Row Level Security (RLS)** - Fine-grained access control
- **Foreign Key Constraints** - Data integrity
- **Indexes** - Performance optimization
- **Triggers** - Automated actions
- **Functions** - Stored procedures
- **Views** - Aggregated data views

#### Schema Organization
- Core tables (users, tasks, applications)
- Authentication tables (sessions, magic_links)
- Financial tables (escrow_accounts, transactions)
- Admin tables (admin_sessions, activity_logs)
- Analytics tables (platform_analytics)
- Support tables (support_requests)

---

## 10. Deployment & Infrastructure

### Current Setup
- **Development** - Local Next.js dev server
- **Database** - Supabase cloud PostgreSQL
- **Storage** - Supabase Storage
- **Email** - Brevo cloud service
- **Payments** - Paystack cloud service

### Configuration Files
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `next.config.mjs` - Next.js configuration
- `middleware.ts` - Route protection
- `.env.local` - Environment variables (not in repo)

---

## Summary

TaskLinker is a **comprehensive freelance marketplace platform** with:

✅ **Complete authentication system** (magic links, JWT sessions)  
✅ **Full task management** (creation, browsing, applications)  
✅ **Payment processing** (escrow, Paystack integration)  
✅ **Identity verification** (Dojah + manual verification)  
✅ **User profiles** (portfolios, skills, ratings)  
✅ **Messaging system** (client-freelancer communication)  
✅ **Admin dashboard** (user management, analytics)  
✅ **Security features** (RLS, rate limiting, audit logs)  
✅ **Modern tech stack** (Next.js 15, TypeScript, Supabase)

The platform supports **three user roles** (Freelancer, Client, Admin) with role-specific features and access controls. The codebase is well-organized with clear separation of concerns, comprehensive API endpoints, and a robust component library.
