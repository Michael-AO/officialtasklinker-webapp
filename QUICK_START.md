# ⚡ Quick Start - Magic Link Authentication

## 🎯 3 Steps to Get Started (15 minutes)

Your old password authentication has been **completely removed** and replaced with magic link authentication.

---

## Step 1: Generate JWT_SECRET (2 minutes)

Run this command:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output (should be 64 characters long) and add it to `.env.local`:
```env
JWT_SECRET=paste-your-secret-here
```

**Example:**
```env
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

---

## Step 2: Run Database Migration (5 minutes)

1. Open Supabase: https://supabase.com/dashboard
2. Go to **SQL Editor**
3. Open file: `scripts/magic-link-auth-schema.sql`
4. Copy the entire contents
5. Paste into SQL Editor
6. Click **Run**
7. You should see: **Success. No rows returned**

**Verify 4 new tables were created:**
- ✅ magic_links
- ✅ user_sessions  
- ✅ audit_logs
- ✅ rate_limit_attempts

---

## Step 3: Restart Server & Test (8 minutes)

### Restart Development Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Test Signup
1. Open http://localhost:3000/signup
2. Enter your details
3. Click "Create account"
4. Check your email
5. Click the magic link
6. You should be logged in! 🎉

### Test Login
1. Logout
2. Go to http://localhost:3000/login
3. Enter email
4. Check email for magic link
5. Click link
6. You're in! 🚀

---

## ✅ What's Different?

### Old System (REMOVED)
- ❌ Password required
- ❌ Manual email verification
- ❌ Insecure verification tokens
- ❌ No rate limiting
- ❌ No audit logging

### New System (ACTIVE)
- ✅ No password needed
- ✅ Magic link via email
- ✅ Automatic verification
- ✅ Rate limiting (10 links/hour)
- ✅ Full audit logging
- ✅ 7-day sessions
- ✅ HttpOnly cookies (secure)

---

## 🆘 Troubleshooting

### "JWT_SECRET not found"
→ Did you add it to `.env.local`? Restart server after adding.

### "Magic link not working"
→ Did you run the database migration? Check Supabase for 4 new tables.

### "Email not received"
→ Check spam folder. Verify BREVO_API_KEY is set.

### "Session not persisting"
→ Check DevTools → Application → Cookies. Look for `tasklinkers_session`.

---

## 📚 Need More Help?

- **Complete Guide**: `MAGIC_LINK_IMPLEMENTATION_GUIDE.md` (500+ lines)
- **Migration Details**: `MIGRATION_COMPLETE.md`  
- **Implementation Summary**: `IMPLEMENTATION_SUMMARY.md`

---

## 🎉 You're Done!

That's it! Your authentication system is now:
- 🔒 More secure (no passwords)
- ⚡ Faster (magic links)
- 📊 Compliant (audit logs)
- 🛡️ Protected (rate limiting)

**Questions?** Read the troubleshooting guides above!

