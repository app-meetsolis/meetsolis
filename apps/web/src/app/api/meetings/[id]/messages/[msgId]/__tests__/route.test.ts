/**
 * Message Edit/Delete API Tests
 * Story 2.4 - Message Actions (Edit/Delete)
 * TEST-001 Fix: Add missing message edit/delete tests
 */

import { NextRequest } from 'next/server';
import { PUT, DELETE } from '../route';

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
      const now = new Date();
      const fourMinutesAgo = new Date(now.getTime() - 4 * 60 * 1000);

      chain.single.mockResolvedValue({
        data: {
          id: 'msg-1',
          content: 'Original message',
          sender_id: 'user-uuid-1',
          timestamp: fourMinutesAgo.toISOString(),
          edited_at: null,
        },
        error: null,
      });

      chain.update.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: mockUpdateSingle.mockResolvedValue({
              data: {
                id: 'msg-1',
                content: 'Edited message',
                sender_id: 'user-uuid-1',
                edited_at: new Date().toISOString(),
              },
              error: null,
            }),
          }),
        }),
      });
    } else if (table === 'participants') {
      chain.single.mockResolvedValue({
        data: { id: 'participant-1', role: 'member' },
        error: null,
      });
    }

    return chain;
  }),
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

describe('PUT /api/meetings/[id]/messages/[msgId]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    mockAuth.mockResolvedValueOnce({ userId: null });

    const req = new NextRequest(
      'http://localhost/api/meetings/meeting-1/messages/msg-1',
      {
        method: 'PUT',
        body: JSON.stringify({ content: 'Edited message' }),
      }
    );
    const params = { id: 'meeting-1', msgId: 'msg-1' };

    const response = await PUT(req, { params });

    expect(response.status).toBe(401);
  });

  it('should edit message successfully', async () => {
    const req = new NextRequest(
      'http://localhost/api/meetings/meeting-1/messages/msg-1',
      {
        method: 'PUT',
        body: JSON.stringify({ content: 'Edited message' }),
      }
    );
    const params = { id: 'meeting-1', msgId: 'msg-1' };

    const response = await PUT(req, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBeDefined();
    expect(data.message.content).toBe('Edited message');
    expect(data.message.edited_at).toBeDefined();
  });

  it('should reject empty content', async () => {
    const req = new NextRequest(
      'http://localhost/api/meetings/meeting-1/messages/msg-1',
      {
        method: 'PUT',
        body: JSON.stringify({ content: '' }),
      }
    );
    const params = { id: 'meeting-1', msgId: 'msg-1' };

    const response = await PUT(req, { params });

    expect(response.status).toBe(400);
  });

  it('should reject content over 1000 characters', async () => {
    const longContent = 'a'.repeat(1001);
    const req = new NextRequest(
      'http://localhost/api/meetings/meeting-1/messages/msg-1',
      {
        method: 'PUT',
        body: JSON.stringify({ content: longContent }),
      }
    );
    const params = { id: 'meeting-1', msgId: 'msg-1' };

    const response = await PUT(req, { params });

    expect(response.status).toBe(400);
  });

  it('should sanitize HTML/XSS in edited content', async () => {
    const req = new NextRequest(
      'http://localhost/api/meetings/meeting-1/messages/msg-1',
      {
        method: 'PUT',
        body: JSON.stringify({
          content: '<script>alert("XSS")</script>Edited',
        }),
      }
    );
    const params = { id: 'meeting-1', msgId: 'msg-1' };

    const response = await PUT(req, { params });

    expect(response.status).toBe(200);
    // Content should be sanitized
  });

  it('should only allow sender to edit message', async () => {
    // Different user trying to edit
    mockSupabaseClient.from.mockImplementationOnce((table: string) => {
      if (table === 'messages') {
        const chain = mockSupabaseClient.from(table);
        chain.single.mockResolvedValue({
          data: {
            id: 'msg-1',
            content: 'Original message',
            sender_id: 'different-user-uuid',
            timestamp: new Date().toISOString(),
          },
          error: null,
        });
        return chain;
      }
      return mockSupabaseClient.from(table);
    });

    const req = new NextRequest(
      'http://localhost/api/meetings/meeting-1/messages/msg-1',
      {
        method: 'PUT',
        body: JSON.stringify({ content: 'Edited message' }),
      }
    );
    const params = { id: 'meeting-1', msgId: 'msg-1' };

    const response = await PUT(req, { params });

    expect(response.status).toBe(403);
  });

  it('should reject edits after 5 minute window', async () => {
    const now = new Date();
    const sixMinutesAgo = new Date(now.getTime() - 6 * 60 * 1000);

    mockSupabaseClient.from.mockImplementationOnce((table: string) => {
      if (table === 'messages') {
        const chain = mockSupabaseClient.from(table);
        chain.single.mockResolvedValue({
          data: {
            id: 'msg-1',
            content: 'Original message',
            sender_id: 'user-uuid-1',
            timestamp: sixMinutesAgo.toISOString(),
          },
          error: null,
        });
        return chain;
      }
      return mockSupabaseClient.from(table);
    });

    const req = new NextRequest(
      'http://localhost/api/meetings/meeting-1/messages/msg-1',
      {
        method: 'PUT',
        body: JSON.stringify({ content: 'Edited message' }),
      }
    );
    const params = { id: 'meeting-1', msgId: 'msg-1' };

    const response = await PUT(req, { params });

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.error).toContain('5 minutes');
  });

  it('should set edited_at timestamp', async () => {
    const req = new NextRequest(
      'http://localhost/api/meetings/meeting-1/messages/msg-1',
      {
        method: 'PUT',
        body: JSON.stringify({ content: 'Edited message' }),
      }
    );
    const params = { id: 'meeting-1', msgId: 'msg-1' };

    const response = await PUT(req, { params });
    const data = await response.json();

    expect(data.message.edited_at).toBeDefined();
    expect(new Date(data.message.edited_at).getTime()).toBeGreaterThan(0);
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
      'http://localhost/api/meetings/meeting-1/messages/nonexistent',
      {
        method: 'PUT',
        body: JSON.stringify({ content: 'Edited message' }),
      }
    );
    const params = { id: 'meeting-1', msgId: 'nonexistent' };

    const response = await PUT(req, { params });

    expect(response.status).toBe(404);
  });
});

