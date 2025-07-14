# Complete System Setup Instructions

## 🚀 Quick Setup Guide

### Step 1: Run the Complete Setup Script

1. **Open your Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to the SQL Editor

2. **Run the Complete Setup Script**
   - Copy the entire contents of `scripts/complete-setup.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the script

3. **Verify the Setup**
   - The script will show verification results at the end
   - You should see success messages for:
     - Portfolio table creation
     - Storage bucket setup
     - Function creation
     - Policy setup

### Step 2: Test the System

1. **Test Avatar Upload**
   - Go to your app's profile edit page
   - Try uploading an avatar image
   - Check that the image appears and persists

2. **Test Profile Completion**
   - Fill out your bio, skills, and location
   - Save the profile
   - Verify the data persists and completion percentage updates

3. **Test Portfolio**
   - Try adding portfolio items
   - Verify they save correctly

## 🔧 What the Setup Includes

### Database Tables
- ✅ `portfolio_items` table with all required columns
- ✅ Proper indexes for performance
- ✅ RLS disabled for API access

### Storage System
- ✅ `avatars` storage bucket
- ✅ Proper storage policies for security
- ✅ File size limits (5MB for avatars)

### Database Functions
- ✅ `update_user_avatar` - Basic avatar update
- ✅ `update_user_avatar_with_cleanup` - Enhanced with cleanup
- ✅ `cleanup_old_avatar` - Removes old avatar files
- ✅ `cleanup_orphaned_avatars` - Cleans up orphaned files
- ✅ `get_user_avatar_info` - Gets avatar information
- ✅ `delete_user_avatar` - Completely removes avatar

### API Endpoints
- ✅ `/api/upload/avatar` - Avatar upload with cleanup
- ✅ `/api/user/portfolio` - Portfolio management
- ✅ `/api/user/profile/update` - Profile updates

## 🐛 Troubleshooting

### Common Issues

1. **"User authentication required" error**
   - ✅ **Fixed**: Updated portfolio API call to use correct header

2. **"new row violates row-level security policy" error**
   - ✅ **Fixed**: Updated storage policies to work with service role
   - Run `scripts/fix-storage-policies.sql` to fix this issue

3. **"Function not found" error**
   - Make sure you ran the complete setup script
   - Check that all functions were created successfully

4. **"Table not found" error**
   - The setup script creates the portfolio table
   - Run the complete setup script again if needed

5. **"Storage bucket not found" error**
   - The setup script creates the avatars bucket
   - Check the storage section in Supabase dashboard

### Verification Commands

Run these in your Supabase SQL Editor to verify the setup:

```sql
-- Check if portfolio table exists
SELECT * FROM information_schema.tables WHERE table_name = 'portfolio_items';

-- Check if storage bucket exists
SELECT * FROM storage.buckets WHERE id = 'avatars';

-- Check if functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_name LIKE '%avatar%' OR routine_name LIKE '%portfolio%';

-- Check storage policies
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
```

### Quick Fix for RLS Issues

If you're getting "row-level security policy" errors, run this quick fix:

```sql
-- Copy and paste the contents of scripts/fix-storage-policies.sql
```

## 📁 Files Updated

- ✅ `scripts/complete-setup.sql` - Complete system setup
- ✅ `components/profile-completion-wizard.tsx` - Fixed profile wizard
- ✅ `app/api/upload/avatar/route.ts` - Enhanced avatar upload
- ✅ `contexts/auth-context.tsx` - Portfolio refresh functionality

## 🎉 Next Steps

After running the setup:

1. **Test the avatar upload** in your application
2. **Test the profile completion wizard**
3. **Test portfolio item creation**
4. **Monitor the logs** for any issues
5. **Consider setting up** periodic cleanup of orphaned files

The system should now work correctly with proper authentication and data persistence! 