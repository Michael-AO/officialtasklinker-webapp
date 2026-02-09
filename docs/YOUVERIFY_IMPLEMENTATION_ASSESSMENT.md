# YouVerify Implementation Assessment

**Purpose:** Summary of the current YouVerify (KYC) integration for solution architecture review.

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              USER (Browser)                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│  Sidebar: "Verification" link → /dashboard/verification                           │
│           "Verify now" button → opens YouVerifyModal                              │
│                                                                                   │
│  YouVerifyModal:                                                                  │
│    1. POST /api/verification/youverify/start  → get sessionId                     │
│    2. Load YouVerify Liveness Web SDK (CDN)                                       │
│    3. SDK.init({ sessionId, container })  → user completes liveness               │
│    4. "I've completed verification" → Processing state, poll status every 3s     │
│    5. When verified: success animation, then redirect to /dashboard/browse        │
│    6. (Fallback) "Verification" / "Use fallback" → simulate-verification          │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         OUR BACKEND (Next.js API Routes)                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│  POST /api/verification/youverify/start                                            │
│    • Auth: session cookie (ServerSessionManager.getCurrentUser())                  │
│    • Calls YouVerify: POST .../v2/api/identity/sdk/liveness/session/generate       │
│    • Headers: token = YOUVERIFY_API_KEY | YOUVERIFY_API_SECRET | YOUVERIFY_API_TOKEN │
│    • Body: { ttlSeconds: 300, metadata: { userId, email } }                        │
│    • Returns: { sessionId, expiresAt } or { error, message }                      │
│    • Fallback: if no sessionId, tries .../liveness/token with publicMerchantID   │
│    • Config: YOUVERIFY_BASE_URL validated at load (HTTPS required in production)  │
│    • GET same path: health check (status, masked baseUrl, environment, timestamp)  │
│                                                                                   │
│  POST /api/webhooks/youverify                                                     │
│    • Auth: HMAC-SHA256 signature (x-youverify-signature / X-YouVerify-Signature)  │
│    • Secret: YOUVERIFY_WEBHOOK_SECRET                                             │
│    • On event verification.approved / status approved / success:                   │
│      → Update users: is_verified=true, kyc_status=VERIFIED, youverify_id,         │
│        kyc_last_checked=now                                                       │
│    • User matching: by data.metadata.userId only (valid UUID); no email/ID fallback │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         YOUVERIFY (External)                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│  • Session generate / Liveness token API (sandbox: api.sandbox.youverify.co)     │
│  • Liveness Web SDK: youverify-liveness-web (CDN: jsDelivr UMD build)             │
│  • Webhook: calls our POST /api/webhooks/youverify when verification completes    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Model

### Environment Variables

| Variable | Purpose | Required For |
|----------|---------|--------------|
| `YOUVERIFY_API_KEY`, `YOUVERIFY_API_SECRET`, or `YOUVERIFY_API_TOKEN` | Server-side API token for session/token generation | Starting verification (SDK session) |
| `NEXT_PUBLIC_YOUVERIFY_MERCHANT_KEY` | Public merchant ID (optional) | Fallback liveness token endpoint |
| `YOUVERIFY_WEBHOOK_SECRET` | HMAC secret to verify webhook payloads | Webhook handler |
| `YOUVERIFY_BASE_URL` | Optional override; default `https://api.sandbox.youverify.co`. Validated at load: must be valid URL; **HTTPS required in production**. | Session/token API base URL |

### Database (Supabase `users` table)

| Column | Type | Purpose |
|--------|------|---------|
| `is_verified` | boolean | Gate for Browse Tasks, Applications, Post Task (sidebar + API checks) |
| `verification_type` | text (nullable) | e.g. `"identity"` (set by simulate; webhook doesn’t set it) |
| `kyc_status` | text | Set by webhook to `VERIFIED` on success, `FAILED` on failure |
| `youverify_id` | text (nullable) | YouVerify customer/identity ID from webhook |
| `kyc_last_checked` | timestamptz (nullable) | Last verification completion time |
| `kyc_fail_reason` | text (nullable) | Failure reason from YouVerify (e.g. "Image too blurry"); set on failure webhook |

