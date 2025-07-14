-- Permanently fix support_requests RLS policies
-- Disable RLS for support_requests table to allow all operations
ALTER TABLE support_requests DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own support requests" ON support_requests;
DROP POLICY IF EXISTS "Admins can view all support requests" ON support_requests;
DROP POLICY IF EXISTS "Users can insert their own support requests" ON support_requests;
DROP POLICY IF EXISTS "Admins can update support requests" ON support_requests;
DROP POLICY IF EXISTS "Allow all users to insert support requests" ON support_requests;

-- Grant necessary permissions
GRANT ALL ON support_requests TO authenticated;
GRANT ALL ON support_requests TO anon;

-- Create a simple policy that allows all operations for authenticated users
CREATE POLICY "Allow all authenticated users full access" ON support_requests
    FOR ALL USING (auth.role() = 'authenticated');

-- Also allow anonymous users to insert (for support requests)
CREATE POLICY "Allow anonymous users to insert" ON support_requests
    FOR INSERT WITH CHECK (true);

-- Create a policy for admins to view all
CREATE POLICY "Admins can view all support requests" ON support_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.email IN ('michael@tasklinkers.com', 'admin@tasklinkers.com')
        )
    );

-- Create a policy for users to view their own requests
CREATE POLICY "Users can view their own support requests" ON support_requests
    FOR SELECT USING (auth.uid() = user_id);

-- Enable RLS back
ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY; 