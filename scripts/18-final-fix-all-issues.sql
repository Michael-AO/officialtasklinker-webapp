-- Final comprehensive fix for all remaining issues
-- This script addresses support RLS, missing columns, and database relationships

-- 1. Add missing columns to users table if they don't exist
DO $$ 
BEGIN
    -- Add role column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';
        RAISE NOTICE 'Added role column to users table';
    END IF;
    
    -- Add is_verified column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_verified') THEN
        ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_verified column to users table';
    END IF;
    
    -- Add file_type column to portfolio_items if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'portfolio_items' AND column_name = 'file_type') THEN
        ALTER TABLE portfolio_items ADD COLUMN file_type TEXT;
        RAISE NOTICE 'Added file_type column to portfolio_items table';
    END IF;
END $$;

-- 2. Fix support_requests RLS policies
-- First, disable RLS temporarily
ALTER TABLE support_requests DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own support requests" ON support_requests;
DROP POLICY IF EXISTS "Admins can view all support requests" ON support_requests;
DROP POLICY IF EXISTS "Users can insert their own support requests" ON support_requests;
DROP POLICY IF EXISTS "Admins can update support requests" ON support_requests;
DROP POLICY IF EXISTS "Allow all users to insert support requests" ON support_requests;

-- Create new policies that work with the actual schema
CREATE POLICY "Allow all users to insert support requests" ON support_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own support requests" ON support_requests
    FOR SELECT USING (
        user_id::text = current_setting('request.jwt.claims', true)::json->>'sub'
        OR EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = current_setting('request.jwt.claims', true)::json->>'sub'
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can view all support requests" ON support_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = current_setting('request.jwt.claims', true)::json->>'sub'
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can update support requests" ON support_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = current_setting('request.jwt.claims', true)::json->>'sub'
            AND users.role = 'admin'
        )
    );

-- Re-enable RLS
ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;

-- 3. Fix portfolio_items RLS policies
-- Disable RLS temporarily
ALTER TABLE portfolio_items DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own portfolio items" ON portfolio_items;
DROP POLICY IF EXISTS "Users can insert their own portfolio items" ON portfolio_items;
DROP POLICY IF EXISTS "Users can update their own portfolio items" ON portfolio_items;
DROP POLICY IF EXISTS "Users can delete their own portfolio items" ON portfolio_items;

-- Create new policies
CREATE POLICY "Users can view their own portfolio items" ON portfolio_items
    FOR SELECT USING (
        user_id::text = current_setting('request.jwt.claims', true)::json->>'sub'
    );

CREATE POLICY "Users can insert their own portfolio items" ON portfolio_items
    FOR INSERT WITH CHECK (
        user_id::text = current_setting('request.jwt.claims', true)::json->>'sub'
    );

CREATE POLICY "Users can update their own portfolio items" ON portfolio_items
    FOR UPDATE USING (
        user_id::text = current_setting('request.jwt.claims', true)::json->>'sub'
    );

CREATE POLICY "Users can delete their own portfolio items" ON portfolio_items
    FOR DELETE USING (
        user_id::text = current_setting('request.jwt.claims', true)::json->>'sub'
    );

-- Re-enable RLS
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

-- 4. Fix escrow_accounts table name issue
-- Check if escrows table exists and rename it if needed
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'escrows') THEN
        -- If escrows table exists, rename it to escrow_accounts
        ALTER TABLE escrows RENAME TO escrow_accounts;
        RAISE NOTICE 'Renamed escrows table to escrow_accounts';
    END IF;
END $$;

-- 5. Add missing columns to tasks table if they don't exist
DO $$ 
BEGIN
    -- Add budget_min, budget_max, budget_type if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'budget_min') THEN
        ALTER TABLE tasks ADD COLUMN budget_min DECIMAL(10,2);
        RAISE NOTICE 'Added budget_min column to tasks table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'budget_max') THEN
        ALTER TABLE tasks ADD COLUMN budget_max DECIMAL(10,2);
        RAISE NOTICE 'Added budget_max column to tasks table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'budget_type') THEN
        ALTER TABLE tasks ADD COLUMN budget_type TEXT DEFAULT 'fixed';
        RAISE NOTICE 'Added budget_type column to tasks table';
    END IF;
END $$;

-- 6. Grant necessary permissions
GRANT ALL ON support_requests TO authenticated;
GRANT ALL ON portfolio_items TO authenticated;
GRANT ALL ON escrow_accounts TO authenticated;
GRANT ALL ON milestones TO authenticated;

-- 7. Insert test data for support requests if table is empty
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

-- 8. Update existing users to have proper roles
UPDATE users SET role = 'admin' WHERE email LIKE '%admin%' OR name LIKE '%admin%';
UPDATE users SET role = 'user' WHERE role IS NULL;

-- 9. Set some users as verified for testing
UPDATE users SET is_verified = true WHERE role = 'admin';

-- 10. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_support_requests_user_id ON support_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_support_requests_status ON support_requests(status);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_user_id ON portfolio_items(user_id);
CREATE INDEX IF NOT EXISTS idx_escrow_accounts_task_id ON escrow_accounts(task_id);

-- 11. Verify the fixes
SELECT 'Support requests count:' as info, COUNT(*) as count FROM support_requests;
SELECT 'Users with roles:' as info, COUNT(*) as count FROM users WHERE role IS NOT NULL;
SELECT 'Portfolio items count:' as info, COUNT(*) as count FROM portfolio_items;
SELECT 'Escrow accounts count:' as info, COUNT(*) as count FROM escrow_accounts;

-- 12. Show current RLS status
SELECT 
    schemaname, 
    tablename, 
    rowsecurity,
    CASE WHEN rowsecurity THEN 'RLS Enabled' ELSE 'RLS Disabled' END as rls_status
FROM pg_tables 
WHERE tablename IN ('support_requests', 'portfolio_items', 'escrow_accounts')
ORDER BY tablename; 