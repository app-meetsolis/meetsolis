/**
 * Unit tests for GET /api/usage — Story 4.4
 */

import { GET } from '../route';

jest.mock('@clerk/nextjs/server', () => ({ auth: jest.fn() }));
jest.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: jest.fn(),
}));
jest.mock('@/lib/helpers/user', () => ({ getInternalUserId: jest.fn() }));
jest.mock('@/lib/billing/checkUsage', () => ({
  LIMITS: {
    free: { clients: 3, transcripts: 5, queries: 75 },
    pro: { clients: Infinity, transcripts: 25, queries: 2000 },
  },
}));

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

function makeSupabase(tableMap: Record<string, any>) {
  return {
    from: jest.fn(
      (table: string) =>
        tableMap[table] || {
          select: jest.fn().mockReturnThis(),
          upsert: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null }),
          maybeSingle: jest.fn().mockResolvedValue({ data: null }),
        }
    ),
  } as any;
}

describe('GET /api/usage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null } as any);

    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns 404 when user not found', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk-1' } as any);
    mockGetInternalUserId.mockResolvedValue(null);
    mockGetSupabase.mockReturnValue({} as any);

    const res = await GET();
    expect(res.status).toBe(404);
  });

  it('returns free tier usage response', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk-1' } as any);
    mockGetInternalUserId.mockResolvedValue('user-1');

    const supabase = makeSupabase({
      subscriptions: {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null }),
      },
      usage_tracking: {
        upsert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            transcript_count: 2,
            query_count: 10,
            transcript_reset_at: null,
            query_reset_at: null,
          },
        }),
      },
      clients: {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ count: 1, error: null }),
      },
    });
    mockGetSupabase.mockReturnValue(supabase);

    const res = await GET();
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.tier).toBe('free');
    expect(body.transcript_count).toBe(2);
    expect(body.transcript_limit).toBe(5);
    expect(body.query_count).toBe(10);
    expect(body.query_limit).toBe(75);
    expect(body.client_count).toBe(1);
    expect(body.client_limit).toBe(3);
    expect(body.resets_at).toBeNull();
  });

  it('returns pro tier usage with resets_at', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk-1' } as any);
    mockGetInternalUserId.mockResolvedValue('user-1');

    const resetAt = new Date().toISOString();
    const supabase = makeSupabase({
      subscriptions: {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: { plan: 'pro' } }),
      },
      usage_tracking: {
        upsert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            transcript_count: 5,
            query_count: 100,
            transcript_reset_at: resetAt,
            query_reset_at: resetAt,
          },
        }),
      },
      clients: {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ count: 5, error: null }),
      },
    });
    mockGetSupabase.mockReturnValue(supabase);

    const res = await GET();
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.tier).toBe('pro');
    expect(body.transcript_limit).toBe(25);
    expect(body.query_limit).toBe(2000);
    expect(body.client_limit).toBe(-1); // Infinity serialized as -1
    expect(body.resets_at).not.toBeNull();
  });
});