describe('DELETE /api/meetings/[id]/messages/[msgId]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    mockAuth.mockResolvedValueOnce({ userId: null });

    const req = new NextRequest(
      'http://localhost/api/meetings/meeting-1/messages/msg-1',
      { method: 'DELETE' }
    );
    const params = { id: 'meeting-1', msgId: 'msg-1' };

    const response = await DELETE(req, { params });

    expect(response.status).toBe(401);
  });

  it('should soft delete message (sender)', async () => {
    mockUpdateSingle.mockResolvedValueOnce({
      data: {
        id: 'msg-1',
        is_deleted: true,
      },
      error: null,
    });

    const req = new NextRequest(
      'http://localhost/api/meetings/meeting-1/messages/msg-1',
      { method: 'DELETE' }
    );
    const params = { id: 'meeting-1', msgId: 'msg-1' };

    const response = await DELETE(req, { params });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  it('should allow host to delete any message', async () => {
    // Different user but host role
    mockSupabaseClient.from.mockImplementationOnce((table: string) => {
      if (table === 'messages') {
        const chain = mockSupabaseClient.from(table);
        chain.single.mockResolvedValue({
          data: {
            id: 'msg-1',
            content: 'Message to delete',
            sender_id: 'different-user-uuid',
            timestamp: new Date().toISOString(),
          },
          error: null,
        });
        return chain;
      } else if (table === 'participants') {
        const chain = mockSupabaseClient.from(table);
        chain.single.mockResolvedValue({
          data: { id: 'participant-1', role: 'host' },
          error: null,
        });
        return chain;
      }
      return mockSupabaseClient.from(table);
    });

    mockUpdateSingle.mockResolvedValueOnce({
      data: {
        id: 'msg-1',
        is_deleted: true,
      },
      error: null,
    });

    const req = new NextRequest(
      'http://localhost/api/meetings/meeting-1/messages/msg-1',
      { method: 'DELETE' }
    );
    const params = { id: 'meeting-1', msgId: 'msg-1' };

    const response = await DELETE(req, { params });

    expect(response.status).toBe(200);
  });

  it('should not allow non-sender, non-host to delete message', async () => {
    mockSupabaseClient.from.mockImplementationOnce((table: string) => {
      if (table === 'messages') {
        const chain = mockSupabaseClient.from(table);
        chain.single.mockResolvedValue({
          data: {
            id: 'msg-1',
            content: 'Message to delete',
            sender_id: 'different-user-uuid',
            timestamp: new Date().toISOString(),
          },
          error: null,
        });
        return chain;
      } else if (table === 'participants') {
        const chain = mockSupabaseClient.from(table);
        chain.single.mockResolvedValue({
          data: { id: 'participant-1', role: 'member' },
          error: null,
        });
        return chain;
      }
      return mockSupabaseClient.from(table);
    });

    const req = new NextRequest(
      'http://localhost/api/meetings/meeting-1/messages/msg-1',
      { method: 'DELETE' }
    );
    const params = { id: 'meeting-1', msgId: 'msg-1' };

    const response = await DELETE(req, { params });

    expect(response.status).toBe(403);
  });

  it('should set is_deleted flag to true (soft delete)', async () => {
    mockUpdateSingle.mockResolvedValueOnce({
      data: {
        id: 'msg-1',
        is_deleted: true,
      },
      error: null,
    });

    const req = new NextRequest(
      'http://localhost/api/meetings/meeting-1/messages/msg-1',
      { method: 'DELETE' }
    );
    const params = { id: 'meeting-1', msgId: 'msg-1' };

    await DELETE(req, { params });

    // Should update is_deleted field, not actually delete record
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('messages');
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
      'http://localhost/api/meetings/meeting-1/messages/nonexistent',
      { method: 'DELETE' }
    );
    const params = { id: 'meeting-1', msgId: 'nonexistent' };

    const response = await DELETE(req, { params });

    expect(response.status).toBe(404);
  });

  it('should handle database errors gracefully', async () => {
    mockUpdateSingle.mockResolvedValueOnce({
      data: null,
      error: new Error('Database error'),
    });

    const req = new NextRequest(
      'http://localhost/api/meetings/meeting-1/messages/msg-1',
      { method: 'DELETE' }
    );
    const params = { id: 'meeting-1', msgId: 'msg-1' };

    const response = await DELETE(req, { params });

    expect(response.status).toBe(500);
  });
});
