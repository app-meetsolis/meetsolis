/**
 * Story 7.7 — tests for PATCH /api/sessions/[id]/tags
 */

import { NextRequest } from 'next/server';

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

jest.mock('@/lib/config/env', () => ({
  config: {
    supabase: {
      url: 'https://test.supabase.co',
      serviceRoleKey: 'test-service-role-key',
    },
  },
}));

jest.mock('@/lib/helpers/user', () => ({
  getInternalUserId: jest.fn().mockResolvedValue('user-uuid'),
}));

import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { PATCH } from '../route';

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;

const VALID_ID = '123e4567-e89b-12d3-a456-426614174000';

describe('PATCH /api/sessions/[id]/tags', () => {
  let supabase: any;
  let updatePayload: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.mockResolvedValue({ userId: 'clerk-user' } as any);
    updatePayload = null;

    supabase = {
      from: jest.fn(() => ({
        update: jest.fn((payload: any) => {
          updatePayload = payload;
          return {
            eq: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            maybeSingle: jest.fn().mockResolvedValue({
              data: { id: VALID_ID, tags: payload.tags },
              error: null,
            }),
          };
        }),
      })),
    };
    mockCreateClient.mockReturnValue(supabase);
  });

  it('400 — rejects invalid enum value', async () => {
    const req = new NextRequest(
      `http://localhost:3000/api/sessions/${VALID_ID}/tags`,
      { method: 'PATCH', body: JSON.stringify({ tags: ['nonsense'] }) }
    );
    const res = await PATCH(req, { params: { id: VALID_ID } });
    expect(res.status).toBe(400);
  });

  it('400 — rejects >2 tags', async () => {
    const req = new NextRequest(
      `http://localhost:3000/api/sessions/${VALID_ID}/tags`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          tags: ['breakthrough', 'stuck', 'milestone'],
        }),
      }
    );
    const res = await PATCH(req, { params: { id: VALID_ID } });
    expect(res.status).toBe(400);
  });

  it('400 — rejects missing tags field', async () => {
    const req = new NextRequest(
      `http://localhost:3000/api/sessions/${VALID_ID}/tags`,
      { method: 'PATCH', body: JSON.stringify({}) }
    );
    const res = await PATCH(req, { params: { id: VALID_ID } });
    expect(res.status).toBe(400);
  });

  it('400 — rejects invalid id format', async () => {
    const req = new NextRequest(
      'http://localhost:3000/api/sessions/not-a-uuid/tags',
      { method: 'PATCH', body: JSON.stringify({ tags: ['breakthrough'] }) }
    );
    const res = await PATCH(req, { params: { id: 'not-a-uuid' } });
    expect(res.status).toBe(400);
  });

  it('401 — rejects unauthenticated', async () => {
    mockAuth.mockResolvedValueOnce({ userId: null } as any);
    const req = new NextRequest(
      `http://localhost:3000/api/sessions/${VALID_ID}/tags`,
      { method: 'PATCH', body: JSON.stringify({ tags: ['breakthrough'] }) }
    );
    const res = await PATCH(req, { params: { id: VALID_ID } });
    expect(res.status).toBe(401);
  });

  it('200 — accepts 1 valid tag', async () => {
    const req = new NextRequest(
      `http://localhost:3000/api/sessions/${VALID_ID}/tags`,
      { method: 'PATCH', body: JSON.stringify({ tags: ['breakthrough'] }) }
    );
    const res = await PATCH(req, { params: { id: VALID_ID } });
    expect(res.status).toBe(200);
    expect(updatePayload.tags).toEqual(['breakthrough']);
  });

  it('200 — accepts 2 valid tags', async () => {
    const req = new NextRequest(
      `http://localhost:3000/api/sessions/${VALID_ID}/tags`,
      {
        method: 'PATCH',
        body: JSON.stringify({ tags: ['breakthrough', 'milestone'] }),
      }
    );
    const res = await PATCH(req, { params: { id: VALID_ID } });
    expect(res.status).toBe(200);
    expect(updatePayload.tags).toEqual(['breakthrough', 'milestone']);
  });

  it('200 — dedupes a duplicate tag', async () => {
    const req = new NextRequest(
      `http://localhost:3000/api/sessions/${VALID_ID}/tags`,
      {
        method: 'PATCH',
        body: JSON.stringify({ tags: ['breakthrough', 'breakthrough'] }),
      }
    );
    const res = await PATCH(req, { params: { id: VALID_ID } });
    expect(res.status).toBe(200);
    expect(updatePayload.tags).toEqual(['breakthrough']);
  });

  it('404 — session not found', async () => {
    supabase.from = jest.fn(() => ({
      update: jest.fn(() => ({
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      })),
    }));
    const req = new NextRequest(
      `http://localhost:3000/api/sessions/${VALID_ID}/tags`,
      { method: 'PATCH', body: JSON.stringify({ tags: ['breakthrough'] }) }
    );
    const res = await PATCH(req, { params: { id: VALID_ID } });
    expect(res.status).toBe(404);
  });
});
