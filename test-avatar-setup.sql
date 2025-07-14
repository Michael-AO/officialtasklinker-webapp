-- Test Avatar System Setup
-- Run this after the main setup to verify everything works

-- Test 1: Check if storage bucket exists
SELECT 'Test 1: Storage Bucket' as test_name;
SELECT 
    id, 
    name, 
    public, 
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'avatars';

-- Test 2: Check if all functions exist
SELECT 'Test 2: Functions' as test_name;
SELECT 
    routine_name,
    routine_type,
    security_type
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

-- Test 3: Check storage policies
SELECT 'Test 3: Storage Policies' as test_name;
SELECT 
    policyname,
    permissive,
    cmd,
    roles
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%avatar%'
ORDER BY policyname;

-- Test 4: Check if users table has avatar_url column
SELECT 'Test 4: Users Table Structure' as test_name;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'avatar_url';

-- Test 5: Check function permissions
SELECT 'Test 5: Function Permissions' as test_name;
SELECT 
    routine_name,
    grantee,
    privilege_type
FROM information_schema.routine_privileges 
WHERE routine_name IN (
    'update_user_avatar',
    'update_user_avatar_with_cleanup',
    'cleanup_old_avatar',
    'cleanup_orphaned_avatars',
    'get_user_avatar_info',
    'delete_user_avatar'
)
ORDER BY routine_name, grantee;

-- Summary
SELECT 'Setup Verification Complete!' as status; 