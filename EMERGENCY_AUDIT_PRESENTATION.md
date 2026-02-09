# TaskLinker – Emergency Audit for Presentation

**Date:** February 6, 2026  
**Purpose:** 1-hour prep – what works, what’s missing, quick wins for demo.

---

## 1. Feature status (Red / Yellow / Green)

| Feature | Status | Notes |
|--------|--------|------|
| **In-app notifications (system & user-to-user)** | **Red** | UI only. `contexts/notification-context.tsx` loads **mock data only** (hardcoded array). No API fetches from DB. **No `GET /api/notifications` route exists.** `notifications` table exists in schema but is **never queried**. No real system or user-to-user notifications. |
| **Job categories (listings, filtering, assignment)** | **Green** | Categories hardcoded in `components/task-browser.tsx` (Web Dev, Mobile, Design, Writing, etc.). Browse API (`/api/tasks/browse`) filters by `category`, budget, location, search. Create/edit task use category. Listings and filtering work. **Presentation ready.** |
| **Payment integration (checkout, escrow, direct)** | **Yellow** | **Escrow:** Create (`/api/escrow/create`), verify (Paystack), release, milestones implemented. Paystack init may use mock in some flows. **Dashboard Payments page** (`/dashboard/payments`) is **100% mock** (hardcoded `escrowPayments`, `completedPayments`, stats). **Escrow page** (`/escrow`, `/dashboard/escrow`) also uses mock transaction list. Withdrawals API and bank verification exist; `/withdrawals` uses mock balance/history; bank accounts from API. |
| **ID verification (profile status, document upload, third-party)** | **Yellow** | **Status:** `/api/verification/status` reads `users` + `manual_verification_requests`. **Manual flow:** `manual-verification-form` + `/api/verification/manual-submit` upload to storage and create submissions (real). **Manual verification page** (`/dashboard/verification/manual`) may simulate upload. **Enhanced (Dojah):** Components and verification-service exist; depends on Dojah config. **`components/identity-verification.tsx`** is **mock only** (setTimeout + `updateProfile({ isVerified: true })`, no document upload or verification API). |
| **Messaging (real-time or inbox)** | **Yellow** | **Inbox:** Conversations and messages loaded from Supabase; send from messages page via **direct Supabase** insert. **Bug:** DB schema has `receiver_id`; messages page insert **does not set `receiver_id`** – can fail if column is NOT NULL. No real-time (no Supabase realtime subscription). `/api/messages/send` uses wrong columns (`type`, `read` instead of `message_type`, `is_read`) and no `receiver_id` – **do not use for send**. |
| **Financials (earnings, transaction history)** | **Yellow** | **Earnings:** Dashboard uses `useRealDashboardData` → `DashboardService.getStats()` → `totalEarnings` from `profile.total_earned` (real). **Transaction history:** `/dashboard/payments` “Payment History” is **mock**. No dedicated user-facing “transaction history” API. Withdrawal history on withdrawals page is mock. |

---

## 2. Current user stories that actually work (demo-safe)

- **Auth:** Magic link signup/login, session, logout, rate limiting.
- **Profile:** View/edit profile, avatar upload, skills, portfolio, profile completion, stats (including `total_earned` on profile).
- **Tasks (client):** Create task (category, budget, skills), my tasks, task detail, edit, view applications, accept/reject application.
- **Tasks (freelancer):** Browse with category/budget/search filters, task detail, apply, my applications, application detail, withdraw application.
- **Escrow (client):** Create escrow (Paystack flow), view escrow by task (`/api/escrow/[taskId]`), task escrow status, milestones, release payment (API + Paystack).
- **Verification:** View status, manual submission (use **manual-verification-form** + **manual-submit** API; avoid manual page’s simulated upload in demo), admin approve/reject.
- **Messaging:** List conversations, open thread, send message (fix `receiver_id` for DB reliability).
- **Settings:** Notification preferences (API + DB), privacy, PIN, payment settings UI.
- **Admin:** Users, tasks, applications, support, revenue endpoints, verification queue, settings.

---

## 3. Ghost / broken files