Defined in: `scripts/30-phase3-financials-identity.sql` and `scripts/32-kyc-fail-reason.sql`.

---

## 3. User Flows

### 3.1 Start verification (in-app)

1. User clicks **Verify now** in sidebar (or goes to `/dashboard/verification` and uses YouVerify flow there if linked).
2. **YouVerifyModal** opens and calls `POST /api/verification/youverify/start`.
3. Backend calls YouVerify session generate (or liveness token fallback), returns `sessionId` or error.
4. If `sessionId`: frontend loads YouVerify Liveness Web SDK and runs `init({ sessionId, container })`. User completes liveness, then clicks **"I've completed verification"**.
5. Modal enters **Processing** state and short-polls `GET /api/verification/status` every 3 seconds for up to 30 seconds. When the backend returns verified (webhook has run), the modal shows a success checkmark, then closes and redirects to `/dashboard/browse`. If 30s elapses without verified, a friendly timeout message is shown.
6. If error / no config: modal shows message and a **Verification** button that calls `POST /api/debug/simulate-verification` (demo fallback).

### 3.2 Completion (webhook)

1. After user completes the flow in the SDK, YouVerify processes the result and sends a webhook to our app.
2. `POST /api/webhooks/youverify` receives the event.
3. Signature is verified with `YOUVERIFY_WEBHOOK_SECRET` (HMAC-SHA256).
4. For **success** events (`verification.approved` / `status === "approved"` / `event === "success"`):
   - User is updated **only when** `data.metadata.userId` is present and is a valid UUID. Email and youverify_id fallbacks were removed for security (identity-switch prevention).
   - `users` is updated: `is_verified = true`, `kyc_status = 'VERIFIED'`, `youverify_id`, `kyc_last_checked`, `kyc_fail_reason = null`, `updated_at`.
5. For **failure** events (`verification.rejected` / `verification.failed` / `status === "failed"` or `"rejected"`): same strict `metadata.userId` check; then set `kyc_status = 'FAILED'`, `kyc_fail_reason` from payload (e.g. `data.reason` or `data.message`).
6. UI sees updated state via polling in the modal or on next request; `getCurrentUser()` reads `is_verified` from DB.

### 3.3 Where verification is enforced

- **UI:** Sidebar links for Browse Tasks, Applications, Post New Task, Find Work redirect to `/dashboard/verification` if `!user?.isVerified`.
- **API:** e.g. `POST /api/tasks/create` returns an error if the user’s `is_verified` is false (must complete verification to post tasks).
- **VerificationGate** component wraps pages (e.g. Post Task); when not verified it shows "Verify now" (YouVerify modal) and "Submit documents (manual)" as options.

---

## 4. Implemented Components

| Component | Location | Notes |
|-----------|----------|--------|
| Session start API | `app/api/verification/youverify/start/route.ts` | Session generate + optional liveness token fallback; config validation (HTTPS in prod); 15s timeout; rate-limit/network error handling; GET health check |
| Webhook handler | `app/api/webhooks/youverify/route.ts` | Signature verification; updates `users` on success |
| YouVerify modal | `components/youverify-modal.tsx` | Loads SDK, init with sessionId, fallback “Verification” (simulate) |
| Sidebar entry | `components/app-sidebar.tsx` | Verification group: link to `/dashboard/verification`, “Verify now” opens modal |
| Simulate (demo) | `app/api/debug/simulate-verification/route.ts` | Sets `is_verified`, `verification_type` for current user |
| Verification status API | `app/api/verification/status/route.ts` | Returns status for manual/verification page (is_verified, type, etc.) |
| Auth / session | `lib/server-session-manager.ts` | `getCurrentUser()` reads fresh `is_verified` from DB |

---

## 5. Gaps and Considerations for Solution Architect

### 5.1 Webhook payload and user matching

- **Current:** User matching is **userId-only**. We update a user only when `data.metadata.userId` is present and is a valid UUID. Email and youverify_id fallbacks were removed to prevent identity-switch or wrong-user updates.
- **Contract:** Session generate sends `metadata: { userId: user.id, email: user.email }` so YouVerify must include `metadata.userId` in the webhook payload. Without it, we acknowledge the webhook but do not update any user.

