-- Manual Verification System Database Schema
-- Emergency implementation for Dojah verification delays
-- Date: 2025-01-27

-- Create manual verification submissions table
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

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_manual_verification_user_id ON manual_verification_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_manual_verification_status ON manual_verification_submissions(status);
CREATE INDEX IF NOT EXISTS idx_manual_verification_created_at ON manual_verification_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_manual_verification_document_type ON manual_verification_submissions(document_type);

-- Add columns to existing users table for quick access
ALTER TABLE users ADD COLUMN IF NOT EXISTS manual_verification_status VARCHAR(20) DEFAULT 'not_submitted' CHECK (manual_verification_status IN ('not_submitted', 'pending', 'under_review', 'approved', 'rejected'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS manual_verification_id UUID REFERENCES manual_verification_submissions(id);

-- Create audit trail for verification actions
CREATE TABLE IF NOT EXISTS verification_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES manual_verification_submissions(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    performed_by UUID REFERENCES users(id),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for audit log
CREATE INDEX IF NOT EXISTS idx_verification_audit_submission_id ON verification_audit_log(submission_id);
CREATE INDEX IF NOT EXISTS idx_verification_audit_created_at ON verification_audit_log(created_at);

-- Row Level Security policies
ALTER TABLE manual_verification_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_audit_log ENABLE ROW LEVEL SECURITY;

-- Users can only see their own submissions
CREATE POLICY "Users can view own verification submissions" ON manual_verification_submissions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own verification submissions" ON manual_verification_submissions
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can manage all submissions
CREATE POLICY "Admins can manage all verification submissions" ON manual_verification_submissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND user_type = 'admin'
        )
    );

-- Audit log policies
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

-- Create function to update user verification status when submission is approved
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

-- Create trigger for automatic user verification update
CREATE TRIGGER trigger_update_user_verification
    AFTER UPDATE ON manual_verification_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_verification_on_approval();

-- Create function to log all verification actions
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

-- Create trigger for audit logging
CREATE TRIGGER trigger_log_verification_actions
    AFTER INSERT OR UPDATE OR DELETE ON manual_verification_submissions
    FOR EACH ROW
    EXECUTE FUNCTION log_verification_action();

-- No initial test data needed - table will be populated by actual user submissions

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON manual_verification_submissions TO authenticated;
GRANT SELECT ON verification_audit_log TO authenticated;
GRANT ALL ON manual_verification_submissions TO service_role;
GRANT ALL ON verification_audit_log TO service_role;

-- Create view for admin dashboard
CREATE OR REPLACE VIEW admin_verification_queue AS
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

-- Grant access to the view
GRANT SELECT ON admin_verification_queue TO authenticated;
GRANT SELECT ON admin_verification_queue TO service_role;

COMMENT ON TABLE manual_verification_submissions IS 'Stores manual document verification submissions for users who cannot use Dojah verification';
COMMENT ON TABLE verification_audit_log IS 'Audit trail for all verification actions and status changes';
COMMENT ON VIEW admin_verification_queue IS 'Admin dashboard view showing verification queue with urgency levels and SLA tracking';
