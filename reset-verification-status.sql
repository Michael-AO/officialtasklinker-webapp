-- Reset verification status for testing
-- Run this in your Supabase SQL Editor to unverify your account

-- Update your user account to unverified status
UPDATE users 
SET 
  is_verified = false,
  dojah_verified = false,
  verification_type = null,
  updated_at = NOW()
WHERE email = 'your-email@example.com'; -- Replace with your actual email

-- Also delete any existing verification requests for testing (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'manual_verification_requests') THEN
    DELETE FROM manual_verification_requests 
    WHERE user_id = (
      SELECT id FROM users 
      WHERE email = 'your-email@example.com' -- Replace with your actual email
    );
  END IF;
END $$;

-- Show the updated status
SELECT 
  id,
  email,
  name,
  is_verified,
  dojah_verified,
  verification_type,
  updated_at
FROM users 
WHERE email = 'your-email@example.com'; -- Replace with your actual email
