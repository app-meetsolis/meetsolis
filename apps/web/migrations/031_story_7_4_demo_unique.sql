-- 031: Story 7.4 follow-up — enforce one demo client per user.
--
-- Closes the race window in seed-demo-client.ts where two concurrent POSTs
-- could pass the maybeSingle() check and each insert their own demo row.
-- With this UNIQUE partial index, the second insert raises 23505 and the seed
-- function falls back to returning the existing row as alreadySeeded.
--
-- Migration 030 created the non-unique idx_clients_is_demo for the lookup;
-- this replaces it with a UNIQUE version covering the same query shape.

-- Defensive: clean up any duplicate demo rows that may have been created
-- before this constraint existed (keeps the oldest one per user).
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at, id) AS rn
  FROM clients
  WHERE is_demo = TRUE
)
DELETE FROM clients
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

DROP INDEX IF EXISTS idx_clients_is_demo;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_clients_one_demo_per_user
  ON clients(user_id)
  WHERE is_demo = TRUE;

COMMENT ON INDEX uniq_clients_one_demo_per_user IS
  'Story 7.4. Enforces at most one demo client per user; supports seed-demo-client idempotency lookup.';
