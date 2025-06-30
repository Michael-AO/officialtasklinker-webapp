-- Migration script to add attachments column to applications table
-- Run this in your Supabase SQL editor

-- Check if attachments column exists, if not add it
DO $$
BEGIN
    -- Check if the column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'applications' 
        AND column_name = 'attachments'
    ) THEN
        -- Add the attachments column
        ALTER TABLE applications 
        ADD COLUMN attachments TEXT[] DEFAULT '{}';
        
        RAISE NOTICE 'Added attachments column to applications table';
    ELSE
        RAISE NOTICE 'Attachments column already exists in applications table';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'applications' 
AND column_name = 'attachments';

-- Migration script to add missing email_otps table
-- Run this in your Supabase SQL Editor

-- Create email_otps table for email verification
CREATE TABLE IF NOT EXISTS email_otps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  type VARCHAR(20) DEFAULT 'signup',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for email_otps table
CREATE INDEX IF NOT EXISTS idx_email_otps_email ON email_otps(email);
CREATE INDEX IF NOT EXISTS idx_email_otps_otp ON email_otps(otp);
CREATE INDEX IF NOT EXISTS idx_email_otps_expires_at ON email_otps(expires_at);
CREATE INDEX IF NOT EXISTS idx_email_otps_used ON email_otps(used);

-- Enable RLS on email_otps table
ALTER TABLE email_otps ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for email_otps
CREATE POLICY "Users can view their own OTPs" ON email_otps
  FOR SELECT USING (email = (SELECT email FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert OTPs for their email" ON email_otps
  FOR INSERT WITH CHECK (email = (SELECT email FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update their own OTPs" ON email_otps
  FOR UPDATE USING (email = (SELECT email FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can delete their own OTPs" ON email_otps
  FOR DELETE USING (email = (SELECT email FROM users WHERE id = auth.uid())); 