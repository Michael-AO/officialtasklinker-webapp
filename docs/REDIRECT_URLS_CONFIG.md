# Redirect & callback URLs – production and dev

Use this list to configure **allowed redirect URLs**, **callback URLs**, and **webhook URLs** in each service (Paystack, YouVerify, Brevo, etc.) and in your env.

---

## Base URLs

| Environment | Base URL | Use in |
|-------------|----------|--------|
| **Development** | `http://localhost:3000` | `.env.local` as `NEXT_PUBLIC_APP_URL` |
| **Production** | `https://tasklinkers.com` | Production env as `NEXT_PUBLIC_APP_URL` |

---

## 1. Auth – magic link

Magic links point to your API; no “redirect URL” config in Brevo is required for the link itself. Ensure `NEXT_PUBLIC_APP_URL` matches the environment so links are correct.

| Purpose | URL | Where to add |
|---------|-----|----------------|
| Magic link verification (dev) | `http://localhost:3000/api/auth/verify-magic-link` | Link is built in code from `NEXT_PUBLIC_APP_URL` |
| Magic link verification (prod) | `https://tasklinkers.com/api/auth/verify-magic-link` | Same; set prod `NEXT_PUBLIC_APP_URL` |

After verification, users are redirected to:

- `/dashboard?verified=true` (client/freelancer)
- `/admin/dashboard?verified=true` (admin)
- `/login?error=...` (failure)

No external “allowed redirect URI” list is needed for these; they are same-origin.

---

## 2. Paystack

### Callback URL (redirect after payment)

Paystack redirects the user here after they pay. Add **both** dev and prod in the Paystack dashboard if you use both.

| Environment | Callback URL |
|-------------|--------------|
| **Development** | `http://localhost:3000/payment/callback` |
| **Production** | `https://tasklinkers.com/payment/callback` |

In code this is built as:  
`${NEXT_PUBLIC_APP_URL}/payment/callback` (query params like `?reference=...` are added by the app).

### Webhook URL (server-to-server)

Paystack sends payment/transfer events here. Must be a **public HTTPS** URL in production.

| Environment | Webhook URL |
|-------------|-------------|
| **Development** | `https://your-ngrok-or-tunnel-url/api/webhooks/paystack` (localhost not reachable by Paystack) |
| **Production** | `https://tasklinkers.com/api/webhooks/paystack` |

Add the production webhook URL in Paystack Dashboard → Settings → Webhooks.

---

## 3. YouVerify

### Webhook URL (verification events)

YouVerify calls this when verification completes. No user redirect URL is used (in-app SDK flow).

| Environment | Webhook URL |
|-------------|-------------|
| **Development** | `https://your-ngrok-or-tunnel-url/api/webhooks/youverify` (if testing webhooks locally) |
| **Production** | `https://tasklinkers.com/api/webhooks/youverify` |

Configure in YouVerify dashboard and set `YOUVERIFY_WEBHOOK_SECRET` in env to match.

---

## 4. App routes used as “return” or “redirect” targets (internal)

These are only used inside your app (e.g. `returnUrl` query param). You do **not** need to add them to Paystack/YouVerify/Brevo:

- `/dashboard`
- `/dashboard/verification`
- `/dashboard/escrow/setup` (and with `?taskId=...`)
- `/login` (with optional `?redirect=...`)

Middleware redirects unauthenticated users to `/login?redirect=<pathname>`.

---

## 5. Checklist for URL configuration

### Environment variables

- [ ] **Dev:** `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- [ ] **Prod:** `NEXT_PUBLIC_APP_URL=https://tasklinkers.com`

### Paystack dashboard

- [ ] **Callback URL (dev):** `http://localhost:3000/payment/callback`
- [ ] **Callback URL (prod):** `https://tasklinkers.com/payment/callback`
- [ ] **Webhook URL (prod):** `https://tasklinkers.com/api/webhooks/paystack`

### YouVerify dashboard

- [ ] **Webhook URL (prod):** `https://tasklinkers.com/api/webhooks/youverify`

### Brevo / email (required for login)

- [ ] **Production (Netlify):** Set `BREVO_API_KEY` in Site → Environment variables. If users see "api key not enabled" or login emails fail, the key is missing, wrong, or the Brevo account does not have API access.
- [ ] In Brevo: **Settings → SMTP & API → API Keys** – create a key with permission to send transactional email; use that value for `BREVO_API_KEY`.
- [ ] No redirect URL whitelist needed for magic links; links use `NEXT_PUBLIC_APP_URL` + `/api/auth/verify-magic-link?...`

### Password login – session cookie (production)

For password login to work in production (no redirect-back-to-login), set in Netlify (and ensure Supabase is the same project as local):

- [ ] **JWT_SECRET_KEY** – Used to sign session JWTs. If unset, the app falls back to `NEXT_PUBLIC_SUPABASE_ANON_KEY` (see `lib/server-session-manager.ts`). Prefer a dedicated secret (e.g. 32+ chars) in production.
- [ ] **NEXT_PUBLIC_APP_URL** – Canonical app URL (e.g. `https://tasklinkers.com`). Used for redirect after login and for cookie domain when the host is `*.netlify.app`.
- [ ] **SESSION_COOKIE_DOMAIN** (optional) – Override cookie domain (e.g. `tasklinkers.com`) so the session cookie works on both apex and www. If unset, production uses the host from `NEXT_PUBLIC_APP_URL` or `tasklinkers.com` when the request host is `*.netlify.app`.
- [ ] **Supabase** – Same project as local: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`. The `user_sessions` table must exist and be writable by the service role.

Ensure users access the site at the same host you configure (e.g. always `https://tasklinkers.com` or always `https://www.tasklinkers.com`), or set `SESSION_COOKIE_DOMAIN=tasklinkers.com` so the cookie is valid for both.

---

## Quick copy-paste

**Development**

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Callback (Paystack): `http://localhost:3000/payment/callback`

**Production**

```
NEXT_PUBLIC_APP_URL=https://tasklinkers.com
```

Callback (Paystack): `https://tasklinkers.com/payment/callback`  
Webhook (Paystack): `https://tasklinkers.com/api/webhooks/paystack`  
Webhook (YouVerify): `https://tasklinkers.com/api/webhooks/youverify`
