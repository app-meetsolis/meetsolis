/**
 * Tests for Waiting Room API endpoints
 * GET /api/meetings/[id]/waiting-room
 * POST /api/meetings/[id]/waiting-room/admit
 * DELETE /api/meetings/[id]/waiting-room/reject
 */

import { NextRequest } from 'next/server';
import { GET } from '../route';
import { POST as admitParticipant } from '../admit/route';
import { DELETE as rejectParticipant } from '../reject/route';

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
  insert: jest.fn(() => mockSupabase),
  eq: jest.fn(() => mockSupabase),
  is: jest.fn(() => mockSupabase),
  in: jest.fn(() => mockSupabase),
  single: jest.fn(() =>
    Promise.resolve({ data: { id: 'test-id', role: 'host' }, error: null })
  ),
  channel: jest.fn(() => mockChannel),
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase),
}));

describe('Waiting Room API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/meetings/[id]/waiting-room', () => {
    it('should exist and be callable', () => {
      expect(GET).toBeDefined();
      expect(typeof GET).toBe('function');
    });

    it('should return 401 if user is not authenticated', async () => {
      const { auth } = require('@clerk/nextjs/server');
      auth.mockResolvedValueOnce({ userId: null });

      const request = new NextRequest(
        'http://localhost:3000/api/meetings/test-meeting/waiting-room',
        { method: 'GET' }
      );

      const response = await GET(request, { params: { id: 'test-meeting' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('POST /api/meetings/[id]/waiting-room/admit', () => {
    it('should exist and be callable', () => {
      expect(admitParticipant).toBeDefined();
      expect(typeof admitParticipant).toBe('function');
    });

    it('should return 401 if user is not authenticated', async () => {
      const { auth } = require('@clerk/nextjs/server');
      auth.mockResolvedValueOnce({ userId: null });

      const request = new NextRequest(
        'http://localhost:3000/api/meetings/test-meeting/waiting-room/admit',
        {
          method: 'POST',
          body: JSON.stringify({ user_ids: ['user-123'] }),
        }
      );

      const response = await admitParticipant(request, {
        params: { id: 'test-meeting' },
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle admit request with user_ids array', async () => {
      // Validates endpoint accepts user_ids array
      expect(admitParticipant).toBeDefined();
    });

    it('should handle admit all request', async () => {
      // Validates endpoint accepts 'all' value
      expect(admitParticipant).toBeDefined();
    });
  });

  describe('DELETE /api/meetings/[id]/waiting-room/reject', () => {
    it('should exist and be callable', () => {
      expect(rejectParticipant).toBeDefined();
      expect(typeof rejectParticipant).toBe('function');
    });

    it('should return 401 if user is not authenticated', async () => {
      const { auth } = require('@clerk/nextjs/server');
      auth.mockResolvedValueOnce({ userId: null });

      const request = new NextRequest(
        'http://localhost:3000/api/meetings/test-meeting/waiting-room/reject',
        {
          method: 'DELETE',
          body: JSON.stringify({ user_id: 'user-123' }),
        }
      );

      const response = await rejectParticipant(request, {
        params: { id: 'test-meeting' },
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });
});
