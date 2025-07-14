-- Fix RLS policies for support_requests table
-- Run this in your Supabase SQL Editor

-- Drop the table if it exists to recreate it properly
DROP TABLE IF EXISTS support_requests CASCADE;

-- Create the support_requests table with proper sequence
CREATE TABLE support_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
  email_sent BOOLEAN DEFAULT FALSE,
  email_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_support_requests_status ON support_requests(status);
CREATE INDEX IF NOT EXISTS idx_support_requests_created_at ON support_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_support_requests_email ON support_requests(email);

-- Disable RLS for support_requests table to allow public submissions
ALTER TABLE support_requests DISABLE ROW LEVEL SECURITY;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_support_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_support_requests_updated_at ON support_requests;
CREATE TRIGGER trigger_update_support_requests_updated_at
  BEFORE UPDATE ON support_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_support_requests_updated_at();

-- Insert some sample data for testing
INSERT INTO support_requests (name, email, phone, subject, message, status) VALUES
('John Doe', 'john@example.com', '+1234567890', 'General Inquiry', 'I have a question about your services.', 'pending'),
('Jane Smith', 'jane@example.com', '+0987654321', 'Technical Issue', 'I am experiencing problems with the platform.', 'in_progress'),
('Bob Wilson', 'bob@example.com', '+1122334455', 'Feature Request', 'I would like to suggest a new feature.', 'resolved');

-- Verify the table was created successfully
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'support_requests' 
ORDER BY ordinal_position;

-- Show sample data
SELECT * FROM support_requests ORDER BY created_at DESC LIMIT 5; 