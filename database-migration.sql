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