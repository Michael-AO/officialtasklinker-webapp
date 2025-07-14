-- Test script to check support_requests table
-- Check if table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'support_requests'
) as table_exists;

-- Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'support_requests'
ORDER BY ordinal_position;

-- Check if there are any support requests
SELECT COUNT(*) as total_requests FROM support_requests;

-- Show sample data
SELECT id, name, email, subject, status, created_at
FROM support_requests
ORDER BY created_at DESC
LIMIT 5; 