import { GET, PATCH } from '../route';
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

function makeSupabase(
  userData: Record<string, unknown> | null,
  updateError: unknown = null
) {
  const updateChain = {
    eq: jest.fn().mockResolvedValue({ error: updateError }),
  };
  return {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: userData }),
      update: jest.fn(() => updateChain),
    })),
  };
}

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/user/preferences', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('GET /api/user/preferences', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when unauthenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null } as ReturnType<
      typeof auth
    > extends Promise<infer T>
      ? T
      : never);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns preferences', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk_1' } as ReturnType<
      typeof auth
    > extends Promise<infer T>
      ? T
      : never);
    mockGetInternalUserId.mockResolvedValue('user_1');
    mockGetSupabase.mockReturnValue(
      makeSupabase({
        email_notifications_enabled: false,
        timezone: 'Europe/London',
      }) as ReturnType<typeof getSupabaseServerClient>
    );
    const res = await GET();
    const body = (await res.json()) as {
      email_notifications_enabled: boolean;
      timezone: string;
    };
    expect(res.status).toBe(200);
    expect(body.email_notifications_enabled).toBe(false);
    expect(body.timezone).toBe('Europe/London');
  });
});

describe('PATCH /api/user/preferences', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when unauthenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null } as ReturnType<
      typeof auth
    > extends Promise<infer T>
      ? T
      : never);
    const res = await PATCH(makeRequest({ timezone: 'UTC' }));
    expect(res.status).toBe(401);
  });

  it('returns 400 for empty body', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk_1' } as ReturnType<
      typeof auth
    > extends Promise<infer T>
      ? T
      : never);
    mockGetInternalUserId.mockResolvedValue('user_1');
    mockGetSupabase.mockReturnValue(
      makeSupabase({}) as ReturnType<typeof getSupabaseServerClient>
    );
    const res = await PATCH(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it('updates timezone', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk_1' } as ReturnType<
      typeof auth
    > extends Promise<infer T>
      ? T
      : never);
    mockGetInternalUserId.mockResolvedValue('user_1');
    mockGetSupabase.mockReturnValue(
      makeSupabase({}) as ReturnType<typeof getSupabaseServerClient>
    );
    const res = await PATCH(makeRequest({ timezone: 'Asia/Tokyo' }));
    const body = (await res.json()) as { ok: boolean };
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
  });

  it('updates email_notifications_enabled', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk_1' } as ReturnType<
      typeof auth
    > extends Promise<infer T>
      ? T
      : never);
    mockGetInternalUserId.mockResolvedValue('user_1');
    mockGetSupabase.mockReturnValue(
      makeSupabase({}) as ReturnType<typeof getSupabaseServerClient>
    );
    const res = await PATCH(
      makeRequest({ email_notifications_enabled: false })
    );
    expect(res.status).toBe(200);
  });
});
