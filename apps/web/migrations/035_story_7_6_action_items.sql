-- 035: Story 7.6 — Action Items Carry-Forward + Action Items Everywhere
--
-- 1. Extend action_items.assignee CHECK to allow 'unknown' (AI ambiguous attribution).
-- 2. get_open_session_count(item_id) — computed "Open X sessions" indicator.
--
-- Numbered 035 (next after 034/Story 7.7) per ship-order migration policy; the
-- story file's "033" predates Story 7.7's 034 and would collide on ordering.
--
-- Notes:
-- - assignee, completed, completed_at all exist from migration 015/016.
-- - No assignee_type column (epic spec error); reuse existing assignee.
-- - sessions_open_count is computed, not stored (avoids counter/race upkeep).

-- ---------------------------------------------------------------------------
-- Extend assignee CHECK to allow 'unknown'
-- ---------------------------------------------------------------------------

ALTER TABLE action_items DROP CONSTRAINT IF EXISTS action_items_assignee_check;
ALTER TABLE action_items ADD CONSTRAINT action_items_assignee_check
  CHECK (assignee IS NULL OR assignee IN ('coach', 'client', 'unknown'));

COMMENT ON COLUMN action_items.assignee IS
  'Story 7.6. Who committed: coach | client | unknown (AI ambiguous). NULL = legacy pre-7.6 item; hidden from Client Card client/coach split.';

-- ---------------------------------------------------------------------------
-- Computed open-session count
-- ---------------------------------------------------------------------------
-- For an open item from session S (date D) on client C, counts how many of C's
-- sessions have occurred on/after D — i.e. how many sessions the commitment has
-- stayed open across. Returns 0 for completed/missing items.

CREATE OR REPLACE FUNCTION get_open_session_count(item_id UUID)
RETURNS INT
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  src_client_id UUID;
  src_session_date DATE;
  open_count INT;
BEGIN
  SELECT a.client_id, s.session_date
    INTO src_client_id, src_session_date
  FROM action_items a
  JOIN sessions s ON s.id = a.session_id
  WHERE a.id = item_id AND a.completed = FALSE;

  IF src_client_id IS NULL THEN
    RETURN 0;
  END IF;

  SELECT COUNT(*) INTO open_count
  FROM sessions
  WHERE client_id = src_client_id
    AND session_date >= src_session_date;

  RETURN open_count;
END;
$$;

COMMENT ON FUNCTION get_open_session_count(UUID) IS
  'Story 7.6. Count of client sessions on/after the source session of an open action item. Drives the "Open X sessions" indicator.';
