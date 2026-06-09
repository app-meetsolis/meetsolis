/**
 * @jest-environment node
 *
 * Story 7.4 — POST /api/onboarding/seed-demo tests.
 */

jest.mock('@/lib/config/env', () => ({
  config: {
    supabase: {
      url: 'http://localhost',
      serviceRoleKey: 'test-key',
    },
  },
}));

const mockAuth = jest.fn();
jest.mock('@clerk/nextjs/server', () => ({
  auth: () => mockAuth(),
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({}),
}));

const mockGetInternalUserId = jest.fn();
jest.mock('@/lib/helpers/user', () => ({
  getInternalUserId: (...args: unknown[]) => mockGetInternalUserId(...args),
}));

const mockSeedDemoClient = jest.fn();
jest.mock('@/lib/onboarding/seed-demo-client', () => ({
  seedDemoClient: (userId: string) => mockSeedDemoClient(userId),
}));

import { POST } from '../route';

describe('POST /api/onboarding/seed-demo', () => {
  beforeEach(() => {
    mockAuth.mockReset();
    mockGetInternalUserId.mockReset();
    mockSeedDemoClient.mockReset();
  });

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null });

    const res = await POST();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 404 when internal user not found', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk-1' });
    mockGetInternalUserId.mockResolvedValue(null);

    const res = await POST();
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe('USER_NOT_FOUND');
  });

  it('returns seed result for first-time demo', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk-1' });
    mockGetInternalUserId.mockResolvedValue('user-1');
    mockSeedDemoClient.mockResolvedValue({
      clientId: 'alex-uuid',
      alreadySeeded: false,
      sessionsCreated: 4,
      actionItemsCreated: 8,
      briefCreated: true,
    });

    const res = await POST();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      clientId: 'alex-uuid',
      alreadySeeded: false,
      sessionsCreated: 4,
      actionItemsCreated: 8,
      briefCreated: true,
    });
    expect(mockSeedDemoClient).toHaveBeenCalledWith('user-1');
  });

  it('is idempotent — returns existing clientId with alreadySeeded=true', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk-1' });
    mockGetInternalUserId.mockResolvedValue('user-1');
    mockSeedDemoClient.mockResolvedValue({
      clientId: 'alex-uuid',
      alreadySeeded: true,
      sessionsCreated: 0,
      actionItemsCreated: 0,
      briefCreated: false,
    });

    const res = await POST();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.alreadySeeded).toBe(true);
    expect(body.clientId).toBe('alex-uuid');
  });

  it('returns 500 with generic message (no internal detail leak) when seed throws', async () => {
    mockAuth.mockResolvedValue({ userId: 'clerk-1' });
    mockGetInternalUserId.mockResolvedValue('user-1');
    mockSeedDemoClient.mockRejectedValue(
      new Error(
        'duplicate key value violates constraint "uniq_clients_one_demo_per_user"'
      )
    );

    const res = await POST();
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error.code).toBe('INTERNAL_ERROR');
    // Generic message — original error stays in server logs only
    expect(body.error.message).toBe(
      'Failed to set up your demo. Please try again.'
    );
    expect(body.error.message).not.toContain('duplicate key');
    expect(body.error.message).not.toContain('uniq_clients');
  });
});
