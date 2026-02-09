-- Migration: Notifications table for real-time notifications
-- Aligns schema with spec: id, user_id, type, title, content, link, is_read, created_at
-- Run this in Supabase SQL Editor

-- Add content column (use message as fallback for existing rows)
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS content TEXT;

-- Add link column
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link VARCHAR(512);

-- Backfill content from message for existing rows
UPDATE notifications SET content = message WHERE content IS NULL AND message IS NOT NULL;

-- Extend type CHECK to include UI types (info, success, warning, error)
-- Drop existing constraint if it exists and recreate with extended values
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (
  type IN (
    'task', 'application', 'payment', 'message', 'system',
    'info', 'success', 'warning', 'error'
  )
);

-- Ensure RLS is enabled
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;

-- RLS: Users can only SELECT and UPDATE their own notifications
-- Note: auth.uid() requires Supabase Auth. For custom JWT (tl-auth-token),
-- use API route with ServerSessionManager + service role client for server-side operations.
-- Client fetches via /api/notifications which verifies session.
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Enable Realtime for notifications table (run in Supabase Dashboard: Database > Replication)
-- Or via SQL:
-- ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
