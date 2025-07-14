-- Add profile_completion field to users table
-- Run this in your Supabase SQL Editor

-- Add the profile_completion column to the users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_completion INTEGER DEFAULT 0;

-- Update existing users with their current profile completion
UPDATE users 
SET profile_completion = CASE 
  WHEN bio IS NOT NULL AND bio != '' AND 
       skills IS NOT NULL AND array_length(skills, 1) > 0 AND 
       location IS NOT NULL AND location != '' 
  THEN 100
  WHEN bio IS NOT NULL AND bio != '' AND 
       skills IS NOT NULL AND array_length(skills, 1) > 0 
  THEN 67
  WHEN bio IS NOT NULL AND bio != '' AND 
       location IS NOT NULL AND location != '' 
  THEN 67
  WHEN skills IS NOT NULL AND array_length(skills, 1) > 0 AND 
       location IS NOT NULL AND location != '' 
  THEN 67
  WHEN bio IS NOT NULL AND bio != '' 
  THEN 33
  WHEN skills IS NOT NULL AND array_length(skills, 1) > 0 
  THEN 33
  WHEN location IS NOT NULL AND location != '' 
  THEN 33
  ELSE 0
END;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'profile_completion';

-- Show sample data to verify
SELECT id, name, bio, skills, location, profile_completion 
FROM users 
LIMIT 5; 