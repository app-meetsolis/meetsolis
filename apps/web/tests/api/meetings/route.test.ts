/**
 * Meetings API Route Tests
 */

import { GET, POST } from '@/app/api/meetings/route';
import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Mock dependencies
jest.mock('@clerk/nextjs/server');
jest.mock('@supabase/supabase-js');

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;

// Helper to create NextRequest
function createNextRequest(url: string, options: RequestInit = {}) {
  return new NextRequest(url, options);
}

describe('GET /api/meetings', () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };
    mockCreateClient.mockReturnValue(mockSupabase as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 if user is not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null } as any);

    const req = createNextRequest('http://localhost:3000/api/meetings');
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('returns user meetings successfully', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk_123' } as any);

    mockSupabase.single.mockResolvedValueOnce({
      data: { id: 'user_1' },
      error: null,
    });

    const mockMeetings = [
      { id: '1', title: 'Meeting 1', host_id: 'user_1' },
      { id: '2', title: 'Meeting 2', host_id: 'user_1' },
    ];

    mockSupabase.or.mockResolvedValueOnce({
      data: mockMeetings,
      error: null,
    });

    const req = createNextRequest('http://localhost:3000/api/meetings');
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockMeetings);
  });

  it('applies search filter correctly', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk_123' } as any);

    mockSupabase.single.mockResolvedValueOnce({
      data: { id: 'user_1' },
      error: null,
    });

    mockSupabase.ilike.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    const req = createNextRequest(
      'http://localhost:3000/api/meetings?search=Client'
    );
    await GET(req);

    expect(mockSupabase.ilike).toHaveBeenCalledWith('title', '%Client%');
  });

  it('returns 404 if user not found in database', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk_123' } as any);

    mockSupabase.single.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    const req = createNextRequest('http://localhost:3000/api/meetings');
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error.code).toBe('USER_NOT_FOUND');
  });
});

describe('POST /api/meetings', () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };
    mockCreateClient.mockReturnValue(mockSupabase as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates meeting successfully', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk_123' } as any);

    mockSupabase.single
      .mockResolvedValueOnce({
        data: { id: 'user_1' },
        error: null,
      })
      .mockResolvedValueOnce({
        data: {
          id: '1',
          title: 'New Meeting',
          host_id: 'user_1',
        },
        error: null,
      });

    const req = createNextRequest('http://localhost:3000/api/meetings', {
      method: 'POST',
      body: JSON.stringify({
        title: 'New Meeting',
        description: 'Test description',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.title).toBe('New Meeting');
  });

  it('validates required title field', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk_123' } as any);

    const req = createNextRequest('http://localhost:3000/api/meetings', {
      method: 'POST',
      body: JSON.stringify({
        description: 'Missing title',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe('INVALID_INPUT');
  });

  it('returns 401 if user not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null } as any);

    const req = createNextRequest('http://localhost:3000/api/meetings', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Meeting',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });
});