### 5.2 SDK init contract

- **Current:** We assume the global from `youverify-liveness-web` UMD build is `YouVerifyLiveness.init({ sessionId, container })`. This was inferred from docs; the exact global name/API may need to be confirmed against the published SDK (or YouVerify support).
- **Fallback:** If SDK fails to load or init, we show “Having trouble? Use fallback” which calls simulate-verification.

### 5.3 No polling after SDK completion

- **Current:** When the user finishes the flow in the SDK, we do not poll our backend or YouVerify for status. We rely entirely on the webhook to update `is_verified`.
- **Implication:** There may be a delay (seconds to minutes) until the webhook fires and the user sees “verified” (e.g. after refresh or next navigation). Optional improvement: poll `GET /api/verification/status` or YouVerify status API after SDK close, or show “Verification submitted; we’ll update your status shortly.”

### 5.4 CSP and SDK script

- **Current:** CSP in `next.config.mjs` allows: `script-src` includes `https://cdn.jsdelivr.net`; `frame-src` includes `https://*.youverify.co`; `connect-src` includes `https://api.sandbox.youverify.co` and `https://api.youverify.co`. YouVerify Liveness SDK is loaded from jsDelivr (UMD build).

### 5.5 Production vs sandbox

- **Current:** Default base URL is YouVerify sandbox. Production would require `YOUVERIFY_BASE_URL` (and possibly production API key and webhook URL) to be set and for the webhook to be registered in YouVerify’s production settings.

### 5.6 Manual verification path

- The app also has a manual verification path (e.g. `ManualVerificationFlow`, `manual_verification_requests` table, admin approve/reject). This is separate from YouVerify. Both paths set `is_verified`; no conflict in current design, but worth documenting that two verification mechanisms exist.

### 5.7 Webhook URL

- YouVerify must be configured to send webhooks to:  
  `https://<your-domain>/api/webhooks/youverify`  
  (e.g. production: `https://tasklinkers.com/api/webhooks/youverify`).

### 5.8 Ops: Webhook secret rotation

- Rotate `YOUVERIFY_WEBHOOK_SECRET` periodically (e.g. annually). Update the secret in YouVerify dashboard and in your environment so signature verification continues to succeed.

---

## 6. Quick Reference: Key Files

| Concern | File(s) |
|--------|---------|
| Start session / get sessionId | `app/api/verification/youverify/start/route.ts` |
| Webhook → update user | `app/api/webhooks/youverify/route.ts` |
| Modal + SDK load + init | `components/youverify-modal.tsx` |
| Sidebar “Verify now” | `components/app-sidebar.tsx` |
| Demo bypass | `app/api/debug/simulate-verification/route.ts` |
| DB schema (YouVerify columns) | `scripts/30-phase3-financials-identity.sql`, `scripts/32-kyc-fail-reason.sql` |
| Auth / is_verified source of truth | `lib/server-session-manager.ts` (getCurrentUser) |
| Verification status for UI | `app/api/verification/status/route.ts` |

---

## 7. Summary for Architect

- **Flow:** In-app “Verify now” → our API gets a YouVerify session (or token) → we load YouVerify Liveness Web SDK and pass `sessionId` → user completes flow → YouVerify sends webhook → we verify signature and update `users` (`is_verified`, `kyc_status`, `youverify_id`, `kyc_last_checked`). Access control (sidebar and APIs) is based on `is_verified` from DB. After the user clicks I've completed verification, the modal polls status every 3s for 30s; when verified, success animation and redirect to browse. Webhook updates only when `metadata.userId` is a valid UUID; failure events set `kyc_fail_reason`.
- **Strengths:** userId-only webhook matching; HMAC signature verification; post-SDK polling and success UX; CSP updated for YouVerify; `kyc_fail_reason` for friendly failure messages; VerificationGate offers YouVerify + manual fallback.
- **Ops:** Rotate `YOUVERIFY_WEBHOOK_SECRET` periodically (e.g. annually).
