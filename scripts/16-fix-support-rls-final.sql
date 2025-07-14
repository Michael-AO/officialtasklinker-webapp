-- Fix support_requests table RLS policies
-- This script will properly set up the support_requests table for all users

-- First, ensure the table exists with correct structure
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

-- Disable RLS temporarily to allow all operations
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

-- Create new policies that allow proper access
-- Allow all authenticated users to insert support requests
CREATE POLICY "Allow authenticated users to insert support requests" ON support_requests
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to view their own support requests
CREATE POLICY "Users can view their own support requests" ON support_requests
    FOR SELECT USING (auth.uid() = user_id);

-- Allow admins to view all support requests (check for admin emails)
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

-- Enable RLS
ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;

-- Insert some test data if table is empty
INSERT INTO support_requests (user_id, name, email, subject, message, status)
SELECT 
    u.id,
    u.name,
    u.email,
    'Test Support Request',
    'This is a test support request from ' || u.name,
    'pending'
FROM users u
WHERE NOT EXISTS (SELECT 1 FROM support_requests LIMIT 1)
LIMIT 3;

-- Show the current state
SELECT 
    'support_requests table created/updated' as status,
    COUNT(*) as total_requests
FROM support_requests; 