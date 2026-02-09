-- Phase 3: Financials, Identity, and Governance (Master Blueprint)
-- Run in Supabase SQL Editor. Adds task_milestones, disputes, platform_ledger, and YouVerify user columns.

-- 1. Milestone-Based Escrow (task-level milestones)
DO $$ BEGIN
  CREATE TYPE milestone_status AS ENUM ('PENDING', 'FUNDED', 'IN_REVIEW', 'RELEASED', 'DISPUTED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS task_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(12, 2) NOT NULL,
    status milestone_status DEFAULT 'PENDING',
    paystack_reference TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_milestones_task_id ON task_milestones(task_id);
CREATE INDEX IF NOT EXISTS idx_task_milestones_status ON task_milestones(status);

-- 2. Dispute Resolution
DO $$ BEGIN
  CREATE TYPE dispute_status AS ENUM ('OPEN', 'NEGOTIATING', 'ARBITRATION', 'RESOLVED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    milestone_id UUID NOT NULL REFERENCES task_milestones(id) ON DELETE CASCADE,
    raised_by UUID NOT NULL REFERENCES users(id),
    reason TEXT NOT NULL,
    status dispute_status DEFAULT 'OPEN',
    evidence_urls TEXT[],
    admin_verdict JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_disputes_milestone_id ON disputes(milestone_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);

-- 3. Platform Revenue Ledger
CREATE TABLE IF NOT EXISTS platform_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    milestone_id UUID NOT NULL REFERENCES task_milestones(id),
    total_amount DECIMAL(12, 2) NOT NULL,
    platform_fee DECIMAL(12, 2) NOT NULL,
    net_payout DECIMAL(12, 2) NOT NULL,
    transaction_type TEXT DEFAULT 'MILESTONE_RELEASE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_ledger_milestone_id ON platform_ledger(milestone_id);
CREATE INDEX IF NOT EXISTS idx_platform_ledger_created_at ON platform_ledger(created_at);

-- 4. Identity Sync (YouVerify) - user columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'IDLE';
ALTER TABLE users ADD COLUMN IF NOT EXISTS youverify_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_last_checked TIMESTAMP WITH TIME ZONE;
