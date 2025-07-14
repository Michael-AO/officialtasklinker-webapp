-- Comprehensive Support System Fix
-- This script ensures support requests are properly stored and accessible

-- 1. Create support_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS support_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add user_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_requests' AND column_name = 'user_id') THEN
        ALTER TABLE support_requests ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_support_requests_user_id ON support_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_support_requests_status ON support_requests(status);
CREATE INDEX IF NOT EXISTS idx_support_requests_created_at ON support_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_support_requests_email ON support_requests(email);

-- 4. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_support_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_support_requests_updated_at ON support_requests;
CREATE TRIGGER trigger_update_support_requests_updated_at
    BEFORE UPDATE ON support_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_support_requests_updated_at();

-- 6. Disable RLS temporarily to allow all operations
ALTER TABLE support_requests DISABLE ROW LEVEL SECURITY;

-- 7. Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own support requests" ON support_requests;
DROP POLICY IF EXISTS "Admins can view all support requests" ON support_requests;
DROP POLICY IF EXISTS "Users can insert their own support requests" ON support_requests;
DROP POLICY IF EXISTS "Admins can update support requests" ON support_requests;
DROP POLICY IF EXISTS "Allow all users to insert support requests" ON support_requests;
DROP POLICY IF EXISTS "Allow all operations on support_requests" ON support_requests;

-- 8. Grant permissions
GRANT ALL ON support_requests TO authenticated;
GRANT ALL ON support_requests TO anon;
GRANT USAGE ON SEQUENCE support_requests_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE support_requests_id_seq TO anon;

-- 9. Create comprehensive policies
CREATE POLICY "Allow all users to insert support requests" ON support_requests
    FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

CREATE POLICY "Users can view their own support requests" ON support_requests
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Admins can view all support requests" ON support_requests
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.email IN (
                'admin@tasklinkers.com',
                'michael@tasklinkers.com',
                'michaelasereo@gmail.com',
                'ceo@tasklinkers.com'
            )
        )
    );

CREATE POLICY "Admins can update support requests" ON support_requests
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.email IN (
                'admin@tasklinkers.com',
                'michael@tasklinkers.com',
                'michaelasereo@gmail.com',
                'ceo@tasklinkers.com'
            )
        )
    )
    WITH CHECK (true);

-- 10. Enable RLS
ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;

-- 11. Insert sample data if table is empty
INSERT INTO support_requests (user_id, name, email, subject, message, status, created_at)
SELECT 
    (SELECT id FROM users LIMIT 1),
    'Test User',
    'test@example.com',
    'Test Support Request',
    'This is a test support request to verify the system is working properly.',
    'pending',
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM support_requests LIMIT 1);

-- 12. Verify the setup
SELECT 
    'support_requests table created/updated' as status,
    COUNT(*) as total_requests,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests
FROM support_requests;

-- 13. Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'support_requests'
ORDER BY ordinal_position;

-- 14. Show policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'support_requests'; 