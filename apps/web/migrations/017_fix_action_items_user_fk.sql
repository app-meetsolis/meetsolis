-- Migration 017: Fix action_items user_id FK to reference public.users
-- Story 2.6 bugfix: FK was resolving to auth.users instead of public.users

ALTER TABLE action_items
  DROP CONSTRAINT IF EXISTS action_items_user_id_fkey;

ALTER TABLE action_items
  ADD CONSTRAINT action_items_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
