/**
 * Unit tests — dispatch eligibility filter (Story 6.2)
 * Tests the quota + tier logic without hitting the DB.
 */

import {
  checkBotSessionLimit,
  BOT_SESSION_LIMIT_PRO,
} from '@/lib/billing/checkUsage';

jest.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: jest.fn(),
}));
jest.mock('@/lib/config/env', () => ({
  config: { adminBypassLimits: false, recall: {} },
}));

import { getSupabaseServerClient } from '@/lib/supabase/server';

const mockSupabase = (
  plan: string,
  botCount: number,
  periodStart: string | null
) => {
  const from = jest.fn((table: string) => {
    if (table === 'subscriptions') {
      return {
        select: () => ({
          eq: () => ({ maybeSingle: async () => ({ data: { plan } }) }),
        }),
      };
    }
    if (table === 'usage_tracking') {
      return {
        upsert: () => ({
          select: () => ({
            single: async () => ({
              data: null,
              error: { message: 'duplicate' },
            }),
          }),
        }),
        select: () => ({
          eq: () => ({
            single: async () => ({
              data: {
                user_id: 'u1',
                bot_session_count: botCount,
                bot_session_count_period_start: periodStart,
              },
              error: null,
            }),
          }),
        }),
        update: () => ({ eq: async () => ({}) }),
      };
    }
    return {};
  });
  (getSupabaseServerClient as jest.Mock).mockReturnValue({ from });
};

describe('checkBotSessionLimit', () => {
  it('free tier — always not allowed', async () => {
    mockSupabase('free', 0, null);
    const result = await checkBotSessionLimit('user1');
    expect(result.allowed).toBe(false);
    expect(result.limit).toBe(0);
  });

  it('pro tier under limit — allowed', async () => {
    mockSupabase('pro', 10, new Date().toISOString());
    const result = await checkBotSessionLimit('user1');
    expect(result.allowed).toBe(true);
    expect(result.used).toBe(10);
    expect(result.limit).toBe(BOT_SESSION_LIMIT_PRO);
  });

  it('pro tier at limit — not allowed', async () => {
    mockSupabase('pro', 25, new Date().toISOString());
    const result = await checkBotSessionLimit('user1');
    expect(result.allowed).toBe(false);
  });

  it('pro tier with no period_start — initialises and allows', async () => {
    mockSupabase('pro', 0, null);
    const result = await checkBotSessionLimit('user1');
    expect(result.allowed).toBe(true);
  });
});
