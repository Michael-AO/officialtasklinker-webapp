-- Add kyc_fail_reason for YouVerify failure feedback (e.g. "Image too blurry", "Face mismatch")
-- Run in Supabase SQL Editor.
ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_fail_reason TEXT;
