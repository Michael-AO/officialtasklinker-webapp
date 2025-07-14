# Avatar System Setup Guide

## Overview
Your avatar upload system is already implemented in the frontend and API. This guide will help you complete the database setup to make it fully functional.

## Prerequisites
- Access to your Supabase project dashboard
- SQL Editor access in Supabase

## Step 1: Set up Storage Bucket
Run the following SQL in your Supabase SQL Editor:

```sql
-- Setup Supabase Storage for Avatar Uploads
-- Run this in your Supabase SQL Editor

-- Create the avatars storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy to allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create storage policy to allow public read access to avatars
CREATE POLICY "Public read access to avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Create storage policy to allow users to update their own avatars
CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create storage policy to allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Verify the bucket was created
SELECT * FROM storage.buckets WHERE id = 'avatars';
```

## Step 2: Create Avatar Update Function
Run the following SQL in your Supabase SQL Editor:

```sql
-- Create function to update user avatar URL (bypasses RLS)
-- This function allows the avatar upload API to update the avatar_url field
-- without being blocked by RLS policies

CREATE OR REPLACE FUNCTION update_user_avatar(user_id UUID, avatar_url TEXT)
RETURNS VOID AS $$
BEGIN
    -- Update the user's avatar_url and updated_at timestamp
    UPDATE users 
    SET 
        avatar_url = update_user_avatar.avatar_url,
        updated_at = NOW()
    WHERE id = update_user_avatar.user_id;
    
    -- Raise an exception if no rows were updated
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User with ID % not found', user_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION update_user_avatar(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_avatar(UUID, TEXT) TO service_role;
```

## Step 3: Verify Setup
After running both scripts, verify that:

1. **Storage bucket exists**: Check the Storage section in Supabase dashboard
2. **Function exists**: Check the Database > Functions section
3. **Policies are applied**: Check the Storage > Policies section

## Step 4: Test the System
1. Go to your app's profile edit page
2. Try uploading an avatar image
3. Check the browser console for any errors
4. Verify the image appears in your profile

## Current Implementation Status

### ✅ Already Implemented:
- **Frontend Components**: Avatar upload UI in profile pages
- **API Endpoint**: `/api/upload/avatar` route with full error handling
- **File Validation**: Type and size validation
- **Storage Integration**: Supabase storage upload
- **Database Integration**: RPC function call with fallback
- **Error Handling**: Comprehensive error handling and logging

### 🔧 What This Setup Completes:
- **Storage Bucket**: Creates the `avatars` bucket with proper policies
- **Database Function**: Creates the `update_user_avatar` RPC function
- **Security**: Proper RLS bypass for avatar updates
- **Permissions**: Grants necessary permissions to authenticated users

## Troubleshooting

### Common Issues:

1. **"Function not found" error**:
   - Make sure you ran the function creation SQL
   - Check that the function exists in Database > Functions

2. **"Bucket not found" error**:
   - Make sure you ran the storage setup SQL
   - Check that the `avatars` bucket exists in Storage

3. **"Permission denied" error**:
   - Verify the storage policies are created
   - Check that the function has proper permissions

4. **"RLS policy violation" error**:
   - The function uses `SECURITY DEFINER` to bypass RLS
   - Make sure the function is properly created

### Testing the Function:
You can test the function directly in the SQL Editor:

```sql
-- Test with a real user ID (replace with actual user ID)
SELECT update_user_avatar('your-user-id-here', 'https://example.com/avatar.jpg');
```

## Next Steps
After completing this setup:

1. **Test the avatar upload** in your application
2. **Monitor the logs** for any issues
3. **Consider adding** avatar deletion functionality
4. **Optimize images** if needed (resize, compress)

## Files Involved
- `scripts/25-avatar-update-function.sql` - Database function
- `setup-storage.sql` - Storage bucket setup
- `app/api/upload/avatar/route.ts` - Upload API
- `components/profile-completion-wizard.tsx` - Profile UI
- `app/dashboard/profile/edit/page.tsx` - Edit profile page 