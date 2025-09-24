# Supabase Production Deployment - Manual Verification System

## 🚀 Deployment Steps

### Step 1: Database Migration
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `deploy-manual-verification.sql`
4. Click **Run** to execute the migration

### Step 2: Storage Bucket Setup
1. Go to **Storage** in your Supabase dashboard
2. The migration should have created the `verification-documents` bucket
3. If not, manually create it with these settings:
   - **Name**: `verification-documents`
   - **Public**: `false` (private)
   - **File size limit**: `5MB`
   - **Allowed MIME types**: `image/jpeg, image/jpg, image/png, image/webp`

### Step 3: Verify Deployment
Run this query in SQL Editor to verify everything is working:

```sql
-- Check if tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('manual_verification_submissions', 'verification_audit_log');

-- Check if columns were added to users table
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('manual_verification_status', 'manual_verification_id');

-- Check storage bucket
SELECT name FROM storage.buckets WHERE name = 'verification-documents';

-- Test the admin view
SELECT COUNT(*) FROM admin_verification_queue;
```

### Step 4: Test Emergency Bypass
1. Go to `/admin/users` in your app
2. Find a test user
3. Click the "🚨 Bypass Dojah (Emergency)" button
4. Verify the user gets `dojah_verified = true`

### Step 5: Test Manual Verification Flow
1. Go to a page with verification gate (like `/dashboard/browse`)
2. Click "Manual Upload" button
3. Test the document upload flow
4. Verify documents appear in admin queue at `/admin/verification`

## ✅ Deployment Checklist

- [ ] Database migration executed successfully
- [ ] Storage bucket created and configured
- [ ] RLS policies applied
- [ ] Admin dashboard accessible at `/admin/verification`
- [ ] Emergency bypass working in `/admin/users`
- [ ] Manual upload flow functional
- [ ] Document storage working
- [ ] Admin approval/rejection working

## 🚨 Emergency Commands

If you need to manually verify users immediately:

```sql
-- Emergency: Verify all users with email verification
UPDATE users 
SET dojah_verified = true, 
    verification_type = 'emergency_admin_override',
    updated_at = NOW()
WHERE is_verified = true AND dojah_verified = false;

-- Emergency: Verify specific user by email
UPDATE users 
SET dojah_verified = true, 
    verification_type = 'emergency_admin_override',
    updated_at = NOW()
WHERE email = 'user@example.com';
```

## 📊 Post-Deployment Monitoring

Check these metrics daily:
- Manual verification submissions
- Admin response times
- Emergency bypass usage
- System performance

## 🔧 Troubleshooting

### If migration fails:
1. Check Supabase logs for errors
2. Run sections of the migration individually
3. Check for existing policies/tables that might conflict

### If storage doesn't work:
1. Verify bucket permissions
2. Check RLS policies on storage.objects
3. Test file upload in admin dashboard

### If admin dashboard doesn't load:
1. Check browser console for errors
2. Verify admin user permissions
3. Check API route responses
