-- Soft-delete columns for profiles: audit trail, email masking, and recovery placeholder status.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS original_email text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_status_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_status_check
  CHECK (status IN ('active', 'deleted', 'recovered'));

COMMENT ON COLUMN profiles.deleted_at IS 'When the account was soft-deleted; null while active.';
COMMENT ON COLUMN profiles.original_email IS 'Primary email before masking at deletion; for audit and future restore.';
COMMENT ON COLUMN profiles.status IS 'active | deleted | recovered';
