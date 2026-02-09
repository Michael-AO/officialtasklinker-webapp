-- Application screening question answers (for APP-01)
-- Run this if application_answers does not exist (e.g. created by Supabase dashboard or missing from initial schema)

CREATE TABLE IF NOT EXISTS application_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_application_answers_application_id ON application_answers(application_id);

COMMENT ON TABLE application_answers IS 'Stores freelancer answers to task screening questions per application';
