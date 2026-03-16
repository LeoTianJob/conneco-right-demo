-- Clerk–Supabase sync: RLS helper, institution, profiles, profile_institutions, RLS policies
-- Run in order. Requires Supabase JWT template "supabase" in Clerk with JWT secret.

-- 1. Function to read Clerk user ID from JWT (used by RLS)
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

-- 2. Institution table
CREATE TABLE institution (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text,
  institution_type text,
  attributes       jsonb DEFAULT '{}',
  created_at       timestamptz DEFAULT now()
);

-- 3. Profiles table (id = Clerk user ID)
CREATE TABLE profiles (
  id             text PRIMARY KEY,
  email          text NOT NULL,
  first_name     text,
  last_name      text,
  user_type      text NOT NULL DEFAULT 'individual',
  institution_id  uuid REFERENCES institution(id),
  attributes     jsonb DEFAULT '{}',
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

CREATE INDEX idx_profiles_institution_id ON profiles(institution_id);

-- 4. Many-to-many: profile_institutions
CREATE TABLE profile_institutions (
  profile_id     text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  institution_id uuid NOT NULL REFERENCES institution(id) ON DELETE CASCADE,
  created_at     timestamptz DEFAULT now(),
  PRIMARY KEY (profile_id, institution_id)
);

CREATE INDEX idx_profile_institutions_profile ON profile_institutions(profile_id);
CREATE INDEX idx_profile_institutions_institution ON profile_institutions(institution_id);

-- 5. Trigger: keep profiles.updated_at in sync
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

-- 6. RLS: profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own ON profiles
  FOR SELECT TO authenticated
  USING (requesting_user_id() = id);

CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE TO authenticated
  USING (requesting_user_id() = id)
  WITH CHECK (requesting_user_id() = id);

-- 7. RLS: institution (read for authenticated; write via service role only)
ALTER TABLE institution ENABLE ROW LEVEL SECURITY;

CREATE POLICY institution_select_authenticated ON institution
  FOR SELECT TO authenticated
  USING (true);

-- 8. RLS: profile_institutions
ALTER TABLE profile_institutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY profile_institutions_select_own ON profile_institutions
  FOR SELECT TO authenticated
  USING (requesting_user_id() = profile_id);

CREATE POLICY profile_institutions_insert_own ON profile_institutions
  FOR INSERT TO authenticated
  WITH CHECK (requesting_user_id() = profile_id);

CREATE POLICY profile_institutions_delete_own ON profile_institutions
  FOR DELETE TO authenticated
  USING (requesting_user_id() = profile_id);
