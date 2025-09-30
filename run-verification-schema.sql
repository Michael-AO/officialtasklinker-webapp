-- STEP-BY-STEP: Manual Verification Database Setup
-- Run this in your Supabase SQL Editor

-- =====================================================
-- STEP 1: Create Storage Bucket for Documents
-- =====================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verification-documents',
  'verification-documents',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 2: Create Manual Verification Requests Table
-- =====================================================
CREATE TABLE IF NOT EXISTS manual_verification_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL CHECK (verification_type IN ('identity', 'business', 'professional')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processing')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  personal_info JSONB NOT NULL,
  business_info JSONB,
  documents JSONB NOT NULL DEFAULT '[]'::jsonb,
  additional_info TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 3: Create Indexes for Performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_manual_verification_user_id ON manual_verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_manual_verification_status ON manual_verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_manual_verification_type ON manual_verification_requests(verification_type);
CREATE INDEX IF NOT EXISTS idx_manual_verification_submitted_at ON manual_verification_requests(submitted_at);

-- =====================================================
-- STEP 4: Enable Row Level Security
-- =====================================================
ALTER TABLE manual_verification_requests ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 5: Create RLS Policies
-- =====================================================

-- Users can view their own verification requests
CREATE POLICY "Users can view own verification requests" ON manual_verification_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own verification requests
CREATE POLICY "Users can insert own verification requests" ON manual_verification_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own verification requests (only if pending)
CREATE POLICY "Users can update own pending verification requests" ON manual_verification_requests
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Admins can view all verification requests
CREATE POLICY "Admins can view all verification requests" ON manual_verification_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.email IN ('michael@tasklinkers.com', 'admin@tasklinkers.com')
    )
  );

-- Admins can update all verification requests
CREATE POLICY "Admins can update all verification requests" ON manual_verification_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.email IN ('michael@tasklinkers.com', 'admin@tasklinkers.com')
    )
  );

-- =====================================================
-- STEP 6: Create Helper Functions
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_manual_verification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle verification approval
CREATE OR REPLACE FUNCTION handle_verification_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if status changed to 'approved'
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Update user verification status
    UPDATE users 
    SET 
      is_verified = true,
      dojah_verified = true,
      verification_type = NEW.verification_type,
      updated_at = NOW()
    WHERE id = NEW.user_id;
    
    -- Insert notification for user
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      data,
      created_at
    ) VALUES (
      NEW.user_id,
      'verification_approved',
      'Verification Approved! 🎉',
      'Your account has been verified! You now have access to all platform features.',
      jsonb_build_object(
        'verification_type', NEW.verification_type,
        'approved_at', NEW.reviewed_at
      ),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle verification rejection
CREATE OR REPLACE FUNCTION handle_verification_rejection()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if status changed to 'rejected'
  IF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
    -- Insert notification for user
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      data,
      created_at
    ) VALUES (
      NEW.user_id,
      'verification_rejected',
      'Verification Rejected',
      COALESCE(NEW.admin_notes, 'Your verification request has been rejected. Please review the requirements and submit a new request.'),
      jsonb_build_object(
        'verification_type', NEW.verification_type,
        'rejected_at', NEW.reviewed_at,
        'admin_notes', NEW.admin_notes
      ),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 7: Create Triggers
-- =====================================================

-- Trigger for updated_at
CREATE TRIGGER update_manual_verification_updated_at
  BEFORE UPDATE ON manual_verification_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_manual_verification_updated_at();

-- Trigger for verification approval
CREATE TRIGGER handle_verification_approval_trigger
  AFTER UPDATE ON manual_verification_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_verification_approval();

-- Trigger for verification rejection
CREATE TRIGGER handle_verification_rejection_trigger
  AFTER UPDATE ON manual_verification_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_verification_rejection();

-- =====================================================
-- STEP 8: Grant Permissions
-- =====================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON manual_verification_requests TO authenticated;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT SELECT, INSERT, UPDATE ON storage.objects TO authenticated;

-- =====================================================
-- STEP 9: Create Admin Dashboard View
-- =====================================================
CREATE OR REPLACE VIEW admin_verification_dashboard AS
SELECT 
  mvr.id,
  mvr.user_id,
  u.email as user_name,
  u.email as user_email,
  u.user_type,
  mvr.verification_type,
  mvr.status,
  mvr.submitted_at,
  mvr.reviewed_at,
  mvr.reviewed_by,
  reviewer.email as reviewer_name,
  mvr.personal_info,
  mvr.business_info,
  mvr.documents,
  mvr.admin_notes,
  mvr.created_at,
  mvr.updated_at
FROM manual_verification_requests mvr
LEFT JOIN users u ON mvr.user_id = u.id
LEFT JOIN users reviewer ON mvr.reviewed_by = reviewer.id
ORDER BY mvr.submitted_at DESC;

-- Grant access to admin view
GRANT SELECT ON admin_verification_dashboard TO authenticated;

-- =====================================================
-- STEP 10: Create Performance Indexes
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_admin_verification_dashboard_status ON manual_verification_requests(status, submitted_at);
CREATE INDEX IF NOT EXISTS idx_admin_verification_dashboard_type ON manual_verification_requests(verification_type, status);

-- =====================================================
-- VERIFICATION: Check if everything was created successfully
-- =====================================================
SELECT 'Schema setup complete!' as status;

-- Check if table exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'manual_verification_requests') 
    THEN '✅ manual_verification_requests table created'
    ELSE '❌ manual_verification_requests table NOT created'
  END as table_status;

-- Check if storage bucket exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'verification-documents') 
    THEN '✅ verification-documents bucket created'
    ELSE '❌ verification-documents bucket NOT created'
  END as bucket_status;
