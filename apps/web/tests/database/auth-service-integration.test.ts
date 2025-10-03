/**
 * Authentication Service Tests
 * Tests for authentication service layer functions
 */

import {
  createUserProfile,
  updateUserProfile,
  deleteUserProfile,
  getUserProfile,
} from '@/services/auth';

describe('Authentication Service', () => {
  describe('createUserProfile', () => {
    it('should create user profile with correct data', async () => {
      const user = await createUserProfile(
        'user_123',
        'test@example.com',
        'John',
        'Doe'
      );

      expect(user).toMatchObject({
        id: 'user_123',
        email: 'test@example.com',
        name: 'John Doe',
        role: 'participant',
        verified_badge: false,
        preferences: {
          auto_mute_on_join: false,
          default_video_off: false,
          preferred_view: 'gallery',
          theme: 'light',
        },
      });
      expect(user.created_at).toBeDefined();
      expect(user.updated_at).toBeDefined();
    });

    it('should handle user without names', async () => {
      const user = await createUserProfile(
        'user_456',
        'noname@example.com',
        '',
        ''
      );

      expect(user.name).toBe('User');
    });

    it('should assign default participant role', async () => {
      const user = await createUserProfile(
        'user_789',
        'test@example.com',
        'Jane',
        'Smith'
      );

      expect(user.role).toBe('participant');
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile with new data', async () => {
      const user = await updateUserProfile(
        'user_123',
        'updated@example.com',
        'Jane',
        'Updated'
      );

      expect(user).toMatchObject({
        id: 'user_123',
        email: 'updated@example.com',
        name: 'Jane Updated',
      });
    });

    it('should handle empty names', async () => {
      const user = await updateUserProfile(
        'user_456',
        'test@example.com',
        '',
        ''
      );

      expect(user?.name).toBe('User');
    });
  });

  describe('deleteUserProfile', () => {
    it('should not throw error when deleting user', async () => {
      await expect(deleteUserProfile('user_123')).resolves.not.toThrow();
    });
  });

  describe('getUserProfile', () => {
    it('should return null when database is not ready', async () => {
      const user = await getUserProfile('user_123');
      expect(user).toBeNull();
    });
  });
});
