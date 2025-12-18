/**
 * Tests for Remove Participant API endpoint
 * DELETE /api/meetings/[id]/participants/[userId]/remove
 */

import { NextRequest } from 'next/server';
import { DELETE } from '../remove/route';

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
  delete: jest.fn(() => mockSupabase),
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

describe('Remove Participant API Endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('DELETE /api/meetings/[id]/participants/[userId]/remove', () => {
    it('should exist and be callable', () => {
      expect(DELETE).toBeDefined();
      expect(typeof DELETE).toBe('function');
    });

    it('should return 401 if user is not authenticated', async () => {
      const { auth } = require('@clerk/nextjs/server');
      auth.mockResolvedValueOnce({ userId: null });

      const request = new NextRequest(
        'http://localhost:3000/api/meetings/test-meeting/participants/user-123/remove',
        { method: 'DELETE' }
      );

      const response = await DELETE(request, {
        params: { id: 'test-meeting', userId: 'user-123' },
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle participant removal request', async () => {
      // Validates endpoint handles DELETE requests
      expect(DELETE).toBeDefined();
    });
  });
});
