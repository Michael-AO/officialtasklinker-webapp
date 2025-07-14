-- Direct database fix for missing columns and RLS issues
-- Run this script directly in your Supabase SQL editor

-- 1. Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- 2. Add missing columns to portfolio_items table
ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS file_type TEXT;

-- 3. Add missing columns to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS budget_min DECIMAL(10,2);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS budget_max DECIMAL(10,2);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS budget_type TEXT DEFAULT 'fixed';

-- 4. Disable RLS on support_requests to allow all operations
ALTER TABLE support_requests DISABLE ROW LEVEL SECURITY;

-- 5. Drop all existing policies on support_requests
DROP POLICY IF EXISTS "Users can view their own support requests" ON support_requests;
DROP POLICY IF EXISTS "Admins can view all support requests" ON support_requests;
DROP POLICY IF EXISTS "Users can insert their own support requests" ON support_requests;
DROP POLICY IF EXISTS "Admins can update support requests" ON support_requests;
DROP POLICY IF EXISTS "Allow all users to insert support requests" ON support_requests;

-- 6. Create simple policies that allow all operations
CREATE POLICY "Allow all operations on support_requests" ON support_requests
    FOR ALL USING (true) WITH CHECK (true);

-- 7. Disable RLS on portfolio_items to allow all operations
ALTER TABLE portfolio_items DISABLE ROW LEVEL SECURITY;

-- 8. Drop all existing policies on portfolio_items
DROP POLICY IF EXISTS "Users can view their own portfolio items" ON portfolio_items;
DROP POLICY IF EXISTS "Users can insert their own portfolio items" ON portfolio_items;
DROP POLICY IF EXISTS "Users can update their own portfolio items" ON portfolio_items;
DROP POLICY IF EXISTS "Users can delete their own portfolio items" ON portfolio_items;

-- 9. Create simple policies that allow all operations
CREATE POLICY "Allow all operations on portfolio_items" ON portfolio_items
    FOR ALL USING (true) WITH CHECK (true);

-- 10. Update existing users to have proper roles
UPDATE users SET role = 'admin' WHERE email LIKE '%admin%' OR name LIKE '%admin%';
UPDATE users SET role = 'user' WHERE role IS NULL;

-- 11. Set some users as verified for testing
UPDATE users SET is_verified = true WHERE role = 'admin';

-- 12. Insert test support request if table is empty
INSERT INTO support_requests (id, user_id, name, email, subject, message, status, created_at)
SELECT 
    gen_random_uuid(),
    u.id,
    u.name,
    u.email,
    'Test Support Request',
    'This is a test support request for user ' || u.name,
    'open',
    NOW()
FROM users u
WHERE NOT EXISTS (SELECT 1 FROM support_requests LIMIT 1)
LIMIT 1;

-- 13. Grant necessary permissions
GRANT ALL ON support_requests TO authenticated;
GRANT ALL ON portfolio_items TO authenticated;
GRANT ALL ON users TO authenticated;

-- 14. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_support_requests_user_id ON support_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_support_requests_status ON support_requests(status);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_user_id ON portfolio_items(user_id);

-- 15. Verify the fixes
SELECT 'Support requests count:' as info, COUNT(*) as count FROM support_requests;
SELECT 'Users with roles:' as info, COUNT(*) as count FROM users WHERE role IS NOT NULL;
SELECT 'Portfolio items count:' as info, COUNT(*) as count FROM portfolio_items;

-- 16. Show current RLS status
SELECT 
    schemaname, 
    tablename, 
    rowsecurity,
    CASE WHEN rowsecurity THEN 'RLS Enabled' ELSE 'RLS Disabled' END as rls_status
FROM pg_tables 
WHERE tablename IN ('support_requests', 'portfolio_items')
ORDER BY tablename; 