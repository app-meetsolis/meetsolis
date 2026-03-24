-- Migration 019: Replace USING (true) RLS policies on v3 tables
-- with proper user-scoped policies for defense-in-depth.
-- API routes use service role key (bypasses RLS), so these policies
-- only protect against direct anon-key access.

-- =============================================================================
-- SESSIONS
-- =============================================================================
DROP POLICY IF EXISTS "sessions_all" ON sessions;

CREATE POLICY "Users can manage own sessions"
ON sessions FOR ALL
USING (user_id = get_current_user_id())
WITH CHECK (user_id = get_current_user_id());

-- =============================================================================
-- ACTION_ITEMS
-- =============================================================================
DROP POLICY IF EXISTS "action_items_all" ON action_items;

CREATE POLICY "Users can manage own action items"
ON action_items FOR ALL
USING (user_id = get_current_user_id())
WITH CHECK (user_id = get_current_user_id());

-- =============================================================================
-- SOLIS_QUERIES
-- =============================================================================
DROP POLICY IF EXISTS "solis_queries_all" ON solis_queries;

CREATE POLICY "Users can manage own solis queries"
ON solis_queries FOR ALL
USING (user_id = get_current_user_id())
WITH CHECK (user_id = get_current_user_id());

-- =============================================================================
-- USAGE_TRACKING
-- =============================================================================
DROP POLICY IF EXISTS "usage_tracking_all" ON usage_tracking;

CREATE POLICY "Users can view own usage"
ON usage_tracking FOR SELECT
USING (user_id = get_current_user_id());

CREATE POLICY "Service can insert usage"
ON usage_tracking FOR INSERT
WITH CHECK (true);

-- =============================================================================
-- SUBSCRIPTIONS
-- =============================================================================
DROP POLICY IF EXISTS "subscriptions_all" ON subscriptions;

CREATE POLICY "Users can view own subscription"
ON subscriptions FOR SELECT
USING (user_id = get_current_user_id());

CREATE POLICY "Service can manage subscriptions"
ON subscriptions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service can update subscriptions"
ON subscriptions FOR UPDATE
USING (true)
WITH CHECK (true);
