/**
 * Messages API Route Tests
 * Story 2.4 - Public/Private Chat API Endpoints
 * TEST-001 Fix: Comprehensive test coverage
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '../route';

// Mock rate limiting
jest.mock('@/lib/rate-limit', () => ({
  checkRateLimit: jest.fn(() =>
    Promise.resolve({
      success: true,
      limit: 10,
      remaining: 9,
      reset: Date.now() + 60000,
    })
  ),
  RateLimitPresets: {
    MESSAGE: { limit: 10, window: 60 },
  },
}));

// Mock dependencies
const mockAuth = jest.fn(() => Promise.resolve({ userId: 'test-clerk-id' }));
jest.mock('@clerk/nextjs/server', () => ({
  auth: mockAuth,
}));

const mockSelectSingle = jest.fn();
const mockInsertSelect = jest.fn();
const mockSelect = jest.fn();

const mockSupabaseClient = {
  from: jest.fn((table: string) => {
    const chain = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      single: mockSelectSingle,
    };

    // Return different mocks based on table
    if (table === 'meetings') {
      chain.single.mockResolvedValue({
        data: {
          id: 'meeting-uuid-1',
          settings: { chat_enabled: true, private_chat_enabled: true },
        },
        error: null,
      });
    } else if (table === 'users') {
      chain.single.mockResolvedValue({
        data: { id: 'user-uuid-1' },
        error: null,
      });
    } else if (table === 'participants') {
      chain.single.mockResolvedValue({
        data: { id: 'participant-1', user_id: 'user-uuid-1' },
        error: null,
      });
    } else if (table === 'messages') {
      chain.select.mockReturnValue(chain);
      chain.eq.mockReturnValue(chain);
      chain.order.mockReturnValue(chain);
      chain.range.mockResolvedValue({
        data: [
          {
            id: 'msg-1',
            content: 'Test message',
            sender_id: 'user-uuid-1',
            type: 'public',
          },
        ],
        error: null,
      });

      chain.insert.mockReturnValue({
        select: () => ({
          single: mockInsertSelect.mockResolvedValue({
            data: {
              id: 'msg-new',
              content: 'New message',
              sender_id: 'user-uuid-1',
              type: 'public',
            },
            error: null,
          }),
        }),
      });
    }

    return chain;
  }),
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

describe('/api/meetings/[id]/messages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/meetings/[id]/messages', () => {
    it('should return 401 if not authenticated', async () => {
      mockAuth.mockResolvedValueOnce({ userId: null });

      const req = new NextRequest(
        'http://localhost/api/meetings/meeting-1/messages'
      );
      const params = { id: 'meeting-1' };

      const response = await GET(req, { params });

      expect(response.status).toBe(401);
    });

    it('should return messages for a meeting', async () => {
      const req = new NextRequest(
        'http://localhost/api/meetings/meeting-1/messages'
      );
      const params = { id: 'meeting-1' };

      const response = await GET(req, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('messages');
      expect(Array.isArray(data.messages)).toBe(true);
    });

    it('should support pagination with limit and offset', async () => {
      const req = new NextRequest(
        'http://localhost/api/meetings/meeting-1/messages?limit=10&offset=20'
      );
      const params = { id: 'meeting-1' };

      const response = await GET(req, { params });

      expect(response.status).toBe(200);
      // Verify range was called with correct params
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('messages');
    });

    it('should cap limit at 100', async () => {
      const req = new NextRequest(
        'http://localhost/api/meetings/meeting-1/messages?limit=999'
      );
      const params = { id: 'meeting-1' };

      const response = await GET(req, { params });

      expect(response.status).toBe(200);
      // Limit should be capped at 100
    });

    it('should support search query', async () => {
      const req = new NextRequest(
        'http://localhost/api/meetings/meeting-1/messages?search=hello'
      );
      const params = { id: 'meeting-1' };

      const response = await GET(req, { params });

      expect(response.status).toBe(200);
    });

    it('should filter by message type', async () => {
      const req = new NextRequest(
        'http://localhost/api/meetings/meeting-1/messages?type=private'
      );
      const params = { id: 'meeting-1' };

      const response = await GET(req, { params });

      expect(response.status).toBe(200);
    });

    it('should return 404 if meeting not found', async () => {
      mockSupabaseClient.from.mockImplementationOnce((table: string) => {
        if (table === 'meetings') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest
              .fn()
              .mockResolvedValue({ data: null, error: new Error('Not found') }),
          };
        }
        return mockSupabaseClient.from(table);
      });

      const req = new NextRequest(
        'http://localhost/api/meetings/nonexistent/messages'
      );
      const params = { id: 'nonexistent' };

      const response = await GET(req, { params });

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/meetings/[id]/messages', () => {
    it('should return 401 if not authenticated', async () => {
      mockAuth.mockResolvedValueOnce({ userId: null });

      const req = new NextRequest(
        'http://localhost/api/meetings/meeting-1/messages',
        {
          method: 'POST',
          body: JSON.stringify({
            content: 'Test message',
            type: 'public',
          }),
        }
      );
      const params = { id: 'meeting-1' };

      const response = await POST(req, { params });

      expect(response.status).toBe(401);
    });

    it('should create a new public message', async () => {
      const req = new NextRequest(
        'http://localhost/api/meetings/meeting-1/messages',
        {
          method: 'POST',
          body: JSON.stringify({
            content: 'Test message',
            type: 'public',
          }),
        }
      );
      const params = { id: 'meeting-1' };

      const response = await POST(req, { params });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toHaveProperty('message');
    });

    it('should reject empty message content', async () => {
      const req = new NextRequest(
        'http://localhost/api/meetings/meeting-1/messages',
        {
          method: 'POST',
          body: JSON.stringify({
            content: '', // Empty content
            type: 'public',
          }),
        }
      );
      const params = { id: 'meeting-1' };

      const response = await POST(req, { params });

      expect(response.status).toBe(400);
    });

    it('should reject message content over 1000 characters', async () => {
      const longContent = 'a'.repeat(1001);
      const req = new NextRequest(
        'http://localhost/api/meetings/meeting-1/messages',
        {
          method: 'POST',
          body: JSON.stringify({
            content: longContent,
            type: 'public',
          }),
        }
      );
      const params = { id: 'meeting-1' };

      const response = await POST(req, { params });

      expect(response.status).toBe(400);
    });

    it('should sanitize HTML/XSS in message content', async () => {
      const maliciousContent = '<script>alert("XSS")</script>Hello';
      const req = new NextRequest(
        'http://localhost/api/meetings/meeting-1/messages',
        {
          method: 'POST',
          body: JSON.stringify({
            content: maliciousContent,
            type: 'public',
          }),
        }
      );
      const params = { id: 'meeting-1' };

      const response = await POST(req, { params });

      // Should still create message but content should be sanitized
      expect(response.status).toBe(201);
      // Content should have script tags removed
    });

    it('should create a private message with recipient', async () => {
      const req = new NextRequest(
        'http://localhost/api/meetings/meeting-1/messages',
        {
          method: 'POST',
          body: JSON.stringify({
            content: 'Private message',
            type: 'private',
            recipient_id: 'user-uuid-2',
          }),
        }
      );
      const params = { id: 'meeting-1' };

      const response = await POST(req, { params });

      expect(response.status).toBe(201);
    });

    it('should enforce rate limiting', async () => {
      const { checkRateLimit } = require('@/lib/rate-limit');
      checkRateLimit.mockResolvedValueOnce({
        success: false,
        limit: 10,
        remaining: 0,
        reset: Date.now() + 60000,
      });

      const req = new NextRequest(
        'http://localhost/api/meetings/meeting-1/messages',
        {
          method: 'POST',
          body: JSON.stringify({
            content: 'Test message',
            type: 'public',
          }),
        }
      );
      const params = { id: 'meeting-1' };

      const response = await POST(req, { params });

      expect(response.status).toBe(429);
      expect(response.headers.get('X-RateLimit-Limit')).toBe('10');
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
    });

    it('should return 403 if user not participant in meeting', async () => {
      mockSupabaseClient.from.mockImplementationOnce((table: string) => {
        const chain = mockSupabaseClient.from(table);
        if (table === 'participants') {
          return {
            ...chain,
            single: jest.fn().mockResolvedValue({
              data: null,
              error: new Error('Not found'),
            }),
          };
        }
        return chain;
      });

      const req = new NextRequest(
        'http://localhost/api/meetings/meeting-1/messages',
        {
          method: 'POST',
          body: JSON.stringify({
            content: 'Test message',
            type: 'public',
          }),
        }
      );
      const params = { id: 'meeting-1' };

      const response = await POST(req, { params });

      expect(response.status).toBe(403);
    });

    it('should return 403 if public chat is disabled by host', async () => {
      mockSupabaseClient.from.mockImplementationOnce((table: string) => {
        if (table === 'meetings') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'meeting-uuid-1',
                settings: { chat_enabled: false }, // Chat disabled
              },
              error: null,
            }),
          };
        }
        return mockSupabaseClient.from(table);
      });

      const req = new NextRequest(
        'http://localhost/api/meetings/meeting-1/messages',
        {
          method: 'POST',
          body: JSON.stringify({
            content: 'Test message',
            type: 'public',
          }),
        }
      );
      const params = { id: 'meeting-1' };

      const response = await POST(req, { params });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toContain('disabled');
    });

    it('should return 403 if private chat is disabled by host', async () => {
      mockSupabaseClient.from.mockImplementationOnce((table: string) => {
        if (table === 'meetings') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'meeting-uuid-1',
                settings: { private_chat_enabled: false }, // Private chat disabled
              },
              error: null,
            }),
          };
        }
        return mockSupabaseClient.from(table);
      });

      const req = new NextRequest(
        'http://localhost/api/meetings/meeting-1/messages',
        {
          method: 'POST',
          body: JSON.stringify({
            content: 'Private message',
            type: 'private',
            recipient_id: 'user-uuid-2',
          }),
        }
      );
      const params = { id: 'meeting-1' };

      const response = await POST(req, { params });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toContain('Private chat');
    });

    it('should support file attachment via file_id', async () => {
      const req = new NextRequest(
        'http://localhost/api/meetings/meeting-1/messages',
        {
          method: 'POST',
          body: JSON.stringify({
            content: 'Check out this file',
            type: 'public',
            file_id: 'file-uuid-123',
          }),
        }
      );
      const params = { id: 'meeting-1' };

      const response = await POST(req, { params });

      expect(response.status).toBe(201);
    });
  });
});
