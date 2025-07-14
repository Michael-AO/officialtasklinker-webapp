-- Fix Storage Policies for Avatar Upload
-- Run this script to fix the RLS policy issues

-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Service role can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Service role can update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Service role can delete avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to avatars" ON storage.objects;

-- Create new policies that work with service role
CREATE POLICY "Service role can upload avatars" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Public read access to avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Service role can update avatars" ON storage.objects
FOR UPDATE USING (bucket_id = 'avatars');

CREATE POLICY "Service role can delete avatars" ON storage.objects
FOR DELETE USING (bucket_id = 'avatars');

-- Verify the policies were created
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

SELECT 'Storage policies updated successfully!' as status; 