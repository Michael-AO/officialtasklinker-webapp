-- Migration script to add dojah_verified column to users table
-- This supports the two-step verification process: email verification + Dojah verification
-- Run this in your Supabase SQL editor

-- Add dojah_verified column if it doesn't exist
DO $$
BEGIN
    -- Check if the column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'dojah_verified'
    ) THEN
        -- Add the dojah_verified column
        ALTER TABLE users 
        ADD COLUMN dojah_verified BOOLEAN DEFAULT FALSE;
        
        RAISE NOTICE 'Added dojah_verified column to users table';
    ELSE
        RAISE NOTICE 'dojah_verified column already exists in users table';
    END IF;
END $$;

-- Add verification_type column if it doesn't exist
DO $$
BEGIN
    -- Check if the column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'verification_type'
    ) THEN
        -- Add the verification_type column
        ALTER TABLE users 
        ADD COLUMN verification_type VARCHAR(50) DEFAULT NULL;
        
        RAISE NOTICE 'Added verification_type column to users table';
    ELSE
        RAISE NOTICE 'verification_type column already exists in users table';
    END IF;
END $$;

-- Create index for dojah_verified column for better query performance
CREATE INDEX IF NOT EXISTS idx_users_dojah_verified ON users(dojah_verified);

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'dojah_verified';

-- Update existing verified users to have dojah_verified = true
-- (assuming already verified users should be considered Dojah verified)
UPDATE users 
SET dojah_verified = true 
WHERE is_verified = true AND dojah_verified = false;

-- Show the current verification status for all users
SELECT 
    id,
    email,
    name,
    user_type,
    is_verified as email_verified,
    dojah_verified,
    CASE 
        WHEN is_verified = true AND dojah_verified = true THEN 'Fully Verified'
        WHEN is_verified = true AND dojah_verified = false THEN 'Email Verified Only'
        WHEN is_verified = false AND dojah_verified = true THEN 'Dojah Verified Only'
        ELSE 'Not Verified'
    END as verification_status
FROM users 
ORDER BY created_at DESC;
