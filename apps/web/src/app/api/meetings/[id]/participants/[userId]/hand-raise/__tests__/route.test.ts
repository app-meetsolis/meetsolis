/**
 * Hand Raise API Tests
 * Story 2.4 - Hand Raise Feature
 * TEST-001 Fix: Add missing hand raise tests
 */

import { NextRequest } from 'next/server';
import { PUT } from '../route';

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

    if (table === 'meetings') {
      chain.single.mockResolvedValue({
        data: { id: 'meeting-uuid-1', host_id: 'user-uuid-1' },
        error: null,
      });
    } else if (table === 'users') {
      chain.single.mockResolvedValue({
        data: { id: 'user-uuid-1' },
        error: null,
      });
    } else if (table === 'participants') {
      chain.update.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: mockUpdateSingle.mockResolvedValue({
                data: {
                  id: 'participant-1',
                  user_id: 'user-uuid-1',
                  hand_raised: true,
                  hand_raised_at: new Date().toISOString(),
                },
                error: null,
              }),
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

describe('PUT /api/meetings/[id]/participants/[userId]/hand-raise', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    mockAuth.mockResolvedValueOnce({ userId: null });

    const req = new NextRequest(
      'http://localhost/api/meetings/meeting-1/participants/user-1/hand-raise',
      {
        method: 'PUT',
        body: JSON.stringify({ hand_raised: true }),
      }
    );
    const params = { id: 'meeting-1', userId: 'user-1' };

    const response = await PUT(req, { params });

    expect(response.status).toBe(401);
  });

  it('should raise hand successfully', async () => {
    const req = new NextRequest(
      'http://localhost/api/meetings/meeting-1/participants/user-uuid-1/hand-raise',
      {
        method: 'PUT',
        body: JSON.stringify({ hand_raised: true }),
      }
    );
    const params = { id: 'meeting-1', userId: 'user-uuid-1' };

    const response = await PUT(req, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.participant).toBeDefined();
    expect(data.participant.hand_raised).toBe(true);
    expect(data.participant.hand_raised_at).toBeDefined();
  });

  it('should lower hand successfully', async () => {
    mockUpdateSingle.mockResolvedValueOnce({
      data: {
        id: 'participant-1',
        user_id: 'user-uuid-1',
        hand_raised: false,
        hand_raised_at: null,
      },
      error: null,
    });

    const req = new NextRequest(
      'http://localhost/api/meetings/meeting-1/participants/user-uuid-1/hand-raise',
      {
        method: 'PUT',
        body: JSON.stringify({ hand_raised: false }),
      }
    );
    const params = { id: 'meeting-1', userId: 'user-uuid-1' };

    const response = await PUT(req, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.participant.hand_raised).toBe(false);
    expect(data.participant.hand_raised_at).toBeNull();
  });

  it('should reject invalid hand_raised value', async () => {
    const req = new NextRequest(
      'http://localhost/api/meetings/meeting-1/participants/user-1/hand-raise',
      {
        method: 'PUT',
        body: JSON.stringify({ hand_raised: 'invalid' }),
      }
    );
    const params = { id: 'meeting-1', userId: 'user-1' };

    const response = await PUT(req, { params });

    expect(response.status).toBe(400);
  });

  it('should reject missing hand_raised field', async () => {
    const req = new NextRequest(
      'http://localhost/api/meetings/meeting-1/participants/user-1/hand-raise',
      {
        method: 'PUT',
        body: JSON.stringify({}),
      }
    );
    const params = { id: 'meeting-1', userId: 'user-1' };

    const response = await PUT(req, { params });

    expect(response.status).toBe(400);
  });

  it('should return 404 if meeting not found', async () => {
    mockSupabaseClient.from.mockImplementationOnce((table: string) => {
      if (table === 'meetings') {
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
      'http://localhost/api/meetings/nonexistent/participants/user-1/hand-raise',
      {
        method: 'PUT',
        body: JSON.stringify({ hand_raised: true }),
      }
    );
    const params = { id: 'nonexistent', userId: 'user-1' };

    const response = await PUT(req, { params });

    expect(response.status).toBe(404);
  });

  it('should allow host to lower any hand', async () => {
    // Host lowering another participant's hand
    const req = new NextRequest(
      'http://localhost/api/meetings/meeting-1/participants/user-uuid-2/hand-raise',
      {
        method: 'PUT',
        body: JSON.stringify({ hand_raised: false }),
      }
    );
    const params = { id: 'meeting-1', userId: 'user-uuid-2' };

    const response = await PUT(req, { params });

    expect(response.status).toBe(200);
  });

  it('should update participant record in database', async () => {
    const req = new NextRequest(
      'http://localhost/api/meetings/meeting-1/participants/user-uuid-1/hand-raise',
      {
        method: 'PUT',
        body: JSON.stringify({ hand_raised: true }),
      }
    );
    const params = { id: 'meeting-1', userId: 'user-uuid-1' };

    await PUT(req, { params });

    // Verify update was called on participants table
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('participants');
  });

  it('should set hand_raised_at timestamp when raising hand', async () => {
    const req = new NextRequest(
      'http://localhost/api/meetings/meeting-1/participants/user-uuid-1/hand-raise',
      {
        method: 'PUT',
        body: JSON.stringify({ hand_raised: true }),
      }
    );
    const params = { id: 'meeting-1', userId: 'user-uuid-1' };

    const response = await PUT(req, { params });
    const data = await response.json();

    expect(data.participant.hand_raised_at).toBeDefined();
    expect(new Date(data.participant.hand_raised_at).getTime()).toBeGreaterThan(
      0
    );
  });

  it('should clear hand_raised_at timestamp when lowering hand', async () => {
    mockUpdateSingle.mockResolvedValueOnce({
      data: {
        id: 'participant-1',
        user_id: 'user-uuid-1',
        hand_raised: false,
        hand_raised_at: null,
      },
      error: null,
    });

    const req = new NextRequest(
      'http://localhost/api/meetings/meeting-1/participants/user-uuid-1/hand-raise',
      {
        method: 'PUT',
        body: JSON.stringify({ hand_raised: false }),
      }
    );
    const params = { id: 'meeting-1', userId: 'user-uuid-1' };

    const response = await PUT(req, { params });
    const data = await response.json();

    expect(data.participant.hand_raised_at).toBeNull();
  });

  it('should handle database errors gracefully', async () => {
    mockUpdateSingle.mockResolvedValueOnce({
      data: null,
      error: new Error('Database error'),
    });

    const req = new NextRequest(
      'http://localhost/api/meetings/meeting-1/participants/user-uuid-1/hand-raise',
      {
        method: 'PUT',
        body: JSON.stringify({ hand_raised: true }),
      }
    );
    const params = { id: 'meeting-1', userId: 'user-uuid-1' };

    const response = await PUT(req, { params });

    expect(response.status).toBe(500);
  });

  it('should work with meeting_code instead of UUID', async () => {
    const req = new NextRequest(
      'http://localhost/api/meetings/ABC123/participants/user-uuid-1/hand-raise',
      {
        method: 'PUT',
        body: JSON.stringify({ hand_raised: true }),
      }
    );
    const params = { id: 'ABC123', userId: 'user-uuid-1' };

    const response = await PUT(req, { params });

    expect(response.status).toBe(200);
  });
});
