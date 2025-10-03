/**
 * Database Utilities Tests
 * Tests for database utility functions
 */

import { describe, it, expect } from '@jest/globals';
import {
  handleSupabaseError,
  executeQuery,
  generateInviteLink,
  calculateFileExpiration,
  isFileExpired,
} from '@/lib/supabase/utils';
import { getSupabaseServerClient } from '@/lib/supabase/server';

describe('Database Utilities Tests', () => {
  describe('handleSupabaseError', () => {
    it('should return user-friendly message for duplicate key error', () => {
      const error = { code: '23505', message: 'duplicate key value' } as any;
      const message = handleSupabaseError(error);
      expect(message).toBe('A record with this information already exists');
    });

    it('should return user-friendly message for foreign key violation', () => {
      const error = { code: '23503', message: 'foreign key violation' } as any;
      const message = handleSupabaseError(error);
      expect(message).toBe('Referenced record does not exist');
    });

    it('should return error message for unknown error codes', () => {
      const error = { code: 'UNKNOWN', message: 'Unknown error' } as any;
      const message = handleSupabaseError(error);
      expect(message).toBe('Unknown error');
    });

    it('should return default message for null error', () => {
      const message = handleSupabaseError(null);
      expect(message).toBe('Unknown database error');
    });
  });

  describe('executeQuery', () => {
    it('should return success result for valid query', async () => {
      const supabase = getSupabaseServerClient();
      const result = await executeQuery(supabase.from('users').select('count'));

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
      }
    });

    it('should return error result for invalid query', async () => {
      const supabase = getSupabaseServerClient();
      const result = await executeQuery(
        supabase.from('non_existent_table').select('*')
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it('should handle null data as error', async () => {
      const supabase = getSupabaseServerClient();
      const result = await executeQuery(
        supabase.from('users').select('*').eq('id', 'non-existent-id').single()
      );

      expect(result.success).toBe(false);
    });
  });

  describe('generateInviteLink', () => {
    it('should generate a 10-character invite link', () => {
      const link = generateInviteLink();
      expect(link).toHaveLength(10);
    });

    it('should only contain lowercase letters and numbers', () => {
      const link = generateInviteLink();
      expect(link).toMatch(/^[a-z0-9]+$/);
    });

    it('should generate unique links', () => {
      const link1 = generateInviteLink();
      const link2 = generateInviteLink();
      // High probability of being different
      expect(link1).not.toBe(link2);
    });

    it('should generate multiple unique links', () => {
      const links = new Set<string>();
      for (let i = 0; i < 100; i++) {
        links.add(generateInviteLink());
      }
      // Should have close to 100 unique links
      expect(links.size).toBeGreaterThan(95);
    });
  });

  describe('calculateFileExpiration', () => {
    it('should return a date 7 days from now', () => {
      const now = new Date();
      const expiration = calculateFileExpiration();
      const diffInDays = Math.floor(
        (expiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      expect(diffInDays).toBe(7);
    });

    it('should return a future date', () => {
      const now = new Date();
      const expiration = calculateFileExpiration();
      expect(expiration.getTime()).toBeGreaterThan(now.getTime());
    });
  });

  describe('isFileExpired', () => {
    it('should return true for past date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      expect(isFileExpired(pastDate)).toBe(true);
    });

    it('should return false for future date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      expect(isFileExpired(futureDate)).toBe(false);
    });

    it('should handle string dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      expect(isFileExpired(pastDate.toISOString())).toBe(true);
    });

    it('should return false for date exactly 7 days from now', () => {
      const futureDate = calculateFileExpiration();
      expect(isFileExpired(futureDate)).toBe(false);
    });
  });
});
