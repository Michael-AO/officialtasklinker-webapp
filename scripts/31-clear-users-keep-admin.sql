-- Clear all users except admin(s)
-- Run in Supabase SQL Editor (Project Settings > Database > SQL Editor)
--
-- PREREQUISITES:
-- 1. Ensure at least one user is admin:
--    UPDATE users SET user_type = 'admin' WHERE email = 'your-admin@example.com';
-- 2. If you have no admin yet: sign up a user, run the UPDATE above, then run this script.
--
-- ADMIN LOGIN: Magic-link auth. Go to /login, select "Admin", enter admin email, request magic link.

-- =============================================================================
-- 1. Delete in dependency order (only data referencing non-admin users)
-- =============================================================================

-- Notifications
DELETE FROM notifications
WHERE user_id IN (SELECT id FROM users WHERE user_type IS DISTINCT FROM 'admin');

-- User sessions
DELETE FROM user_sessions
WHERE user_id IN (SELECT id FROM users WHERE user_type IS DISTINCT FROM 'admin');

-- Application answers (via applications by non-admin freelancers)
DELETE FROM application_answers
WHERE application_id IN (
  SELECT id FROM applications
  WHERE freelancer_id IN (SELECT id FROM users WHERE user_type IS DISTINCT FROM 'admin')
);

-- Applications by non-admin freelancers
DELETE FROM applications
WHERE freelancer_id IN (SELECT id FROM users WHERE user_type IS DISTINCT FROM 'admin');

-- Messages (where sender or receiver is non-admin)
DELETE FROM messages
WHERE sender_id IN (SELECT id FROM users WHERE user_type IS DISTINCT FROM 'admin')
   OR receiver_id IN (SELECT id FROM users WHERE user_type IS DISTINCT FROM 'admin');

-- Portfolio items
DELETE FROM portfolio_items
WHERE user_id IN (SELECT id FROM users WHERE user_type IS DISTINCT FROM 'admin');

-- Support requests
DELETE FROM support_requests
WHERE user_id IN (SELECT id FROM users WHERE user_type IS DISTINCT FROM 'admin');

-- Bank accounts (if table exists - comment out if you get "relation does not exist")
DO $$ BEGIN
  DELETE FROM bank_accounts
  WHERE user_id IN (SELECT id FROM users WHERE user_type IS DISTINCT FROM 'admin');
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Tasks owned by non-admin clients: remove dependent rows first
-- Platform ledger (via task_milestones)
DELETE FROM platform_ledger
WHERE milestone_id IN (
  SELECT tm.id FROM task_milestones tm
  JOIN tasks t ON t.id = tm.task_id
  WHERE t.client_id IN (SELECT id FROM users WHERE user_type IS DISTINCT FROM 'admin')
);

-- Disputes
DELETE FROM disputes
WHERE milestone_id IN (
  SELECT tm.id FROM task_milestones tm
  JOIN tasks t ON t.id = tm.task_id
  WHERE t.client_id IN (SELECT id FROM users WHERE user_type IS DISTINCT FROM 'admin')
);
DELETE FROM disputes
WHERE raised_by IN (SELECT id FROM users WHERE user_type IS DISTINCT FROM 'admin');

-- Task milestones
DELETE FROM task_milestones
WHERE task_id IN (
  SELECT id FROM tasks
  WHERE client_id IN (SELECT id FROM users WHERE user_type IS DISTINCT FROM 'admin')
);

-- Escrow accounts
DELETE FROM escrow_accounts
WHERE task_id IN (
  SELECT id FROM tasks
  WHERE client_id IN (SELECT id FROM users WHERE user_type IS DISTINCT FROM 'admin')
);

-- Applications (for those tasks)
DELETE FROM applications
WHERE task_id IN (
  SELECT id FROM tasks
  WHERE client_id IN (SELECT id FROM users WHERE user_type IS DISTINCT FROM 'admin')
);

-- Tasks
DELETE FROM tasks
WHERE client_id IN (SELECT id FROM users WHERE user_type IS DISTINCT FROM 'admin');

-- User verification requests (if table exists)
DO $$ BEGIN
  DELETE FROM user_verification_requests
  WHERE user_id IN (SELECT id FROM users WHERE user_type IS DISTINCT FROM 'admin');
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- =============================================================================
-- 2. Delete from auth.users (Supabase Auth)
--    Prevents orphaned auth records - users won't be able to log in anymore.
--    Requires service_role or database owner. Run in Supabase SQL Editor.
-- =============================================================================
DELETE FROM auth.users
WHERE id IN (SELECT id FROM public.users WHERE user_type IS DISTINCT FROM 'admin');

-- =============================================================================
-- 3. Delete non-admin users from public.users
-- =============================================================================
DELETE FROM users
WHERE user_type IS DISTINCT FROM 'admin';

-- =============================================================================
-- 4. Verify - should only show admin(s)
-- =============================================================================
SELECT id, email, name, user_type FROM users;
