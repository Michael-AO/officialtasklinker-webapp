-- Add user_id column to support_requests table
ALTER TABLE support_requests 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);

-- Update RLS policies for support_requests
DROP POLICY IF EXISTS "Users can view their own support requests" ON support_requests;
DROP POLICY IF EXISTS "Admins can view all support requests" ON support_requests;
DROP POLICY IF EXISTS "Users can insert their own support requests" ON support_requests;
DROP POLICY IF EXISTS "Admins can update support requests" ON support_requests;

-- Create new policies
CREATE POLICY "Users can view their own support requests" ON support_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all support requests" ON support_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.email IN ('michael@tasklinkers.com', 'admin@tasklinkers.com')
        )
    );

CREATE POLICY "Users can insert their own support requests" ON support_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update support requests" ON support_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.email IN ('michael@tasklinkers.com', 'admin@tasklinkers.com')
        )
    );

-- Enable RLS
ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY; 