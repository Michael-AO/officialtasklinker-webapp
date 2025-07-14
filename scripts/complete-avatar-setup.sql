-- Complete Avatar System Setup
-- Run this entire script in your Supabase SQL Editor to set up the full avatar system

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
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create storage policy to allow public read access to avatars
DROP POLICY IF EXISTS "Public read access to avatars" ON storage.objects;
CREATE POLICY "Public read access to avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Create storage policy to allow users to update their own avatars
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create storage policy to allow users to delete their own avatars
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
CREATE POLICY "Users can delete their own avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ========================================
-- STEP 2: Create Basic Avatar Update Function
-- ========================================

-- Create function to update user avatar URL (bypasses RLS)
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
-- STEP 3: Create Avatar Cleanup Functions
-- ========================================

-- Create function to cleanup old avatar files
CREATE OR REPLACE FUNCTION cleanup_old_avatar(user_id UUID, new_avatar_url TEXT)
RETURNS VOID AS $$
DECLARE
    old_avatar_url TEXT;
    old_file_path TEXT;
BEGIN
    -- Get the old avatar URL for this user
    SELECT avatar_url INTO old_avatar_url
    FROM users 
    WHERE id = user_id;
    
    -- If there's an old avatar and it's different from the new one
    IF old_avatar_url IS NOT NULL AND old_avatar_url != new_avatar_url THEN
        -- Extract file path from the old avatar URL
        -- Assuming URL format: https://xxx.supabase.co/storage/v1/object/public/avatars/user-id/filename
        old_file_path := substring(old_avatar_url from 'avatars/(.*)$');
        
        -- Delete the old file from storage
        -- Note: This requires the storage extension to be enabled
        PERFORM storage.delete_object('avatars', old_file_path);
        
        RAISE NOTICE 'Deleted old avatar file: %', old_file_path;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the cleanup function
GRANT EXECUTE ON FUNCTION cleanup_old_avatar(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_avatar(UUID, TEXT) TO service_role;

-- Enhanced avatar update function that includes cleanup
CREATE OR REPLACE FUNCTION update_user_avatar_with_cleanup(user_id UUID, avatar_url TEXT)
RETURNS VOID AS $$
BEGIN
    -- Clean up old avatar first
    PERFORM cleanup_old_avatar(user_id, avatar_url);
    
    -- Update the user's avatar_url and updated_at timestamp
    UPDATE users 
    SET 
        avatar_url = update_user_avatar_with_cleanup.avatar_url,
        updated_at = NOW()
    WHERE id = update_user_avatar_with_cleanup.user_id;
    
    -- Raise an exception if no rows were updated
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User with ID % not found', user_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the enhanced function
GRANT EXECUTE ON FUNCTION update_user_avatar_with_cleanup(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_avatar_with_cleanup(UUID, TEXT) TO service_role;

-- Function to manually cleanup orphaned avatar files
CREATE OR REPLACE FUNCTION cleanup_orphaned_avatars()
RETURNS INTEGER AS $$
DECLARE
    orphaned_count INTEGER := 0;
    file_record RECORD;
    user_exists BOOLEAN;
BEGIN
    -- Loop through all files in the avatars bucket
    FOR file_record IN 
        SELECT name, id 
        FROM storage.objects 
        WHERE bucket_id = 'avatars'
    LOOP
        -- Check if this file is still referenced by any user
        SELECT EXISTS(
            SELECT 1 FROM users 
            WHERE avatar_url LIKE '%' || file_record.name
        ) INTO user_exists;
        
        -- If no user references this file, delete it
        IF NOT user_exists THEN
            PERFORM storage.delete_object('avatars', file_record.name);
            orphaned_count := orphaned_count + 1;
            RAISE NOTICE 'Deleted orphaned avatar file: %', file_record.name;
        END IF;
    END LOOP;
    
    RETURN orphaned_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the cleanup function
GRANT EXECUTE ON FUNCTION cleanup_orphaned_avatars() TO service_role;

-- ========================================
-- STEP 4: Create Avatar Management Functions
-- ========================================

-- Function to get user's current avatar info
CREATE OR REPLACE FUNCTION get_user_avatar_info(user_id UUID)
RETURNS TABLE(
    avatar_url TEXT,
    file_name TEXT,
    file_size BIGINT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.avatar_url,
        substring(u.avatar_url from 'avatars/(.*)$') as file_name,
        o.metadata->>'size'::BIGINT as file_size,
        o.created_at
    FROM users u
    LEFT JOIN storage.objects o ON o.name = substring(u.avatar_url from 'avatars/(.*)$')
    WHERE u.id = user_id AND o.bucket_id = 'avatars';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_avatar_info(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_avatar_info(UUID) TO service_role;

-- Function to delete user's avatar completely
CREATE OR REPLACE FUNCTION delete_user_avatar(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_avatar_url TEXT;
    file_path TEXT;
BEGIN
    -- Get current avatar URL
    SELECT avatar_url INTO current_avatar_url
    FROM users 
    WHERE id = user_id;
    
    -- If user has an avatar, delete it
    IF current_avatar_url IS NOT NULL THEN
        -- Extract file path
        file_path := substring(current_avatar_url from 'avatars/(.*)$');
        
        -- Delete from storage
        PERFORM storage.delete_object('avatars', file_path);
        
        -- Update user record to remove avatar
        UPDATE users 
        SET 
            avatar_url = NULL,
            updated_at = NOW()
        WHERE id = user_id;
        
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION delete_user_avatar(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_user_avatar(UUID) TO service_role;

-- ========================================
-- STEP 5: Verification Queries
-- ========================================

-- Verify the bucket was created
SELECT 'Storage Bucket Status:' as status;
SELECT * FROM storage.buckets WHERE id = 'avatars';

-- Verify all functions were created
SELECT 'Function Status:' as status;
SELECT 
    routine_name,
    routine_type,
    security_type,
    created
FROM information_schema.routines 
WHERE routine_name IN (
    'update_user_avatar',
    'update_user_avatar_with_cleanup',
    'cleanup_old_avatar',
    'cleanup_orphaned_avatars',
    'get_user_avatar_info',
    'delete_user_avatar'
)
ORDER BY routine_name;

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
-- STEP 6: Test Functions (Optional)
-- ========================================

-- Uncomment and modify the lines below to test the functions
-- Replace 'your-user-id-here' with an actual user ID from your database

-- Test basic avatar update
-- SELECT update_user_avatar('your-user-id-here', 'https://example.com/avatar.jpg');

-- Test avatar update with cleanup
-- SELECT update_user_avatar_with_cleanup('your-user-id-here', 'https://example.com/new-avatar.jpg');

-- Test getting avatar info
-- SELECT * FROM get_user_avatar_info('your-user-id-here');

-- Test orphaned cleanup (run periodically)
-- SELECT cleanup_orphaned_avatars();

-- Test avatar deletion
-- SELECT delete_user_avatar('your-user-id-here');

SELECT 'Complete avatar system setup finished successfully!' as result; 