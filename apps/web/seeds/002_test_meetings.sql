-- Seed: 002_test_meetings.sql
-- Description: Create test meetings and participants for development and testing
-- Author: Dev Agent
-- Date: 2025-10-01
-- Usage: psql -h db.project.supabase.co -U postgres -d postgres < seeds/002_test_meetings.sql

-- =============================================================================
-- HELPER: GET USER IDS
-- =============================================================================

DO $$
DECLARE
    alice_id UUID;
    bob_id UUID;
    charlie_id UUID;
    diana_id UUID;
    eve_id UUID;
    meeting1_id UUID;
    meeting2_id UUID;
    meeting3_id UUID;
BEGIN
    -- Get user IDs
    SELECT id INTO alice_id FROM users WHERE clerk_id = 'clerk_test_user_alice';
    SELECT id INTO bob_id FROM users WHERE clerk_id = 'clerk_test_user_bob';
    SELECT id INTO charlie_id FROM users WHERE clerk_id = 'clerk_test_user_charlie';
    SELECT id INTO diana_id FROM users WHERE clerk_id = 'clerk_test_user_diana';
    SELECT id INTO eve_id FROM users WHERE clerk_id = 'clerk_test_user_eve';

    -- =============================================================================
    -- TEST MEETING 1: Scheduled meeting
    -- =============================================================================
    INSERT INTO meetings (
        host_id,
        title,
        description,
        status,
        settings,
        invite_link,
        waiting_room_enabled,
        locked,
        max_participants
    ) VALUES (
        alice_id,
        'Weekly Team Standup',
        'Regular team sync to discuss progress and blockers',
        'scheduled',
        '{"allow_screen_share": true, "allow_recording": true, "allow_chat": true, "allow_reactions": true, "max_participants": 20}'::jsonb,
        'team-standup',
        true,
        false,
        20
    )
    ON CONFLICT (invite_link) DO NOTHING
    RETURNING id INTO meeting1_id;

    -- Add participants to meeting 1
    INSERT INTO participants (meeting_id, user_id, role, permissions, status)
    VALUES
        (meeting1_id, alice_id, 'host', '{"can_share_screen": true, "can_record": true, "can_mute_others": true}'::jsonb, 'waiting'),
        (meeting1_id, bob_id, 'co-host', '{"can_share_screen": true, "can_record": false, "can_mute_others": true}'::jsonb, 'waiting'),
        (meeting1_id, charlie_id, 'participant', '{"can_share_screen": false, "can_record": false, "can_mute_others": false}'::jsonb, 'waiting')
    ON CONFLICT (meeting_id, user_id) DO NOTHING;

    -- =============================================================================
    -- TEST MEETING 2: Active meeting
    -- =============================================================================
    INSERT INTO meetings (
        host_id,
        title,
        description,
        status,
        settings,
        invite_link,
        waiting_room_enabled,
        locked,
        max_participants,
        started_at
    ) VALUES (
        bob_id,
        'Product Demo Session',
        'Demonstrating new features to the team',
        'active',
        '{"allow_screen_share": true, "allow_recording": false, "allow_chat": true, "allow_reactions": true, "max_participants": 50}'::jsonb,
        'product-demo',
        false,
        false,
        50,
        NOW() - INTERVAL '30 minutes'
    )
    ON CONFLICT (invite_link) DO NOTHING
    RETURNING id INTO meeting2_id;

    -- Add participants to meeting 2
    INSERT INTO participants (meeting_id, user_id, role, permissions, status, joined_at)
    VALUES
        (meeting2_id, bob_id, 'host', '{"can_share_screen": true, "can_record": true, "can_mute_others": true}'::jsonb, 'joined', NOW() - INTERVAL '30 minutes'),
        (meeting2_id, alice_id, 'co-host', '{"can_share_screen": true, "can_record": false, "can_mute_others": true}'::jsonb, 'joined', NOW() - INTERVAL '25 minutes'),
        (meeting2_id, charlie_id, 'participant', '{"can_share_screen": false, "can_record": false, "can_mute_others": false}'::jsonb, 'joined', NOW() - INTERVAL '20 minutes'),
        (meeting2_id, diana_id, 'participant', '{"can_share_screen": false, "can_record": false, "can_mute_others": false}'::jsonb, 'joined', NOW() - INTERVAL '15 minutes')
    ON CONFLICT (meeting_id, user_id) DO NOTHING;

    -- Add messages to active meeting
    INSERT INTO messages (meeting_id, user_id, content, type, metadata)
    VALUES
        (meeting2_id, bob_id, 'Welcome everyone to the product demo!', 'text', '{}'::jsonb),
        (meeting2_id, alice_id, 'Excited to see the new features 🚀', 'text', '{}'::jsonb),
        (meeting2_id, charlie_id, 'Can you share your screen?', 'text', '{}'::jsonb),
        (meeting2_id, bob_id, 'Sure, sharing now...', 'text', '{}'::jsonb)
    ON CONFLICT DO NOTHING;

    -- Add reactions to active meeting
    INSERT INTO reactions (meeting_id, user_id, emoji)
    VALUES
        (meeting2_id, alice_id, '👍'),
        (meeting2_id, charlie_id, '👏'),
        (meeting2_id, diana_id, '❤️')
    ON CONFLICT DO NOTHING;

    -- =============================================================================
    -- TEST MEETING 3: Ended meeting with summary
    -- =============================================================================
    INSERT INTO meetings (
        host_id,
        title,
        description,
        status,
        settings,
        invite_link,
        waiting_room_enabled,
        locked,
        max_participants,
        started_at,
        ended_at
    ) VALUES (
        alice_id,
        'Q1 Planning Meeting',
        'Quarterly planning session for Q1 goals',
        'ended',
        '{"allow_screen_share": true, "allow_recording": true, "allow_chat": true, "allow_reactions": true, "max_participants": 30}'::jsonb,
        'q1-planning',
        true,
        true,
        30,
        NOW() - INTERVAL '2 days' - INTERVAL '1 hour',
        NOW() - INTERVAL '2 days'
    )
    ON CONFLICT (invite_link) DO NOTHING
    RETURNING id INTO meeting3_id;

    -- Add participants to meeting 3
    INSERT INTO participants (meeting_id, user_id, role, permissions, status, joined_at, left_at)
    VALUES
        (meeting3_id, alice_id, 'host', '{"can_share_screen": true, "can_record": true, "can_mute_others": true}'::jsonb, 'left', NOW() - INTERVAL '2 days' - INTERVAL '1 hour', NOW() - INTERVAL '2 days'),
        (meeting3_id, bob_id, 'co-host', '{"can_share_screen": true, "can_record": false, "can_mute_others": true}'::jsonb, 'left', NOW() - INTERVAL '2 days' - INTERVAL '55 minutes', NOW() - INTERVAL '2 days'),
        (meeting3_id, eve_id, 'participant', '{"can_share_screen": false, "can_record": false, "can_mute_others": false}'::jsonb, 'left', NOW() - INTERVAL '2 days' - INTERVAL '50 minutes', NOW() - INTERVAL '2 days')
    ON CONFLICT (meeting_id, user_id) DO NOTHING;

    -- Add meeting summary
    INSERT INTO meeting_summaries (
        meeting_id,
        summary,
        key_points,
        action_items,
        ai_model
    ) VALUES (
        meeting3_id,
        'Productive Q1 planning session where the team aligned on goals and priorities for the upcoming quarter.',
        '["Set Q1 revenue target at $500K", "Prioritize feature X for launch", "Hire 2 engineers by end of Q1", "Improve customer onboarding process"]'::jsonb,
        '[
            {"description": "Finalize Q1 roadmap", "assigned_to": "Alice", "due_date": "2025-10-05", "completed": false},
            {"description": "Review hiring pipeline", "assigned_to": "Bob", "due_date": "2025-10-10", "completed": false},
            {"description": "Schedule customer feedback sessions", "assigned_to": "Eve", "due_date": "2025-10-08", "completed": false}
        ]'::jsonb,
        'gpt-4'
    )
    ON CONFLICT DO NOTHING;

    -- =============================================================================
    -- VERIFICATION
    -- =============================================================================
    RAISE NOTICE 'Seeded test meetings:';
    RAISE NOTICE '1. Weekly Team Standup (scheduled) - Host: Alice';
    RAISE NOTICE '2. Product Demo Session (active) - Host: Bob';
    RAISE NOTICE '3. Q1 Planning Meeting (ended with summary) - Host: Alice';
END $$;

-- Display created test meetings
SELECT
    m.id,
    m.title,
    m.status,
    m.invite_link,
    u.name as host_name,
    (SELECT COUNT(*) FROM participants WHERE meeting_id = m.id) as participant_count
FROM meetings m
JOIN users u ON u.id = m.host_id
WHERE m.invite_link IN ('team-standup', 'product-demo', 'q1-planning')
ORDER BY m.created_at;
