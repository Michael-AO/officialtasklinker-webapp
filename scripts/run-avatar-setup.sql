-- Complete Avatar System Setup
-- Run this entire script in your Supabase SQL Editor

-- ========================================
-- STEP 1: Set up Storage Bucket
-- ========================================

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
CREATE POLICY IF NOT EXISTS "Users can upload their own avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create storage policy to allow public read access to avatars
CREATE POLICY IF NOT EXISTS "Public read access to avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Create storage policy to allow users to update their own avatars
CREATE POLICY IF NOT EXISTS "Users can update their own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create storage policy to allow users to delete their own avatars
CREATE POLICY IF NOT EXISTS "Users can delete their own avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ========================================
-- STEP 2: Create Avatar Update Function
-- ========================================

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

-- ========================================
-- STEP 3: Verification Queries
-- ========================================

-- Verify the bucket was created
SELECT 'Storage Bucket Status:' as status;
SELECT * FROM storage.buckets WHERE id = 'avatars';

-- Verify the function was created
SELECT 'Function Status:' as status;
SELECT 
    routine_name,
    routine_type,
    security_type,
    created
FROM information_schema.routines 
WHERE routine_name = 'update_user_avatar';

-- Verify storage policies
SELECT 'Storage Policies:' as status;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%avatar%';

-- ========================================
-- STEP 4: Test the Function (Optional)
-- ========================================

-- Uncomment and modify the line below to test the function
-- Replace 'your-user-id-here' with an actual user ID from your database
-- SELECT update_user_avatar('your-user-id-here', 'https://example.com/avatar.jpg');

SELECT 'Avatar system setup completed successfully!' as result; 