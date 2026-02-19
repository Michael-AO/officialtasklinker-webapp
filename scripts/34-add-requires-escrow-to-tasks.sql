-- Add requires_escrow to tasks so we can show escrow-enabled badge and branch post-success flow.
-- Safe to run: adds column only if missing.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'requires_escrow'
  ) THEN
    ALTER TABLE tasks ADD COLUMN requires_escrow BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added requires_escrow to tasks';
  ELSE
    RAISE NOTICE 'requires_escrow already exists on tasks';
  END IF;
END $$;
