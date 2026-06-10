-- 034: Story 7.7 — Living Client Card
--
-- 1. ABOUT-section fields on clients (industry, company_size, about_notes)
-- 2. Avatar URL on clients (Supabase Storage `client-avatars` bucket — bucket
--    must be created manually via Supabase dashboard; not creatable via SQL)
-- 3. Per-field coach-override flags on the AI Intelligence Strip
-- 4. Per-session tags (Breakthrough / Stuck / Milestone / Goal-setting)
--
-- Notes:
-- - `coach_notes` (plural) already exists from Story 6.4
-- - `ai_intelligence_strip` already exists from Story 7.4 migration 030
-- - `email` is NOT added here; Story 7.5 migration 032 will own that

-- ---------------------------------------------------------------------------
-- clients table — ABOUT fields, avatar, override flags
-- ---------------------------------------------------------------------------

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS company_size TEXT,
  ADD COLUMN IF NOT EXISTS about_notes TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS ai_intelligence_strip_overrides JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Enum-like check for company_size; NULL allowed for clients without the field
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_company_size_check;
ALTER TABLE clients
  ADD CONSTRAINT clients_company_size_check
  CHECK (company_size IS NULL OR company_size IN ('solo','2-10','11-50','51-200','201-1000','1000+'));

COMMENT ON COLUMN clients.industry IS
  'Story 7.7. Free-text industry (e.g., "Technology", "Healthcare").';
COMMENT ON COLUMN clients.company_size IS
  'Story 7.7. One of: solo, 2-10, 11-50, 51-200, 201-1000, 1000+.';
COMMENT ON COLUMN clients.about_notes IS
  'Story 7.7. Coach private notes about the client, persistent across sessions.';
COMMENT ON COLUMN clients.avatar_url IS
  'Story 7.7. Path/URL into Supabase Storage bucket `client-avatars`.';
COMMENT ON COLUMN clients.ai_intelligence_strip_overrides IS
  'Story 7.7. Per-field flags: {recurring_theme: true, ...} = coach edited that field; skip on AI regen.';

-- ---------------------------------------------------------------------------
-- sessions table — tags
-- ---------------------------------------------------------------------------

ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_sessions_tags ON sessions USING GIN(tags);

COMMENT ON COLUMN sessions.tags IS
  'Story 7.7. Up to 2 enum values: breakthrough, stuck, milestone, goal-setting. AI-classified at summary time; coach-editable.';
