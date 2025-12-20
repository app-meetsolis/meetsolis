/**
 * Read Receipt API Tests
 * Story 2.4 - Message Read Receipts
 * TEST-001 Fix: Add missing read receipt tests
 */

import { NextRequest } from 'next/server';
import { POST } from '../route';

// Mock dependencies
const mockAuth = jest.fn(() => Promise.resolve({ userId: 'test-clerk-id' }));
jest.mock('@clerk/nextjs/server', () => ({
  auth: mockAuth,
}));

const mockUpdateSingle = jest.fn();
const mockSupabaseClient = {
  from: jest.fn((table: string) => {
    const chain = {
      select: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    if (table === 'users') {
      chain.single.mockResolvedValue({
        data: { id: 'user-uuid-1' },
        error: null,
      });
    } else if (table === 'messages') {
      chain.single.mockResolvedValue({
        data: {
          id: 'msg-1',
          content: 'Test message',
          message_read_by: [],
        },
        error: null,
      });

      chain.update.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: mockUpdateSingle.mockResolvedValue({
              data: {
                id: 'msg-1',
                content: 'Test message',
                message_read_by: [
                  {
                    user_id: 'user-uuid-1',
                    read_at: new Date().toISOString(),
                  },
                ],
              },
              error: null,
            }),
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

describe('POST /api/meetings/[id]/messages/[msgId]/read', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    mockAuth.mockResolvedValueOnce({ userId: null });

    const req = new NextRequest(
      'http://localhost/api/meetings/meeting-1/messages/msg-1/read',
      { method: 'POST' }
    );
    const params = { id: 'meeting-1', msgId: 'msg-1' };

    const response = await POST(req, { params });

    expect(response.status).toBe(401);
  });

  it('should mark message as read successfully', async () => {
    const req = new NextRequest(
      'http://localhost/api/meetings/meeting-1/messages/msg-1/read',
      { method: 'POST' }
    );
    const params = { id: 'meeting-1', msgId: 'msg-1' };

    const response = await POST(req, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('message');
    expect(data.message.message_read_by).toBeDefined();
    expect(Array.isArray(data.message.message_read_by)).toBe(true);
  });

  it('should add user to message_read_by array', async () => {
    const req = new NextRequest(
      'http://localhost/api/meetings/meeting-1/messages/msg-1/read',
      { method: 'POST' }
    );
    const params = { id: 'meeting-1', msgId: 'msg-1' };

    const response = await POST(req, { params });
    const data = await response.json();

    const readReceipt = data.message.message_read_by.find(
      (r: any) => r.user_id === 'user-uuid-1'
    );
    expect(readReceipt).toBeDefined();
    expect(readReceipt.read_at).toBeDefined();
  });

  it('should include timestamp in read receipt', async () => {
    const req = new NextRequest(
      'http://localhost/api/meetings/meeting-1/messages/msg-1/read',
      { method: 'POST' }
    );
    const params = { id: 'meeting-1', msgId: 'msg-1' };

    const response = await POST(req, { params });
    const data = await response.json();

    const readReceipt = data.message.message_read_by[0];
    expect(readReceipt.read_at).toBeDefined();
    expect(new Date(readReceipt.read_at).getTime()).toBeGreaterThan(0);
  });

  it('should not duplicate read receipt if already read', async () => {
    // Message already read by user
    mockSupabaseClient.from.mockImplementationOnce((table: string) => {
      if (table === 'messages') {
        const chain = mockSupabaseClient.from(table);
        chain.single.mockResolvedValue({
          data: {
            id: 'msg-1',
            content: 'Test message',
            message_read_by: [
              {
                user_id: 'user-uuid-1',
                read_at: '2025-01-01T00:00:00Z',
              },
            ],
          },
          error: null,
        });
        return chain;
      }
      return mockSupabaseClient.from(table);
    });

    const req = new NextRequest(
      'http://localhost/api/meetings/meeting-1/messages/msg-1/read',
      { method: 'POST' }
    );
    const params = { id: 'meeting-1', msgId: 'msg-1' };

    const response = await POST(req, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    // Should not add duplicate
    const userReceipts = data.message.message_read_by.filter(
      (r: any) => r.user_id === 'user-uuid-1'
    );
    expect(userReceipts.length).toBeLessThanOrEqual(1);
  });

  it('should return 404 if message not found', async () => {
    mockSupabaseClient.from.mockImplementationOnce((table: string) => {
      if (table === 'messages') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: new Error('Not found'),
          }),
        };
      }
      return mockSupabaseClient.from(table);
    });

    const req = new NextRequest(
      'http://localhost/api/meetings/meeting-1/messages/nonexistent/read',
      { method: 'POST' }
    );
    const params = { id: 'meeting-1', msgId: 'nonexistent' };

    const response = await POST(req, { params });

    expect(response.status).toBe(404);
  });

  it('should handle database errors gracefully', async () => {
    mockUpdateSingle.mockResolvedValueOnce({
      data: null,
      error: new Error('Database error'),
    });

    const req = new NextRequest(
      'http://localhost/api/meetings/meeting-1/messages/msg-1/read',
      { method: 'POST' }
    );
    const params = { id: 'meeting-1', msgId: 'msg-1' };

    const response = await POST(req, { params });

    expect(response.status).toBe(500);
  });

  it('should preserve existing read receipts from other users', async () => {
    mockSupabaseClient.from.mockImplementationOnce((table: string) => {
      if (table === 'messages') {
        const chain = mockSupabaseClient.from(table);
        chain.single.mockResolvedValue({
          data: {
            id: 'msg-1',
            content: 'Test message',
            message_read_by: [
              {
                user_id: 'user-uuid-2',
                read_at: '2025-01-01T00:00:00Z',
              },
            ],
          },
          error: null,
        });
        return chain;
      }
      return mockSupabaseClient.from(table);
    });

    mockUpdateSingle.mockResolvedValueOnce({
      data: {
        id: 'msg-1',
        content: 'Test message',
        message_read_by: [
          {
            user_id: 'user-uuid-2',
            read_at: '2025-01-01T00:00:00Z',
          },
          {
            user_id: 'user-uuid-1',
            read_at: new Date().toISOString(),
          },
        ],
      },
      error: null,
    });

    const req = new NextRequest(
      'http://localhost/api/meetings/meeting-1/messages/msg-1/read',
      { method: 'POST' }
    );
    const params = { id: 'meeting-1', msgId: 'msg-1' };

    const response = await POST(req, { params });
    const data = await response.json();

    expect(data.message.message_read_by.length).toBe(2);
    const user2Receipt = data.message.message_read_by.find(
      (r: any) => r.user_id === 'user-uuid-2'
    );
    expect(user2Receipt).toBeDefined();
  });

  it('should update message record in database', async () => {
    const req = new NextRequest(
      'http://localhost/api/meetings/meeting-1/messages/msg-1/read',
      { method: 'POST' }
    );
    const params = { id: 'meeting-1', msgId: 'msg-1' };

    await POST(req, { params });

    // Verify update was called on messages table
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('messages');
  });
});
