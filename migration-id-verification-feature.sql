-- Migration: Add ID Verification Feature
-- Date: 2025-08-30
-- Purpose: Add ID verification requirement for posting/applying to tasks
-- Existing Users: 70 users will be marked as unverified until they complete ID verification

-- Step 1: Add new columns safely
DO $$
BEGIN
    -- Add dojah_verified column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'dojah_verified'
    ) THEN
        ALTER TABLE users ADD COLUMN dojah_verified BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added dojah_verified column to users table';
    ELSE
        RAISE NOTICE 'dojah_verified column already exists in users table';
    END IF;

    -- Add verification_type column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'verification_type'
    ) THEN
        ALTER TABLE users ADD COLUMN verification_type VARCHAR(50) DEFAULT NULL;
        RAISE NOTICE 'Added verification_type column to users table';
    ELSE
        RAISE NOTICE 'verification_type column already exists in users table';
    END IF;
END $$;

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_dojah_verified ON users(dojah_verified);
CREATE INDEX IF NOT EXISTS idx_users_verification_type ON users(verification_type);

-- Step 3: Handle existing users - Mark all existing users as unverified for ID verification
-- This ensures no existing users can post/apply until they complete ID verification
UPDATE users 
SET dojah_verified = FALSE 
WHERE dojah_verified IS NULL OR dojah_verified = TRUE;

-- Step 4: Verify migration
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN is_verified = TRUE THEN 1 END) as email_verified_users,
    COUNT(CASE WHEN dojah_verified = TRUE THEN 1 END) as id_verified_users,
    COUNT(CASE WHEN is_verified = TRUE AND dojah_verified = FALSE THEN 1 END) as pending_id_verification
FROM users;

-- Step 5: Show current verification status for all users
SELECT 
    id,
    email,
    name,
    user_type,
    is_verified as email_verified,
    dojah_verified as id_verified,
    verification_type,
    CASE 
        WHEN is_verified = TRUE AND dojah_verified = TRUE THEN 'Fully Verified'
        WHEN is_verified = TRUE AND dojah_verified = FALSE THEN 'Email Verified - ID Pending'
        WHEN is_verified = FALSE AND dojah_verified = TRUE THEN 'ID Verified - Email Pending'
        ELSE 'Not Verified'
    END as verification_status,
    created_at
FROM users 
ORDER BY created_at DESC;
