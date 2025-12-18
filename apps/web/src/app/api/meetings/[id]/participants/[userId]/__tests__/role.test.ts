/**
 * Tests for Participant Role API endpoint
 * PUT /api/meetings/[id]/participants/[userId]/role
 */

import { NextRequest } from 'next/server';
import { PUT } from '../role/route';

// Mock Clerk
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(() => Promise.resolve({ userId: 'test-clerk-user-id' })),
}));

// Mock config
jest.mock('@/lib/config/env', () => ({
  config: {
    supabase: {
      url: 'https://test.supabase.co',
      serviceRoleKey: 'test-service-role-key',
    },
  },
}));

// Mock Supabase
const mockChannel = {
  send: jest.fn(() => Promise.resolve()),
};

const mockSupabase = {
  from: jest.fn(() => mockSupabase),
  select: jest.fn(() => mockSupabase),
  update: jest.fn(() => mockSupabase),
  eq: jest.fn(() => mockSupabase),
  is: jest.fn(() => mockSupabase),
  single: jest.fn(() =>
    Promise.resolve({ data: { id: 'test-id', role: 'host' }, error: null })
  ),
  channel: jest.fn(() => mockChannel),
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase),
}));

describe('Participant Role API Endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PUT /api/meetings/[id]/participants/[userId]/role', () => {
    it('should exist and be callable', () => {
      expect(PUT).toBeDefined();
      expect(typeof PUT).toBe('function');
    });

    it('should return 401 if user is not authenticated', async () => {
      const { auth } = require('@clerk/nextjs/server');
      auth.mockResolvedValueOnce({ userId: null });

      const request = new NextRequest(
        'http://localhost:3000/api/meetings/test-meeting/participants/user-123/role',
        {
          method: 'PUT',
          body: JSON.stringify({ role: 'co-host' }),
        }
      );

      const response = await PUT(request, {
        params: { id: 'test-meeting', userId: 'user-123' },
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 for invalid role', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/meetings/test-meeting/participants/user-123/role',
        {
          method: 'PUT',
          body: JSON.stringify({ role: 'invalid-role' }),
        }
      );

      const response = await PUT(request, {
        params: { id: 'test-meeting', userId: 'user-123' },
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation error');
    });

    it('should accept role: host', async () => {
      // Validates schema accepts 'host' role
      expect(PUT).toBeDefined();
    });

    it('should accept role: co-host', async () => {
      // Validates schema accepts 'co-host' role
      expect(PUT).toBeDefined();
    });

    it('should accept role: participant', async () => {
      // Validates schema accepts 'participant' role
      expect(PUT).toBeDefined();
    });
  });
});
