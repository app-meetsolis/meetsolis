/**
 * Database Connection Tests
 * Tests for Supabase client initialization and connection
 *
 * NOTE: These are unit tests that verify client initialization.
 * For integration tests with actual database, set SUPABASE_INTEGRATION_TEST=true
 */

import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import { getSupabaseClient } from '@/lib/supabase/client';
import { getSupabaseServerClient } from '@/lib/supabase/server';

describe('Supabase Connection Tests', () => {
  beforeAll(() => {
    // Ensure environment variables are set for tests
    process.env.NEXT_PUBLIC_SUPABASE_URL =
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY =
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key';
  });

  describe('Client-side Supabase Client', () => {
    it('should create a client instance', () => {
      const client = getSupabaseClient();
      expect(client).toBeDefined();
    });

    it('should return the same instance on subsequent calls', () => {
      const client1 = getSupabaseClient();
      const client2 = getSupabaseClient();
      expect(client1).toBe(client2);
    });

    it('should have Realtime configured', () => {
      const client = getSupabaseClient();
      expect(client.realtime).toBeDefined();
    });
  });

  describe('Server-side Supabase Client', () => {
    it('should create a server client instance', () => {
      const client = getSupabaseServerClient();
      expect(client).toBeDefined();
    });

    it('should throw error if service role key is missing', () => {
      const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      expect(() => {
        getSupabaseServerClient();
      }).toThrow('SUPABASE_SERVICE_ROLE_KEY is required');

      process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
    });
  });

  describe('Environment Variable Validation', () => {
    it('should validate NEXT_PUBLIC_SUPABASE_URL', () => {
      expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined();
      expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toMatch(/^https:\/\//);
    });

    it('should validate NEXT_PUBLIC_SUPABASE_ANON_KEY', () => {
      expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined();
      expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length).toBeGreaterThan(
        0
      );
    });

    it('should validate SUPABASE_SERVICE_ROLE_KEY', () => {
      expect(process.env.SUPABASE_SERVICE_ROLE_KEY).toBeDefined();
      expect(process.env.SUPABASE_SERVICE_ROLE_KEY?.length).toBeGreaterThan(0);
    });
  });

  describe('Database Query Capability', () => {
    it('should be able to query users table', async () => {
      const client = getSupabaseServerClient();
      const { error } = await client.from('users').select('count').single();

      // Query should execute without error (even if table is empty)
      expect(error).toBeNull();
    });

    it('should be able to query meetings table', async () => {
      const client = getSupabaseServerClient();
      const { error } = await client.from('meetings').select('count').single();

      expect(error).toBeNull();
    });
  });
});
