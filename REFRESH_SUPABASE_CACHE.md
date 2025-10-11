# 🔄 Refresh Supabase Schema Cache

## Problem
You're seeing this error:
```
"Could not find the 'auth_type' column of 'magic_links' in the schema cache"
```

This means Supabase's PostgREST API cache hasn't refreshed yet after creating the tables.

## Solution: Refresh the Schema Cache

### Option 1: Restart Supabase Project (Fastest - 2 minutes)

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** (gear icon at bottom left)
4. Click **General**
5. Scroll down to **"Pause project"**
6. Click **"Pause project"** button
7. Wait 30 seconds
8. Click **"Restore project"** button
9. Wait for it to restart (green indicator)
10. ✅ Cache is now refreshed!

### Option 2: Manually Reload Schema (30 seconds)

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to **API** section in left sidebar
4. Click the **"Reload schema cache"** button
5. Wait a few seconds
6. ✅ Done!

### Option 3: Wait (5-10 minutes)

Supabase automatically refreshes the cache every few minutes. You can just wait and try again.

## After Refreshing

1. Go back to: http://localhost:3003/signup
2. Try signing up again
3. Should work now! 🎉

## Verify Tables Exist

Run this in Supabase SQL Editor to confirm tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('magic_links', 'user_sessions', 'audit_logs', 'rate_limit_attempts');
```

Should return 4 rows.

## Check Schema

Run this to see the magic_links columns:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'magic_links';
```

Should show columns including `auth_type`.

