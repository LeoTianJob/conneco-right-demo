-- Baseline schema (fresh `supabase db reset`). Clerk JWT template "supabase" required for RLS.

-- ── 1. JWT helper (RLS) ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(
    current_setting('request.jwt.claims', true)::json->>'sub',
    ''
  )::text;
$$;

-- ── 2. Institution ─────────────────────────────────────────────────────────
CREATE TABLE institution (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text,
  institution_type text,
  attributes       jsonb DEFAULT '{}',
  created_at       timestamptz DEFAULT now()
);

-- ── 3. Profiles (internal uuid PK; Clerk id in clerk_id) ───────────────────
CREATE TABLE profiles (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id                  text NOT NULL,
  email                     text NOT NULL,
  first_name                text,
  last_name                 text,
  image_url                 text,
  user_type                 text NOT NULL DEFAULT 'individual',
  institution_id            uuid REFERENCES institution(id),
  attributes                jsonb DEFAULT '{}',
  created_at                timestamptz DEFAULT now(),
  updated_at                timestamptz DEFAULT now(),
  deleted_at                timestamptz,
  status                    text NOT NULL DEFAULT 'active',
  scheduled_deletion_time   timestamptz,
  CONSTRAINT profiles_clerk_id_unique UNIQUE (clerk_id),
  CONSTRAINT profiles_email_unique UNIQUE (email),
  CONSTRAINT profiles_status_check CHECK (status IN ('active', 'deleted', 'recovered'))
);

CREATE INDEX idx_profiles_institution_id ON profiles(institution_id);

COMMENT ON TABLE profiles IS 'App user profile; id is internal uuid, clerk_id is Clerk user_xxx (unique).';
COMMENT ON COLUMN profiles.id IS 'Internal primary key (uuid).';
COMMENT ON COLUMN profiles.clerk_id IS 'Clerk user id (JWT sub); unique.';
COMMENT ON COLUMN profiles.deleted_at IS 'When the account was soft-deleted; null while active.';
COMMENT ON COLUMN profiles.status IS 'active | deleted | recovered';
COMMENT ON COLUMN profiles.scheduled_deletion_time IS 'Optional deferred hard-delete or purge time; reserved for future jobs.';

-- ── 4. profile_institutions ─────────────────────────────────────────────────
CREATE TABLE profile_institutions (
  profile_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE ON UPDATE CASCADE,
  institution_id uuid NOT NULL REFERENCES institution(id) ON DELETE CASCADE,
  created_at     timestamptz DEFAULT now(),
  PRIMARY KEY (profile_id, institution_id)
);

CREATE INDEX idx_profile_institutions_profile ON profile_institutions(profile_id);
CREATE INDEX idx_profile_institutions_institution ON profile_institutions(institution_id);

-- ── 5. updated_at trigger ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 6. user_identities (linked social providers) ────────────────────────────
CREATE TABLE user_identities (
  id               text PRIMARY KEY,
  profile_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE ON UPDATE CASCADE,
  provider         text NOT NULL,
  provider_user_id text,
  provider_email   text,
  provider_avatar  text,
  linked_at        timestamptz DEFAULT now()
);

CREATE INDEX idx_user_identities_profile ON user_identities(profile_id);
CREATE INDEX idx_user_identities_provider ON user_identities(provider);

-- ── 7. RLS: profiles ────────────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own ON profiles
  FOR SELECT TO authenticated
  USING (clerk_id = requesting_user_id());

CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE TO authenticated
  USING (clerk_id = requesting_user_id())
  WITH CHECK (clerk_id = requesting_user_id());

-- ── 8. RLS: institution ─────────────────────────────────────────────────────
ALTER TABLE institution ENABLE ROW LEVEL SECURITY;

CREATE POLICY institution_select_authenticated ON institution
  FOR SELECT TO authenticated
  USING (true);

-- ── 9. RLS: profile_institutions ────────────────────────────────────────────
ALTER TABLE profile_institutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY profile_institutions_select_own ON profile_institutions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = profile_institutions.profile_id
        AND p.clerk_id = requesting_user_id()
    )
  );

CREATE POLICY profile_institutions_insert_own ON profile_institutions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = profile_institutions.profile_id
        AND p.clerk_id = requesting_user_id()
    )
  );

CREATE POLICY profile_institutions_delete_own ON profile_institutions
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = profile_institutions.profile_id
        AND p.clerk_id = requesting_user_id()
    )
  );

-- ── 10. RLS: user_identities ────────────────────────────────────────────────
ALTER TABLE user_identities ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_identities_select_own ON user_identities
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = user_identities.profile_id
        AND p.clerk_id = requesting_user_id()
    )
  );
