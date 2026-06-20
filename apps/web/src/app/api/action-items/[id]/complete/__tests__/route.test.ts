/**
 * Story 7.6 — tests for PATCH /api/action-items/[id]/complete
 */

import { NextRequest } from 'next/server';

jest.mock('@clerk/nextjs/server', () => ({ auth: jest.fn() }));
jest.mock('@supabase/supabase-js', () => ({ createClient: jest.fn() }));
jest.mock('@/lib/config/env', () => ({
  config: {
    supabase: { url: 'https://test.supabase.co', serviceRoleKey: 'test-key' },
  },
}));
jest.mock('@/lib/helpers/user', () => ({
  getInternalUserId: jest.fn().mockResolvedValue('user-uuid'),
}));

import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { getInternalUserId } from '@/lib/helpers/user';
import { PATCH } from '../route';

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;
const mockGetUser = getInternalUserId as jest.MockedFunction<
  typeof getInternalUserId
>;

const VALID_ID = '123e4567-e89b-12d3-a456-426614174000';

function req(body: unknown) {
  return new NextRequest(
    `http://localhost:3000/api/action-items/${VALID_ID}/complete`,
    { method: 'PATCH', body: JSON.stringify(body) }
  );
}

describe('PATCH /api/action-items/[id]/complete', () => {
  let updatePayload: any;
  let ownerId: string | null;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.mockResolvedValue({ userId: 'clerk-user' } as any);
    mockGetUser.mockResolvedValue('user-uuid');
    updatePayload = null;
    ownerId = 'user-uuid';

    mockCreateClient.mockReturnValue({
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: ownerId ? { user_id: ownerId } : null,
              error: null,
            }),
          })),
        })),
        update: jest.fn((payload: any) => {
          updatePayload = payload;
          return {
            eq: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({
                  data: { id: VALID_ID, ...payload },
                  error: null,
                }),
              })),
            })),
          };
        }),
      })),
    } as any);
  });

  it('rejects an invalid UUID', async () => {
    const res = await PATCH(req({ completed: true }), {
      params: { id: 'nope' },
    });
    expect(res.status).toBe(400);
  });

  it('401 when unauthenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null } as any);
    const res = await PATCH(req({ completed: true }), {
      params: { id: VALID_ID },
    });
    expect(res.status).toBe(401);
  });

  it('400 when completed is not a boolean', async () => {
    const res = await PATCH(req({ completed: 'yes' }), {
      params: { id: VALID_ID },
    });
    expect(res.status).toBe(400);
  });

  it('404 when the item is owned by another user', async () => {
    ownerId = 'someone-else';
    const res = await PATCH(req({ completed: true }), {
      params: { id: VALID_ID },
    });
    expect(res.status).toBe(404);
  });

  it('marks complete: sets completed_at + status=completed', async () => {
    const res = await PATCH(req({ completed: true }), {
      params: { id: VALID_ID },
    });
    expect(res.status).toBe(200);
    expect(updatePayload.completed).toBe(true);
    expect(updatePayload.status).toBe('completed');
    expect(updatePayload.completed_at).not.toBeNull();
  });

  it('un-completes: clears completed_at + status=pending', async () => {
    const res = await PATCH(req({ completed: false }), {
      params: { id: VALID_ID },
    });
    expect(res.status).toBe(200);
    expect(updatePayload.completed).toBe(false);
    expect(updatePayload.status).toBe('pending');
    expect(updatePayload.completed_at).toBeNull();
  });
});
