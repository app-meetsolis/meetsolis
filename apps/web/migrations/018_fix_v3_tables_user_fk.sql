-- Migration 018: Fix user_id FK on v3 tables to explicitly reference public.users
-- Same fix as migration 017 (action_items). Without public. prefix, Supabase
-- may resolve to auth.users instead of public.users, causing FK violations.

-- sessions
ALTER TABLE sessions
  DROP CONSTRAINT IF EXISTS sessions_user_id_fkey;

ALTER TABLE sessions
  ADD CONSTRAINT sessions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- solis_queries
ALTER TABLE solis_queries
  DROP CONSTRAINT IF EXISTS solis_queries_user_id_fkey;

ALTER TABLE solis_queries
  ADD CONSTRAINT solis_queries_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- usage_tracking
ALTER TABLE usage_tracking
  DROP CONSTRAINT IF EXISTS usage_tracking_user_id_fkey;

ALTER TABLE usage_tracking
  ADD CONSTRAINT usage_tracking_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- subscriptions
ALTER TABLE subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;

ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
