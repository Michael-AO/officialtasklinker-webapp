-- Allow 'admin' in users.user_type (required for admin-login to create admin users)
-- Run this in Supabase SQL Editor if admin account creation fails with a constraint error.

-- Try common constraint name first
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_user_type_check;

DO $$
DECLARE
  conname text;
BEGIN
  -- If still a check on user_type (e.g. different name), find and drop it
  SELECT c.conname INTO conname
  FROM pg_constraint c
  JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
  WHERE c.conrelid = 'public.users'::regclass
    AND c.contype = 'c'
    AND a.attname = 'user_type'
  LIMIT 1;

  IF conname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE users DROP CONSTRAINT %I', conname);
  END IF;
END $$;

-- Add constraint that includes 'admin'
ALTER TABLE users ADD CONSTRAINT users_user_type_check
  CHECK (user_type IN ('freelancer', 'client', 'admin'));
