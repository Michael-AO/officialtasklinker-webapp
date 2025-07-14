-- Create function to cleanup old avatar files
-- This function deletes old avatar files from storage when a new avatar is uploaded

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

-- Grant execute permission on the function
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
-- This can be run periodically to clean up files that are no longer referenced
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

-- Test the functions (optional - remove in production)
-- SELECT update_user_avatar_with_cleanup('your-user-id-here', 'https://example.com/avatar.jpg');
-- SELECT cleanup_orphaned_avatars(); 