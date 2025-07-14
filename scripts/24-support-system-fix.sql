-- Support System Fix - Allow Anonymous Support Requests
-- This script ensures support requests work for anyone without authentication

-- 1. Drop existing support_requests table if it exists
DROP TABLE IF EXISTS support_requests CASCADE;

-- 2. Create support_requests table with proper structure
CREATE TABLE support_requests (
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

-- 3. Create indexes for better performance
CREATE INDEX idx_support_requests_status ON support_requests(status);
CREATE INDEX idx_support_requests_created_at ON support_requests(created_at);
CREATE INDEX idx_support_requests_user_id ON support_requests(user_id);

-- 4. Disable RLS temporarily to insert test data
ALTER TABLE support_requests DISABLE ROW LEVEL SECURITY;

-- 5. Insert some test support requests
INSERT INTO support_requests (name, email, subject, message, status) VALUES
('John Doe', 'john@example.com', 'General Inquiry', 'I have a question about the platform.', 'pending'),
('Jane Smith', 'jane@example.com', 'Technical Issue', 'I cannot upload my portfolio files.', 'in_progress'),
('Bob Wilson', 'bob@example.com', 'Payment Question', 'How do I set up escrow payments?', 'pending'),
('Alice Brown', 'alice@example.com', 'Account Issue', 'My account was suspended unexpectedly.', 'resolved');

-- 6. Enable RLS with permissive policies
ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies that allow all operations
-- Policy for inserting (anyone can create support requests)
CREATE POLICY "Allow insert for all users" ON support_requests
    FOR INSERT WITH CHECK (true);

-- Policy for selecting (anyone can view support requests)
CREATE POLICY "Allow select for all users" ON support_requests
    FOR SELECT USING (true);

-- Policy for updating (anyone can update support requests)
CREATE POLICY "Allow update for all users" ON support_requests
    FOR UPDATE USING (true);

-- Policy for deleting (anyone can delete support requests)
CREATE POLICY "Allow delete for all users" ON support_requests
    FOR DELETE USING (true);

-- 8. Grant necessary permissions
GRANT ALL ON support_requests TO authenticated;
GRANT ALL ON support_requests TO anon;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 9. Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_support_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_support_requests_updated_at_trigger ON support_requests;
CREATE TRIGGER update_support_requests_updated_at_trigger
    BEFORE UPDATE ON support_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_support_requests_updated_at();

-- 11. Verify the setup
SELECT 
    'Support requests table created successfully' as status,
    COUNT(*) as total_requests
FROM support_requests; 