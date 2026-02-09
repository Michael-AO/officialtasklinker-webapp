-- Setup Supabase Storage for Dispute Evidence Uploads
-- Run this in your Supabase SQL Editor

-- Create the dispute-evidence storage bucket (public read so admin can open links)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'dispute-evidence',
  'dispute-evidence',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload into their own folder: {userId}/...
CREATE POLICY "Users can upload own dispute evidence" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'dispute-evidence'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Public read so evidence links work for admins and parties
CREATE POLICY "Public read dispute evidence" ON storage.objects
FOR SELECT USING (bucket_id = 'dispute-evidence');

-- Users can delete their own uploads (optional)
CREATE POLICY "Users can delete own dispute evidence" ON storage.objects
FOR DELETE USING (
  bucket_id = 'dispute-evidence'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

SELECT * FROM storage.buckets WHERE id = 'dispute-evidence';
