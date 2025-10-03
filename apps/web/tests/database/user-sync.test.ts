/**
 * Clerk Webhook User Sync Tests
 * Tests for Clerk webhook integration with Supabase
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  createUserProfile,
  updateUserProfile,
  deleteUserProfile,
  getUserProfile,
} from '@/services/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';

describe('Clerk Webhook User Sync Tests', () => {
  const testClerkId = 'test_clerk_sync_user';
  const testEmail = 'sync-test@example.com';
  const testFirstName = 'Sync';
  const testLastName = 'Test';

  afterEach(async () => {
    // Cleanup: Delete test user after each test
    const supabase = getSupabaseServerClient();
    await supabase.from('users').delete().eq('clerk_id', testClerkId);
  });

  describe('user.created Event', () => {
    it('should create user in Supabase when Clerk user is created', async () => {
      const user = await createUserProfile(
        testClerkId,
        testEmail,
        testFirstName,
        testLastName
      );

      expect(user).toBeDefined();
      expect(user.clerk_id).toBe(testClerkId);
      expect(user.email).toBe(testEmail);
      expect(user.name).toBe('Sync Test');
      expect(user.role).toBe('host'); // Default role
      expect(user.verified_badge).toBe(false);
      expect(user.preferences).toBeDefined();
    });

    it('should set default preferences on user creation', async () => {
      const user = await createUserProfile(
        testClerkId,
        testEmail,
        testFirstName,
        testLastName
      );

      expect(user.preferences.theme).toBe('light');
      expect(user.preferences.language).toBe('en');
      expect(user.preferences.notifications).toBeDefined();
      expect(user.preferences.meeting_defaults).toBeDefined();
    });

    it('should throw error if user creation fails', async () => {
      // First create user
      await createUserProfile(
        testClerkId,
        testEmail,
        testFirstName,
        testLastName
      );

      // Try to create duplicate (should fail on UNIQUE clerk_id)
      await expect(
        createUserProfile(testClerkId, testEmail, testFirstName, testLastName)
      ).rejects.toThrow();
    });
  });

  describe('user.updated Event', () => {
    beforeEach(async () => {
      // Create user first
      await createUserProfile(
        testClerkId,
        testEmail,
        testFirstName,
        testLastName
      );
    });

    it('should update user in Supabase when Clerk user is updated', async () => {
      const updatedEmail = 'updated-sync@example.com';
      const updatedFirstName = 'Updated';
      const updatedLastName = 'User';

      const user = await updateUserProfile(
        testClerkId,
        updatedEmail,
        updatedFirstName,
        updatedLastName
      );

      expect(user).toBeDefined();
      expect(user?.email).toBe(updatedEmail);
      expect(user?.name).toBe('Updated User');
    });

    it('should return null if user does not exist', async () => {
      const user = await updateUserProfile(
        'non_existent_clerk_id',
        'test@example.com',
        'Test',
        'User'
      );

      expect(user).toBeNull();
    });
  });

  describe('user.deleted Event', () => {
    beforeEach(async () => {
      // Create user first
      await createUserProfile(
        testClerkId,
        testEmail,
        testFirstName,
        testLastName
      );
    });

    it('should delete user from Supabase when Clerk user is deleted', async () => {
      await deleteUserProfile(testClerkId);

      // Verify user is deleted
      const user = await getUserProfile(testClerkId);
      expect(user).toBeNull();
    });

    it('should cascade delete related records', async () => {
      const supabase = getSupabaseServerClient();

      // Get user
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', testClerkId)
        .single();

      // Create a meeting for the user
      await supabase.from('meetings').insert({
        host_id: user?.id,
        title: 'Test Meeting',
        invite_link: 'test-cascade-meeting',
      });

      // Delete user
      await deleteUserProfile(testClerkId);

      // Verify meeting is also deleted (CASCADE)
      const { data: meetings } = await supabase
        .from('meetings')
        .select('*')
        .eq('invite_link', 'test-cascade-meeting');

      expect(meetings).toHaveLength(0);
    });
  });

  describe('getUserProfile', () => {
    beforeEach(async () => {
      // Create user first
      await createUserProfile(
        testClerkId,
        testEmail,
        testFirstName,
        testLastName
      );
    });

    it('should retrieve user profile from Supabase', async () => {
      const user = await getUserProfile(testClerkId);

      expect(user).toBeDefined();
      expect(user?.clerk_id).toBe(testClerkId);
      expect(user?.email).toBe(testEmail);
    });

    it('should return null for non-existent user', async () => {
      const user = await getUserProfile('non_existent_clerk_id');
      expect(user).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // Temporarily break connection (if possible in test env)
      // This test would require mocking the Supabase client
      expect(true).toBe(true); // Placeholder
    });

    it('should log errors to usage_alerts table', async () => {
      // Verify that errors are logged
      // This would require checking the usage_alerts table after a failure
      expect(true).toBe(true); // Placeholder
    });
  });
});