| File | Issue |
|------|--------|
| **`components/payment-link-modal.tsx`** | **Empty file.** Imported by `app/escrow/page.tsx` and `app/dashboard/escrow/page.tsx`. Opening “Payment link” or “Share Payment Link” will break or show nothing. |
| **`contexts/notification-context.tsx`** | No real logic: only mock array. No fetch from `notifications` table. |
| **`app/dashboard/payments/page.tsx`** | All data hardcoded (escrow list, completed payments, totals). No API calls. |
| **`app/withdrawals/page.tsx`** | Balance and withdrawal history mock; only bank accounts are from API. |
| **`components/identity-verification.tsx`** | Submit is fake (setTimeout + local state). No document upload or verification API. |
| **`app/dashboard/verification/manual/page.tsx`** | File upload may be simulated (no storage); may submit blob URLs. Prefer manual-verification-form + manual-submit flow for demo. |
| **`app/api/messages/send/route.ts`** | Uses `type`/`read` and omits `receiver_id`; does not match DB schema (`message_type`, `is_read`, `receiver_id`). Frontend uses Supabase directly, so this route is unused/broken. |
| **`app/escrow/page.tsx`** | Uses `mockTransactions` and `mockDisputes`; no fetch from `escrow_accounts`. |

---

## 4. Top 3 quick wins (~30 min for demo)

### 1. Replace mock data on Dashboard Payments page (≈10 min)

- **File:** `app/dashboard/payments/page.tsx`
- **Change:** Fetch real data instead of hardcoded arrays:
  - **Earnings / totals:** Use `useAuth()` + `/api/user/profile` or existing stats (e.g. `total_earned`). Show “Total Earnings” from profile; “In Escrow” / “Available” can be derived from escrow list or left as placeholder with real total.
  - **Escrow list:** Add `GET /api/escrow/list` (or similar) that returns `escrow_accounts` where `client_id` or `freelancer_id` = current user, then use it here. If no time, at least replace hardcoded totals with `profile.total_earned` and show “— in escrow” / “— available” with a note that details load from task-level escrow.
  - **Payment history:** From `escrow_accounts` where `status = 'released'` for current user (or existing transactions table if present).
- **Why:** Demo shows “Payments & Escrow” with real-looking history and escrow list.

### 2. Implement `PaymentLinkModal` or hide the button (≈10 min)

- **File:** `components/payment-link-modal.tsx` (currently empty)
- **Options:**
  - **A)** Add a minimal modal that opens Paystack checkout (reuse same init as escrow) with “Copy payment link” using existing Paystack initialize.
  - **B)** In `app/escrow/page.tsx` and `app/dashboard/escrow/page.tsx`, remove or disable the “Payment link” / “Share Payment Link” button so the modal is never opened.
- **Why:** Prevents blank/broken modal during demo.

### 3. Wire notifications to the database (≈10 min)

- **Files:** `contexts/notification-context.tsx`, new: `app/api/notifications/route.ts` (GET)
- **Change:**
  - Add **GET `/api/notifications`** that reads from `notifications` for current user (auth via cookie/session).
  - In `NotificationProvider`, on mount (when user is set), call that API and set `notifications` from response instead of mock array.
  - Keep existing UI (mark read, clear); optionally add mark-as-read API and call it when user marks read.
- **Why:** Bell icon shows real “Application accepted” / “Payment released” style events (if you insert them when those actions happen), making notifications look live.

---

## 5. Summary table

| Feature              | Status | Demo note |
|----------------------|--------|-----------|
| Notifications        | Red    | Use quick win #3 or avoid demoing as “live”. |
| Job categories       | Green  | Safe: browse, create, filter by category. |
| Payment / escrow     | Yellow | Show escrow create/release; use quick win #1 for payments page. |
| ID verification      | Yellow | Show status + manual submit (form + API); avoid identity-verification.tsx and manual page upload. |
| Messaging            | Yellow | Show inbox + send; fix `receiver_id` in messages page insert if DB enforces it. |
| Financials            | Yellow | Show dashboard earnings (real); use quick win #1 for payment history. |

---

## 6. Suggested demo flow (to look complete)

1. **Login** (magic link).
2. **Dashboard** – show stats (earnings from profile), verification banner if unverified.
3. **Browse tasks** – filter by category, open a task, apply (as freelancer).
4. **My tasks** (as client) – open task → applications → accept one.
5. **Escrow** – create/fund (Paystack), then release (if you have a completed task).
6. **Messages** – open Messages, pick conversation, send one message.
7. **Verification** – show status; optionally submit manual (use form that hits real API).
8. **Payments** – open Payments (after quick win #1) to show escrow list and history.
9. **Avoid:** “Payment link” button (until quick win #2), in-app notifications as “live” (until quick win #3), `identity-verification.tsx` submit, and manual verification page upload if it’s simulated.

Good luck with the presentation.
