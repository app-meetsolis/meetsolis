-- Migration: 006_add_onboarding_last_step.sql
-- Description: Add onboarding_last_step column for resume tracking
-- Author: Dev Agent (James)
-- Date: 2025-11-13
-- Story: 1.9 - Onboarding Completion Enforcement & Optimization

-- =============================================================================
-- ADD ONBOARDING LAST STEP COLUMN
-- =============================================================================

-- Add onboarding_last_step column (track which step user was on for resume functionality)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS onboarding_last_step VARCHAR(50);

-- =============================================================================
-- ADD INDEX FOR PERFORMANCE
-- =============================================================================

-- Index for querying users by their last onboarding step
CREATE INDEX IF NOT EXISTS idx_users_onboarding_last_step ON users(onboarding_last_step);

-- =============================================================================
-- UPDATE RLS POLICIES
-- =============================================================================

-- Check and create RLS policies if they don't exist
DO $$
BEGIN
    -- Check if the SELECT policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'users'
        AND policyname = 'Users can view own onboarding status'
    ) THEN
        CREATE POLICY "Users can view own onboarding status"
        ON users FOR SELECT
        TO authenticated
        USING (auth.uid()::text = clerk_id);

        RAISE NOTICE 'Created SELECT policy for onboarding status';
    ELSE
        RAISE NOTICE 'SELECT policy already exists';
    END IF;

    -- Check if the UPDATE policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'users'
        AND policyname = 'Users can update own onboarding status'
    ) THEN
        CREATE POLICY "Users can update own onboarding status"
        ON users FOR UPDATE
        TO authenticated
        USING (auth.uid()::text = clerk_id)
        WITH CHECK (auth.uid()::text = clerk_id);

        RAISE NOTICE 'Created UPDATE policy for onboarding status';
    ELSE
        RAISE NOTICE 'UPDATE policy already exists';
    END IF;
END $$;

-- =============================================================================
-- ADD COMMENTS FOR DOCUMENTATION
-- =============================================================================

COMMENT ON COLUMN users.onboarding_last_step IS 'Last onboarding step the user was on (welcome, permissions, profile, first-meeting, complete)';

-- =============================================================================
-- CREATE DATABASE QUERY PERFORMANCE TESTS
-- =============================================================================

-- Test query performance for onboarding status check
DO $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    elapsed_ms NUMERIC;
BEGIN
    -- Test SELECT query performance
    start_time := clock_timestamp();
    PERFORM onboarding_completed, onboarding_completed_at, onboarding_last_step
    FROM users
    WHERE clerk_id = 'test_user_id'
    LIMIT 1;
    end_time := clock_timestamp();

    elapsed_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;

    RAISE NOTICE 'Query performance test - SELECT onboarding status: % ms', elapsed_ms;

    IF elapsed_ms < 50 THEN
        RAISE NOTICE 'Performance: PASS (< 50ms requirement)';
    ELSE
        RAISE WARNING 'Performance: May need optimization (> 50ms)';
    END IF;
END $$;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Migration 006_add_onboarding_last_step.sql completed successfully';
    RAISE NOTICE 'Added column: onboarding_last_step';
    RAISE NOTICE 'Created index for onboarding_last_step';
    RAISE NOTICE 'Verified RLS policies cover onboarding fields';
END $$;
