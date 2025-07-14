-- Fix RLS policies for support_requests table
-- First, disable RLS temporarily to allow all operations
ALTER TABLE support_requests DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own support requests" ON support_requests;
DROP POLICY IF EXISTS "Admins can view all support requests" ON support_requests;
DROP POLICY IF EXISTS "Users can insert their own support requests" ON support_requests;
DROP POLICY IF EXISTS "Admins can update support requests" ON support_requests;

-- Create new policies that allow proper access
-- Allow all users to insert support requests
CREATE POLICY "Allow all users to insert support requests" ON support_requests
    FOR INSERT WITH CHECK (true);

-- Allow users to view their own support requests
CREATE POLICY "Users can view their own support requests" ON support_requests
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Allow admins to view all support requests
CREATE POLICY "Admins can view all support requests" ON support_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.email IN ('michael@tasklinkers.com', 'admin@tasklinkers.com')
        )
    );

-- Allow admins to update support requests
CREATE POLICY "Admins can update support requests" ON support_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.email IN ('michael@tasklinkers.com', 'admin@tasklinkers.com')
        )
    );

-- Re-enable RLS
ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON support_requests TO authenticated;
GRANT ALL ON support_requests TO anon; 