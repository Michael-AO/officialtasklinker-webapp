-- Clean Deployment Script for Manual Verification System
-- This script safely sets up the manual verification system without foreign key violations

-- Step 1: Add columns to users table first (if they don't exist)
ALTER TABLE users ADD COLUMN IF NOT EXISTS manual_verification_status VARCHAR(20) DEFAULT 'not_submitted' CHECK (manual_verification_status IN ('not_submitted', 'pending', 'under_review', 'approved', 'rejected'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS manual_verification_id UUID;

-- Step 2: Create manual verification submissions table
CREATE TABLE IF NOT EXISTS manual_verification_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('id_card', 'voters_card', 'drivers_license', 'passport', 'other')),
    front_image_url TEXT,
    back_image_url TEXT,
    selfie_with_document_url TEXT,
    additional_notes TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES users(id),
    rejection_reason TEXT,
    verification_score INTEGER CHECK (verification_score >= 1 AND verification_score <= 100),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Add foreign key constraint to users table for manual_verification_id
-- First check if constraint exists, then add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_users_manual_verification_id'
        AND table_name = 'users'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT fk_users_manual_verification_id 
            FOREIGN KEY (manual_verification_id) REFERENCES manual_verification_submissions(id);
    END IF;
END $$;

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_manual_verification_user_id ON manual_verification_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_manual_verification_status ON manual_verification_submissions(status);
CREATE INDEX IF NOT EXISTS idx_manual_verification_created_at ON manual_verification_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_manual_verification_document_type ON manual_verification_submissions(document_type);
CREATE INDEX IF NOT EXISTS idx_users_manual_verification_status ON users(manual_verification_status);
CREATE INDEX IF NOT EXISTS idx_users_manual_verification_id ON users(manual_verification_id);

-- Step 5: Create audit trail table
CREATE TABLE IF NOT EXISTS verification_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES manual_verification_submissions(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    performed_by UUID REFERENCES users(id),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_audit_submission_id ON verification_audit_log(submission_id);
CREATE INDEX IF NOT EXISTS idx_verification_audit_created_at ON verification_audit_log(created_at);

-- Step 6: Set up Row Level Security
ALTER TABLE manual_verification_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_audit_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own verification submissions" ON manual_verification_submissions;
DROP POLICY IF EXISTS "Users can create own verification submissions" ON manual_verification_submissions;
DROP POLICY IF EXISTS "Admins can manage all verification submissions" ON manual_verification_submissions;
DROP POLICY IF EXISTS "Users can view own audit logs" ON verification_audit_log;
DROP POLICY IF EXISTS "Admins can view all audit logs" ON verification_audit_log;

-- Create RLS policies
CREATE POLICY "Users can view own verification submissions" ON manual_verification_submissions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own verification submissions" ON manual_verification_submissions
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all verification submissions" ON manual_verification_submissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND user_type = 'admin'
        )
    );

CREATE POLICY "Users can view own audit logs" ON verification_audit_log
    FOR SELECT USING (
        submission_id IN (
            SELECT id FROM manual_verification_submissions WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all audit logs" ON verification_audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND user_type = 'admin'
        )
    );

-- Step 7: Create functions for automatic updates
CREATE OR REPLACE FUNCTION update_user_verification_on_approval()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update when status changes to approved
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        UPDATE users 
        SET 
            dojah_verified = true,
            verification_type = 'manual_admin_approved',
            manual_verification_status = 'approved',
            updated_at = NOW()
        WHERE id = NEW.user_id;
        
        -- Log the approval action
        INSERT INTO verification_audit_log (submission_id, action, performed_by, details)
        VALUES (
            NEW.id, 
            'approved', 
            NEW.reviewed_by,
            jsonb_build_object(
                'verification_score', NEW.verification_score,
                'admin_notes', NEW.admin_notes
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_verification_action()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO verification_audit_log (submission_id, action, performed_by, details)
    VALUES (
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        COALESCE(NEW.reviewed_by, auth.uid()),
        jsonb_build_object(
            'old_status', OLD.status,
            'new_status', NEW.status,
            'document_type', COALESCE(NEW.document_type, OLD.document_type)
        )
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create triggers
DROP TRIGGER IF EXISTS trigger_update_user_verification ON manual_verification_submissions;
DROP TRIGGER IF EXISTS trigger_log_verification_actions ON manual_verification_submissions;

CREATE TRIGGER trigger_update_user_verification
    AFTER UPDATE ON manual_verification_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_verification_on_approval();

CREATE TRIGGER trigger_log_verification_actions
    AFTER INSERT OR UPDATE OR DELETE ON manual_verification_submissions
    FOR EACH ROW
    EXECUTE FUNCTION log_verification_action();

-- Step 9: Create admin dashboard view
DROP VIEW IF EXISTS admin_verification_queue;

CREATE VIEW admin_verification_queue AS
SELECT 
    mvs.id,
    mvs.user_id,
    u.email,
    u.name as user_name,
    u.user_type,
    mvs.status,
    mvs.document_type,
    mvs.submitted_at,
    mvs.reviewed_at,
    mvs.verification_score,
    mvs.admin_notes,
    EXTRACT(EPOCH FROM (NOW() - mvs.submitted_at))/3600 as hours_pending,
    CASE 
        WHEN mvs.status = 'pending' AND EXTRACT(EPOCH FROM (NOW() - mvs.submitted_at))/3600 > 24 THEN 'overdue'
        WHEN mvs.status = 'pending' AND EXTRACT(EPOCH FROM (NOW() - mvs.submitted_at))/3600 > 12 THEN 'warning'
        ELSE 'normal'
    END as urgency_level
FROM manual_verification_submissions mvs
JOIN users u ON mvs.user_id = u.id
ORDER BY 
    CASE 
        WHEN mvs.status = 'pending' AND EXTRACT(EPOCH FROM (NOW() - mvs.submitted_at))/3600 > 24 THEN 1
        WHEN mvs.status = 'pending' AND EXTRACT(EPOCH FROM (NOW() - mvs.submitted_at))/3600 > 12 THEN 2
        ELSE 3
    END,
    mvs.submitted_at ASC;

-- Step 10: Grant permissions
GRANT SELECT, INSERT, UPDATE ON manual_verification_submissions TO authenticated;
GRANT SELECT ON verification_audit_log TO authenticated;
GRANT ALL ON manual_verification_submissions TO service_role;
GRANT ALL ON verification_audit_log TO service_role;
GRANT SELECT ON admin_verification_queue TO authenticated;
GRANT SELECT ON admin_verification_queue TO service_role;

-- Step 11: Create storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verification-documents',
  'verification-documents',
  false, -- Private bucket for security
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Step 12: Set up storage RLS policies (drop existing ones first)
DROP POLICY IF EXISTS "Users can upload their own verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all verification documents" ON storage.objects;

CREATE POLICY "Users can upload their own verification documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'verification-documents' 
  AND auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY "Users can view their own verification documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'verification-documents' 
  AND auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY "Admins can view all verification documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'verification-documents' 
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND user_type = 'admin'
  )
);

-- Step 13: Verify setup
SELECT 
  'Manual verification system setup complete!' as status,
  COUNT(*) as total_submissions,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_submissions
FROM manual_verification_submissions;

-- Step 14: Show current user verification status
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN manual_verification_status = 'not_submitted' THEN 1 END) as not_submitted,
  COUNT(CASE WHEN manual_verification_status = 'pending' THEN 1 END) as pending_manual_verification,
  COUNT(CASE WHEN dojah_verified = true THEN 1 END) as dojah_verified_users,
  COUNT(CASE WHEN is_verified = true AND dojah_verified = false THEN 1 END) as email_only_verified
FROM users;
