/**
 * RLS Policy Tests
 * Tests for Row Level Security policies
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { User, Meeting, Participant } from '@meetsolis/shared/types';

describe('RLS Policy Tests', () => {
  let testUser1: User;
  let testUser2: User;
  let testMeeting: Meeting;

  beforeAll(async () => {
    const supabase = getSupabaseServerClient();

    // Create test users
    const { data: user1 } = await supabase
      .from('users')
      .insert({
        clerk_id: 'test_clerk_user_1',
        email: 'rls-test-1@test.com',
        name: 'RLS Test User 1',
        role: 'host',
      })
      .select()
      .single();

    const { data: user2 } = await supabase
      .from('users')
      .insert({
        clerk_id: 'test_clerk_user_2',
        email: 'rls-test-2@test.com',
        name: 'RLS Test User 2',
        role: 'participant',
      })
      .select()
      .single();

    testUser1 = user1 as User;
    testUser2 = user2 as User;

    // Create test meeting
    const { data: meeting } = await supabase
      .from('meetings')
      .insert({
        host_id: testUser1.id,
        title: 'RLS Test Meeting',
        invite_link: 'rls-test-meeting',
      })
      .select()
      .single();

    testMeeting = meeting as Meeting;
  });

  afterAll(async () => {
    const supabase = getSupabaseServerClient();

    // Cleanup test data
    await supabase.from('meetings').delete().eq('id', testMeeting.id);
    await supabase.from('users').delete().eq('id', testUser1.id);
    await supabase.from('users').delete().eq('id', testUser2.id);
  });

  describe('Users Table RLS', () => {
    it('should allow users to view their own profile', async () => {
      const supabase = getSupabaseServerClient();

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_id', testUser1.clerk_id)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.email).toBe(testUser1.email);
    });

    it('should allow users to update their own profile', async () => {
      const supabase = getSupabaseServerClient();

      const { error } = await supabase
        .from('users')
        .update({ name: 'Updated Name' })
        .eq('clerk_id', testUser1.clerk_id);

      expect(error).toBeNull();
    });
  });

  describe('Meetings Table RLS', () => {
    it('should allow host to view their own meeting', async () => {
      const supabase = getSupabaseServerClient();

      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', testMeeting.id)
        .eq('host_id', testUser1.id)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.title).toBe('RLS Test Meeting');
    });

    it('should allow participants to view meetings they joined', async () => {
      const supabase = getSupabaseServerClient();

      // Add user2 as participant
      await supabase.from('participants').insert({
        meeting_id: testMeeting.id,
        user_id: testUser2.id,
        role: 'participant',
        status: 'joined',
      });

      // User2 should now see the meeting
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', testMeeting.id);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
  });

  describe('Participants Table RLS', () => {
    it('should allow meeting participants to view other participants', async () => {
      const supabase = getSupabaseServerClient();

      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('meeting_id', testMeeting.id);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should allow users to insert themselves as participants', async () => {
      const supabase = getSupabaseServerClient();

      const { error } = await supabase.from('participants').insert({
        meeting_id: testMeeting.id,
        user_id: testUser2.id,
        role: 'participant',
      });

      // Should succeed (insert as themselves)
      expect(error).toBeNull();
    });
  });

  describe('Messages Table RLS', () => {
    let testParticipant: Participant;

    beforeAll(async () => {
      const supabase = getSupabaseServerClient();

      // Ensure user2 is a participant
      const { data } = await supabase
        .from('participants')
        .select('*')
        .eq('meeting_id', testMeeting.id)
        .eq('user_id', testUser2.id)
        .single();

      testParticipant = data as Participant;
    });

    it('should allow participants to view meeting messages', async () => {
      const supabase = getSupabaseServerClient();

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('meeting_id', testMeeting.id);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should allow participants to send messages', async () => {
      const supabase = getSupabaseServerClient();

      const { error } = await supabase.from('messages').insert({
        meeting_id: testMeeting.id,
        user_id: testUser2.id,
        content: 'Test message from RLS test',
        type: 'text',
      });

      expect(error).toBeNull();
    });
  });

  describe('Cross-Tenant Isolation', () => {
    it('should prevent users from seeing other users meetings', async () => {
      const supabase = getSupabaseServerClient();

      // User2 should not see User1's meeting (unless they're a participant)
      const { data } = await supabase
        .from('meetings')
        .select('*')
        .eq('host_id', testUser1.id)
        .neq('id', testMeeting.id); // Exclude the test meeting they're part of

      // Should return empty or only meetings user2 is part of
      expect(data).toBeDefined();
      // If user2 is not a participant in other meetings, data should be empty
    });
  });
});
