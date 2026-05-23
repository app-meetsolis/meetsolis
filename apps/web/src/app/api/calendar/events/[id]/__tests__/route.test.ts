/**
 * PATCH /api/calendar/events/[id] — Story 6.1 (client_id) + Story 6.5 (bot_skipped).
 * Verifies the bot_skipped toggle flow used by the dashboard "⋯" menu.
 */

import { PATCH } from '../route';
import { NextRequest } from 'next/server';

jest.mock('@clerk/nextjs/server', () => ({ auth: jest.fn() }));
jest.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: jest.fn(),
}));
jest.mock('@/lib/helpers/user', () => ({ getInternalUserId: jest.fn() }));

import { auth } from '@clerk/nextjs/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getInternalUserId } from '@/lib/helpers/user';

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockGetSupabase = getSupabaseServerClient as jest.MockedFunction<
  typeof getSupabaseServerClient
>;
const mockGetInternalUserId = getInternalUserId as jest.MockedFunction<
  typeof getInternalUserId
>;

function makeSupabase(updateError: unknown = null) {
  const capture: { lastUpdate?: Record<string, unknown> } = {};
  const updateChain = {
    eq: jest.fn().mockReturnThis(),
  };
  // PATCH route chains .eq twice (id + user_id) then awaits — terminal returns { error }.
  let eqCallCount = 0;
  updateChain.eq = jest.fn(() => {
    eqCallCount++;
    if (eqCallCount >= 2) {
      return Promise.resolve({ error: updateError });
    }
    return updateChain;
  });

  const supabase = {
    from: jest.fn(() => ({
      update: jest.fn((payload: Record<string, unknown>) => {
        capture.lastUpdate = payload;
        return updateChain;
      }),
      is: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
    })),
  };
  return { supabase, capture };
}

function makeRequest(eventId: string, body: unknown): NextRequest {
  return new NextRequest(`http://localhost/api/calendar/events/${eventId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

type AuthResult = Awaited<ReturnType<typeof auth>>;
const authed = (id: string | null) => ({ userId: id }) as AuthResult;

describe('PATCH /api/calendar/events/[id] — bot_skipped', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 without auth', async () => {
    mockAuth.mockResolvedValue(authed(null));
    const res = await PATCH(makeRequest('evt-1', { bot_skipped: true }), {
      params: { id: 'evt-1' },
    });
    expect(res.status).toBe(401);
  });

  it('sets bot_skipped=true', async () => {
    mockAuth.mockResolvedValue(authed('clerk_1'));
    mockGetInternalUserId.mockResolvedValue('user_1');
    const { supabase, capture } = makeSupabase();
    mockGetSupabase.mockReturnValue(
      supabase as ReturnType<typeof getSupabaseServerClient>
    );
    const res = await PATCH(makeRequest('evt-1', { bot_skipped: true }), {
      params: { id: 'evt-1' },
    });
    expect(res.status).toBe(200);
    expect(capture.lastUpdate).toEqual({ bot_skipped: true });
  });

  it('flips bot_skipped=false (re-enable)', async () => {
    mockAuth.mockResolvedValue(authed('clerk_1'));
    mockGetInternalUserId.mockResolvedValue('user_1');
    const { supabase, capture } = makeSupabase();
    mockGetSupabase.mockReturnValue(
      supabase as ReturnType<typeof getSupabaseServerClient>
    );
    const res = await PATCH(makeRequest('evt-1', { bot_skipped: false }), {
      params: { id: 'evt-1' },
    });
    expect(res.status).toBe(200);
    expect(capture.lastUpdate).toEqual({ bot_skipped: false });
  });

  it('rejects empty body', async () => {
    mockAuth.mockResolvedValue(authed('clerk_1'));
    mockGetInternalUserId.mockResolvedValue('user_1');
    const { supabase } = makeSupabase();
    mockGetSupabase.mockReturnValue(
      supabase as ReturnType<typeof getSupabaseServerClient>
    );
    const res = await PATCH(makeRequest('evt-1', {}), {
      params: { id: 'evt-1' },
    });
    expect(res.status).toBe(400);
  });
});
