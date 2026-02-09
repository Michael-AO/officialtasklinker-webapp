-- Add 'assigned' to tasks.status enum (state machine: active -> assigned -> in_progress -> completed)
-- PostgreSQL: alter CHECK constraint by dropping and re-adding

ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check
  CHECK (status IN ('draft', 'active', 'assigned', 'in_progress', 'completed', 'cancelled'));
