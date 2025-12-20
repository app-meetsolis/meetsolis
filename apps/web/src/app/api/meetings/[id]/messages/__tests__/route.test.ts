/**
 * Messages API Route Tests
 * Story 2.4 - Public/Private Chat API Endpoints
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '../route';

// Mock dependencies
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(() => Promise.resolve({ userId: 'test-user-123' })),
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      single: jest.fn(() =>
        Promise.resolve({ data: { id: 'user-1' }, error: null })
      ),
    })),
  })),
}));

describe('/api/meetings/[id]/messages', () => {
  describe('GET', () => {
    it('should return messages for a meeting', async () => {
      const req = new NextRequest(
        'http://localhost/api/meetings/meeting-1/messages'
      );
      const params = { id: 'meeting-1' };

      const response = await GET(req, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('messages');
    });

    it('should support pagination with limit and offset', async () => {
      const req = new NextRequest(
        'http://localhost/api/meetings/meeting-1/messages?limit=10&offset=20'
      );
      const params = { id: 'meeting-1' };

      const response = await GET(req, { params });

      expect(response.status).toBe(200);
    });

    it('should support search query', async () => {
      const req = new NextRequest(
        'http://localhost/api/meetings/meeting-1/messages?search=hello'
      );
      const params = { id: 'meeting-1' };

      const response = await GET(req, { params });

      expect(response.status).toBe(200);
    });
  });

  describe('POST', () => {
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

      expect(response.status).toBe(201);
    });

    it('should reject invalid message content', async () => {
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

    it('should create a private message with recipient', async () => {
      const req = new NextRequest(
        'http://localhost/api/meetings/meeting-1/messages',
        {
          method: 'POST',
          body: JSON.stringify({
            content: 'Private message',
            type: 'private',
            recipient_id: 'user-2',
          }),
        }
      );
      const params = { id: 'meeting-1' };

      const response = await POST(req, { params });

      expect(response.status).toBe(201);
    });
  });
});
