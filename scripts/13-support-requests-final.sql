-- Create support_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS support_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add user_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_requests' AND column_name = 'user_id') THEN
        ALTER TABLE support_requests ADD COLUMN user_id UUID REFERENCES users(id);
    END IF;
END $$;

-- Enable RLS
ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own support requests" ON support_requests;
DROP POLICY IF EXISTS "Admins can view all support requests" ON support_requests;
DROP POLICY IF EXISTS "Users can insert their own support requests" ON support_requests;
DROP POLICY IF EXISTS "Admins can update support requests" ON support_requests;

-- Create new policies
CREATE POLICY "Users can view their own support requests" ON support_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all support requests" ON support_requests
    FOR SELECT USING (true); -- Allow all authenticated users to view all requests for admin panel

CREATE POLICY "Users can insert their own support requests" ON support_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update support requests" ON support_requests
    FOR UPDATE USING (true); -- Allow all authenticated users to update requests for admin panel

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_support_requests_user_id ON support_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_support_requests_status ON support_requests(status);
CREATE INDEX IF NOT EXISTS idx_support_requests_created_at ON support_requests(created_at);

-- Insert a test support request if table is empty
INSERT INTO support_requests (user_id, name, email, subject, message, status)
SELECT 
    (SELECT id FROM users LIMIT 1),
    'Test User',
    'test@example.com',
    'Test Support Request',
    'This is a test support request to verify the system is working.',
    'pending'
WHERE NOT EXISTS (SELECT 1 FROM support_requests);

-- Show the table structure
\d support_requests; 