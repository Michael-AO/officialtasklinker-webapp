-- Add progress tracking fields to applications table
-- Run this in your Supabase SQL Editor

-- Add progress tracking columns to the applications table
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS progress_first_contact BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS progress_project_kickoff BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS progress_midpoint BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS progress_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS progress_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create indexes for better performance when querying progress
CREATE INDEX IF NOT EXISTS idx_applications_progress_status 
ON applications(progress_first_contact, progress_project_kickoff, progress_midpoint, progress_completed);

CREATE INDEX IF NOT EXISTS idx_applications_progress_updated 
ON applications(progress_updated_at);

-- Create a function to update progress_updated_at timestamp
CREATE OR REPLACE FUNCTION update_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.progress_updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update progress_updated_at
DROP TRIGGER IF EXISTS trigger_update_progress_timestamp ON applications;
CREATE TRIGGER trigger_update_progress_timestamp
    BEFORE UPDATE ON applications
    FOR EACH ROW
    WHEN (OLD.progress_first_contact IS DISTINCT FROM NEW.progress_first_contact OR
          OLD.progress_project_kickoff IS DISTINCT FROM NEW.progress_project_kickoff OR
          OLD.progress_midpoint IS DISTINCT FROM NEW.progress_midpoint OR
          OLD.progress_completed IS DISTINCT FROM NEW.progress_completed)
    EXECUTE FUNCTION update_progress_timestamp();

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'applications' 
AND column_name LIKE 'progress_%'
ORDER BY column_name;

-- Show sample data to confirm everything is working
SELECT 
  id,
  freelancer_id,
  task_id,
  status,
  progress_first_contact,
  progress_project_kickoff,
  progress_midpoint,
  progress_completed,
  progress_updated_at,
  created_at
FROM applications 
LIMIT 5; 