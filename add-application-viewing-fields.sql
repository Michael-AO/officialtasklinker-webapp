-- Add viewing tracking fields to applications table
-- Run this in your Supabase SQL Editor

-- Add the viewing tracking columns to the applications table
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS viewed_by_client BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMP WITH TIME ZONE;

-- Create an index for better performance when querying viewed applications
CREATE INDEX IF NOT EXISTS idx_applications_viewed_by_client 
ON applications(viewed_by_client, viewed_at);

-- Create an index for better performance when querying by freelancer and status
CREATE INDEX IF NOT EXISTS idx_applications_freelancer_status 
ON applications(freelancer_id, status);

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'applications' 
AND column_name IN ('viewed_by_client', 'viewed_at')
ORDER BY column_name;

-- Show sample data to confirm everything is working
SELECT 
  id,
  freelancer_id,
  task_id,
  status,
  viewed_by_client,
  viewed_at,
  created_at
FROM applications 
LIMIT 5; 