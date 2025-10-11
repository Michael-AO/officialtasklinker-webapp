-- Run this query AFTER running the migration to verify tables were created
-- This should return 4 rows (one for each table)

SELECT 
    table_name,
    'Created ✅' as status
FROM 
    information_schema.tables 
WHERE 
    table_schema = 'public' 
    AND table_name IN ('magic_links', 'user_sessions', 'audit_logs', 'rate_limit_attempts')
ORDER BY 
    table_name;

-- Expected output:
-- audit_logs          | Created ✅
-- magic_links         | Created ✅
-- rate_limit_attempts | Created ✅
-- user_sessions       | Created ✅

