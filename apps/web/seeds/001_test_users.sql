-- Seed: 001_test_users.sql
-- Description: Create test users for development and testing
-- Author: Dev Agent
-- Date: 2025-10-01
-- Usage: psql -h db.project.supabase.co -U postgres -d postgres < seeds/001_test_users.sql

-- =============================================================================
-- TEST USERS
-- =============================================================================

-- Test User 1: Host (Alice)
INSERT INTO users (clerk_id, email, name, role, verified_badge, preferences)
VALUES (
    'clerk_test_user_alice',
    'alice@meetsolis.test',
    'Alice Johnson',
    'host',
    true,
    '{"theme": "light", "language": "en", "notifications": {"email": true, "push": true}}'::jsonb
)
ON CONFLICT (clerk_id) DO NOTHING;

-- Test User 2: Co-host (Bob)
INSERT INTO users (clerk_id, email, name, role, verified_badge, preferences)
VALUES (
    'clerk_test_user_bob',
    'bob@meetsolis.test',
    'Bob Smith',
    'co-host',
    true,
    '{"theme": "dark", "language": "en", "notifications": {"email": true, "push": false}}'::jsonb
)
ON CONFLICT (clerk_id) DO NOTHING;

-- Test User 3: Participant (Charlie)
INSERT INTO users (clerk_id, email, name, role, verified_badge, preferences)
VALUES (
    'clerk_test_user_charlie',
    'charlie@meetsolis.test',
    'Charlie Davis',
    'participant',
    false,
    '{"theme": "system", "language": "en", "notifications": {"email": false, "push": false}}'::jsonb
)
ON CONFLICT (clerk_id) DO NOTHING;

-- Test User 4: Participant (Diana)
INSERT INTO users (clerk_id, email, name, role, verified_badge, preferences)
VALUES (
    'clerk_test_user_diana',
    'diana@meetsolis.test',
    'Diana Lee',
    'participant',
    false,
    '{"theme": "light", "language": "es", "notifications": {"email": true, "push": true}}'::jsonb
)
ON CONFLICT (clerk_id) DO NOTHING;

-- Test User 5: Participant (Eve)
INSERT INTO users (clerk_id, email, name, role, verified_badge, preferences)
VALUES (
    'clerk_test_user_eve',
    'eve@meetsolis.test',
    'Eve Martinez',
    'participant',
    false,
    '{"theme": "dark", "language": "fr", "notifications": {"email": false, "push": true}}'::jsonb
)
ON CONFLICT (clerk_id) DO NOTHING;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

DO $$
DECLARE
    user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users WHERE clerk_id LIKE 'clerk_test_user_%';
    RAISE NOTICE 'Seeded % test users', user_count;
END $$;

-- Display created test users
SELECT id, clerk_id, email, name, role, verified_badge
FROM users
WHERE clerk_id LIKE 'clerk_test_user_%'
ORDER BY email;
