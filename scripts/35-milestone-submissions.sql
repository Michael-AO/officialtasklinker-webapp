-- Milestone deliverable submissions: freelancer submits docs per milestone, client approves and releases.
CREATE TABLE IF NOT EXISTS milestone_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_milestone_id UUID NOT NULL REFERENCES task_milestones(id) ON DELETE CASCADE,
    freelancer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_urls TEXT[] DEFAULT '{}',
    notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'rejected'))
);

CREATE INDEX IF NOT EXISTS idx_milestone_submissions_milestone ON milestone_submissions(task_milestone_id);
CREATE INDEX IF NOT EXISTS idx_milestone_submissions_freelancer ON milestone_submissions(freelancer_id);
