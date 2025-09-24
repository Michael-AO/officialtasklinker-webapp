-- Setup script for Manual Verification System
-- Run this after applying the main schema migration

-- Create storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verification-documents',
  'verification-documents',
  false, -- Private bucket for security
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the storage bucket
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

-- Create function to auto-delete old verification documents (90 days)
CREATE OR REPLACE FUNCTION cleanup_old_verification_documents()
RETURNS void AS $$
BEGIN
  -- Delete documents from storage
  DELETE FROM storage.objects 
  WHERE bucket_id = 'verification-documents'
  AND created_at < NOW() - INTERVAL '90 days';
  
  -- Log cleanup action
  INSERT INTO verification_audit_log (action, performed_by, details)
  VALUES (
    'cleanup_old_documents',
    NULL,
    jsonb_build_object('deleted_count', ROW_COUNT())
  );
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run cleanup (if you have pg_cron extension)
-- SELECT cron.schedule('cleanup-verification-docs', '0 2 * * *', 'SELECT cleanup_old_verification_documents();');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;

-- Create index for faster verification queries
CREATE INDEX IF NOT EXISTS idx_users_manual_verification_status ON users(manual_verification_status);
CREATE INDEX IF NOT EXISTS idx_users_manual_verification_id ON users(manual_verification_id);

-- No sample data needed - table will be populated by actual user submissions

-- Verify setup
SELECT 
  'Manual verification system setup complete!' as status,
  COUNT(*) as total_submissions,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_submissions
FROM manual_verification_submissions;
