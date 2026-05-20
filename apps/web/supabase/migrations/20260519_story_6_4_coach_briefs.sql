-- Story 6.4: Coach Brief

-- coach_briefs table
CREATE TABLE coach_briefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  calendar_event_id uuid UNIQUE REFERENCES calendar_events(id) ON DELETE CASCADE,
  content jsonb NOT NULL,
  generation_status text NOT NULL DEFAULT 'ok'
    CHECK (generation_status IN ('ok','ai_failed','partial')),
  dismissed boolean NOT NULL DEFAULT false,
  dismissed_at timestamptz,
  generated_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX coach_briefs_user_idx ON coach_briefs (user_id, generated_at DESC);
CREATE INDEX coach_briefs_client_idx ON coach_briefs (client_id, generated_at DESC);

ALTER TABLE coach_briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY coach_briefs_owner ON coach_briefs
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- clients.coach_notes
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS coach_notes text NOT NULL DEFAULT '';

-- user_preferences.coach_brief_window_minutes
-- Story 6.5 adds the settings-UI selector; this column must exist first
ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS coach_brief_window_minutes integer NOT NULL DEFAULT 60
    CHECK (coach_brief_window_minutes BETWEEN 15 AND 240);
