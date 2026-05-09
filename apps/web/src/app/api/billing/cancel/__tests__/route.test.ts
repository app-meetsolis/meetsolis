import { POST } from '../route';

jest.mock('@clerk/nextjs/server', () => ({ auth: jest.fn() }));
jest.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: jest.fn(),
}));
jest.mock('@/lib/helpers/user', () => ({ getInternalUserId: jest.fn() }));
jest.mock('@/lib/service-factory', () => ({
  ServiceFactory: { createBillingService: jest.fn() },
}));
jest.mock('@sentry/nextjs', () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

import { auth } from '@clerk/nextjs/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getInternalUserId } from '@/lib/helpers/user';
import { ServiceFactory } from '@/lib/service-factory';

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockGetSupabase = getSupabaseServerClient as jest.MockedFunction<
  typeof getSupabaseServerClient
>;
const mockGetInternalUserId = getInternalUserId as jest.MockedFunction<
  typeof getInternalUserId
>;
const mockCreateBilling =
  ServiceFactory.createBillingService as jest.MockedFunction<
    typeof ServiceFactory.createBillingService
  >;

function makeSupabase(subData: Record<string, unknown> | null) {
  const updateChain = { eq: jest.fn().mockResolvedValue({ error: null }) };
  const selectChain = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue({ data: subData }),
  };
  return {
    from: jest.fn((table: string) => {
      if (table === 'subscriptions')
        return { ...selectChain, update: jest.fn(() => updateChain) };
      return selectChain;
    }),
    update: jest.fn(() => updateChain),
  };
}

describe('POST /api/billing/cancel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when unauthenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null } as ReturnType<
      typeof auth
    > extends Promise<infer T>
      ? T
      : never);
    const res = await POST();
    expect(res.status).toBe(401);
  });

  it('returns 400 when no subscription', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk_1' } as ReturnType<
      typeof auth
    > extends Promise<infer T>
      ? T
      : never);
    mockGetInternalUserId.mockResolvedValue('user_1');
    mockGetSupabase.mockReturnValue(
      makeSupabase(null) as ReturnType<typeof getSupabaseServerClient>
    );

    const res = await POST();
    expect(res.status).toBe(400);
  });

  it('cancels subscription and returns 200', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk_1' } as ReturnType<
      typeof auth
    > extends Promise<infer T>
      ? T
      : never);
    mockGetInternalUserId.mockResolvedValue('user_1');
    mockGetSupabase.mockReturnValue(
      makeSupabase({
        dodo_subscription_id: 'sub_abc',
        current_period_end: '2026-06-01T00:00:00Z',
      }) as ReturnType<typeof getSupabaseServerClient>
    );
    const mockBilling = {
      cancelSubscription: jest.fn().mockResolvedValue(undefined),
    };
    mockCreateBilling.mockReturnValue(
      mockBilling as ReturnType<typeof ServiceFactory.createBillingService>
    );

    const res = await POST();
    const body = (await res.json()) as { ok: boolean; period_end: string };
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(mockBilling.cancelSubscription).toHaveBeenCalledWith('sub_abc');
  });
});
