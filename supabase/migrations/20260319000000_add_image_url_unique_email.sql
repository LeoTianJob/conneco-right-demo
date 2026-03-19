-- Add image_url column and UNIQUE constraint on email to profiles table.
-- Create user_identities table to track linked social providers.

-- ── 1. Extend profiles ──

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS image_url text;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_email_unique UNIQUE (email);

-- ── 2. Linked social providers ──
-- One row per external account (Google, Facebook, Apple, etc.).
-- Clerk sends the full external_accounts array on every webhook,
-- so the webhook handler replaces all rows for a given profile_id each time.

CREATE TABLE user_identities (
  id               text PRIMARY KEY,           -- Clerk external account ID (eac_xxx)
  profile_id       text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider         text NOT NULL,              -- e.g. "google", "facebook", "apple"
  provider_user_id text,                       -- user's ID on the provider platform
  provider_email   text,                       -- email from the provider (may differ from primary)
  provider_avatar  text,                       -- avatar URL from the provider
  linked_at        timestamptz DEFAULT now()
);

CREATE INDEX idx_user_identities_profile ON user_identities(profile_id);
CREATE INDEX idx_user_identities_provider ON user_identities(provider);

-- ── 3. RLS for user_identities ──

ALTER TABLE user_identities ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_identities_select_own ON user_identities
  FOR SELECT TO authenticated
  USING (requesting_user_id() = profile_id);
