-- Test Supabase Connection and Storage Access
-- Run this to verify your setup

-- Test 1: Check if storage extension is enabled
SELECT 'Test 1: Storage Extension' as test_name;
SELECT 
    extname,
    extversion
FROM pg_extension 
WHERE extname = 'storage';

-- Test 2: Check if avatars bucket exists
SELECT 'Test 2: Storage Bucket' as test_name;
SELECT 
    id, 
    name, 
    public, 
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'avatars';

-- Test 3: Check storage policies
SELECT 'Test 3: Storage Policies' as test_name;
SELECT 
    policyname,
    permissive,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%avatar%'
ORDER BY policyname;

-- Test 4: Check if we can access storage objects table
SELECT 'Test 4: Storage Objects Access' as test_name;
SELECT 
    COUNT(*) as total_objects
FROM storage.objects 
WHERE bucket_id = 'avatars';

-- Test 5: Check users table structure
SELECT 'Test 5: Users Table' as test_name;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'avatar_url';

-- Test 6: Check avatar functions
SELECT 'Test 6: Avatar Functions' as test_name;
SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_name LIKE '%avatar%'
ORDER BY routine_name;

SELECT 'Connection test completed!' as status; 