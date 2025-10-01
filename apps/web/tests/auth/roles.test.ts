/**
 * Role Utilities Tests
 * Tests for role-based access control functions
 */

import {
  hasRolePermission,
  isValidRole,
  getDefaultRole,
  isHost,
  isCoHostOrHigher,
  getRoleDisplayName,
} from '@/lib/auth/roles';

describe('Role Utilities', () => {
  describe('hasRolePermission', () => {
    it('should grant permission when user role equals required role', () => {
      expect(hasRolePermission('host', 'host')).toBe(true);
      expect(hasRolePermission('co-host', 'co-host')).toBe(true);
      expect(hasRolePermission('participant', 'participant')).toBe(true);
    });

    it('should grant permission when user role is higher than required', () => {
      expect(hasRolePermission('host', 'co-host')).toBe(true);
      expect(hasRolePermission('host', 'participant')).toBe(true);
      expect(hasRolePermission('co-host', 'participant')).toBe(true);
    });

    it('should deny permission when user role is lower than required', () => {
      expect(hasRolePermission('participant', 'co-host')).toBe(false);
      expect(hasRolePermission('participant', 'host')).toBe(false);
      expect(hasRolePermission('co-host', 'host')).toBe(false);
    });
  });

  describe('isValidRole', () => {
    it('should return true for valid roles', () => {
      expect(isValidRole('host')).toBe(true);
      expect(isValidRole('co-host')).toBe(true);
      expect(isValidRole('participant')).toBe(true);
    });

    it('should return false for invalid roles', () => {
      expect(isValidRole('admin')).toBe(false);
      expect(isValidRole('moderator')).toBe(false);
      expect(isValidRole('')).toBe(false);
      expect(isValidRole('HOST')).toBe(false);
    });
  });

  describe('getDefaultRole', () => {
    it('should return participant as default role', () => {
      expect(getDefaultRole()).toBe('participant');
    });
  });

  describe('isHost', () => {
    it('should return true only for host role', () => {
      expect(isHost('host')).toBe(true);
      expect(isHost('co-host')).toBe(false);
      expect(isHost('participant')).toBe(false);
    });
  });

  describe('isCoHostOrHigher', () => {
    it('should return true for co-host and host', () => {
      expect(isCoHostOrHigher('host')).toBe(true);
      expect(isCoHostOrHigher('co-host')).toBe(true);
    });

    it('should return false for participant', () => {
      expect(isCoHostOrHigher('participant')).toBe(false);
    });
  });

  describe('getRoleDisplayName', () => {
    it('should return proper display names', () => {
      expect(getRoleDisplayName('host')).toBe('Host');
      expect(getRoleDisplayName('co-host')).toBe('Co-Host');
      expect(getRoleDisplayName('participant')).toBe('Participant');
    });
  });
});
