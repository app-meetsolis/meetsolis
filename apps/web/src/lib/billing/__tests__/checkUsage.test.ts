/**
 * Unit tests for checkUsage.ts — Stories 4.4 + 5.2
 */

import {
  checkClientLimit,
  checkTranscriptLimit,
  checkQueryLimit,
  incrementTranscriptCount,
  incrementQueryCount,
  LIMITS,
} from '../checkUsage';
import { UpgradeRequiredError } from '@meetsolis/shared';
import * as Sentry from '@sentry/nextjs';
import { config } from '@/lib/config/env';

jest.mock('@sentry/nextjs', () => ({ captureException: jest.fn() }));
jest.mock('@/lib/config/env', () => ({ config: { adminBypassLimits: false } }));

// Mock Supabase server client
const mockSupabase = { from: jest.fn() };
jest.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: jest.fn(() => mockSupabase),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeChain(overrides: Record<string, any> = {}) {
  const chain: Record<string, jest.Mock> = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    maybeSingle: jest.fn(),
    ...overrides,
  };
  // Allow chaining for update().eq().select().single()
  Object.values(chain).forEach(fn => {
    if (typeof fn === 'function') {
      fn.mockReturnValue ? null : null;
    }
  });
  return chain;
}

function setupSupabase(tableResponses: Record<string, any>) {
  mockSupabase.from.mockImplementation((table: string) => {
    return tableResponses[table] || makeChain();
  });
}

// ---------------------------------------------------------------------------
// LIMITS constant
// ---------------------------------------------------------------------------

describe('LIMITS', () => {
  it('free tier has correct limits', () => {
    expect(LIMITS.free.clients).toBe(3);
    expect(LIMITS.free.transcripts).toBe(5);
    expect(LIMITS.free.queries).toBe(75);
  });

  it('pro tier has correct limits', () => {
    expect(LIMITS.pro.clients).toBe(Infinity);
    expect(LIMITS.pro.transcripts).toBe(25);
    expect(LIMITS.pro.queries).toBe(2000);
  });
});

// ---------------------------------------------------------------------------
// Admin bypass
// ---------------------------------------------------------------------------

describe('admin bypass', () => {
  afterEach(() => {
    (config as any).adminBypassLimits = false;
    jest.clearAllMocks();
  });

  it('bypasses all limit checks when adminBypassLimits=true', async () => {
    (config as any).adminBypassLimits = true;

    await expect(checkClientLimit('admin-user')).resolves.toBeUndefined();
    await expect(checkTranscriptLimit('admin-user')).resolves.toBeUndefined();
    await expect(checkQueryLimit('admin-user')).resolves.toBeUndefined();
    expect(mockSupabase.from).not.toHaveBeenCalled();
  });

  it('enforces limits normally when adminBypassLimits=false (production default)', async () => {
    // config.adminBypassLimits is false by default — mirrors production
    setupSupabase({
      subscriptions: {
        ...makeChain(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null }),
      },
      clients: {
        ...makeChain(),
        eq: jest.fn().mockResolvedValue({ count: 0, error: null }),
      },
    });

    await expect(checkClientLimit('user-1')).resolves.toBeUndefined();
    expect(mockSupabase.from).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// checkClientLimit
// ---------------------------------------------------------------------------

describe('checkClientLimit', () => {
  beforeEach(() => jest.clearAllMocks());

  it('passes when free user has < 3 clients', async () => {
    setupSupabase({
      subscriptions: {
        ...makeChain(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null }),
      },
      clients: {
        ...makeChain(),
        eq: jest.fn().mockResolvedValue({ count: 2, error: null }),
      },
    });

    await expect(checkClientLimit('user-1')).resolves.toBeUndefined();
  });

  it('throws UpgradeRequiredError when free user hits 3 clients', async () => {
    setupSupabase({
      subscriptions: {
        ...makeChain(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null }),
      },
      clients: {
        ...makeChain(),
        eq: jest.fn().mockResolvedValue({ count: 3, error: null }),
      },
    });

    await expect(checkClientLimit('user-1')).rejects.toThrow(
      UpgradeRequiredError
    );
    await expect(checkClientLimit('user-1')).rejects.toMatchObject({
      limitType: 'client',
    });
  });

  it('passes for pro user regardless of client count', async () => {
    setupSupabase({
      subscriptions: {
        ...makeChain(),
        maybeSingle: jest.fn().mockResolvedValue({ data: { plan: 'pro' } }),
      },
    });

    await expect(checkClientLimit('user-1')).resolves.toBeUndefined();
    // Should not query clients table
    expect(mockSupabase.from).not.toHaveBeenCalledWith('clients');
  });
});

// ---------------------------------------------------------------------------
// checkTranscriptLimit
// ---------------------------------------------------------------------------

const baseUsage = {
  id: 'usage-1',
  user_id: 'user-1',
  transcript_count: 0,
  transcript_reset_at: null,
  query_count: 0,
  query_reset_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('checkTranscriptLimit', () => {
  beforeEach(() => jest.clearAllMocks());

  it('passes when free user has < 5 transcripts', async () => {
    setupSupabase({
      subscriptions: {
        ...makeChain(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null }),
      },
      usage_tracking: {
        ...makeChain(),
        upsert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...baseUsage, transcript_count: 4 },
          error: null,
        }),
      },
    });

    await expect(checkTranscriptLimit('user-1')).resolves.toBeUndefined();
  });

  it('throws when free user has 5 transcripts', async () => {
    setupSupabase({
      subscriptions: {
        ...makeChain(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null }),
      },
      usage_tracking: {
        ...makeChain(),
        upsert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...baseUsage, transcript_count: 5 },
          error: null,
        }),
      },
    });

    await expect(checkTranscriptLimit('user-1')).rejects.toThrow(
      UpgradeRequiredError
    );
    await expect(checkTranscriptLimit('user-1')).rejects.toMatchObject({
      limitType: 'transcript',
    });
  });

  it('passes when pro user is within monthly limit', async () => {
    const recentReset = new Date().toISOString(); // just now — no reset needed
    setupSupabase({
      subscriptions: {
        ...makeChain(),
        maybeSingle: jest.fn().mockResolvedValue({ data: { plan: 'pro' } }),
      },
      usage_tracking: {
        ...makeChain(),
        upsert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            ...baseUsage,
            transcript_count: 10,
            transcript_reset_at: recentReset,
          },
          error: null,
        }),
      },
    });

    await expect(checkTranscriptLimit('user-1')).resolves.toBeUndefined();
  });

  it('resets counter for pro user when > 30 days since last reset', async () => {
    const oldReset = new Date(
      Date.now() - 31 * 24 * 60 * 60 * 1000
    ).toISOString();
    const updatedUsage = {
      ...baseUsage,
      transcript_count: 0,
      transcript_reset_at: new Date().toISOString(),
    };

    const updateChain = {
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: updatedUsage, error: null }),
    };
    const updateMock = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue(updateChain),
    });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'subscriptions') {
        return {
          ...makeChain(),
          maybeSingle: jest.fn().mockResolvedValue({ data: { plan: 'pro' } }),
        };
      }
      if (table === 'usage_tracking') {
        return {
          upsert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              ...baseUsage,
              transcript_count: 10,
              transcript_reset_at: oldReset,
            },
            error: null,
          }),
          update: updateMock,
          eq: jest.fn().mockReturnThis(),
        };
      }
      return makeChain();
    });

    await expect(checkTranscriptLimit('user-1')).resolves.toBeUndefined();
    expect(updateMock).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// checkQueryLimit
// ---------------------------------------------------------------------------

describe('checkQueryLimit', () => {
  beforeEach(() => jest.clearAllMocks());

  it('throws when free user hits 75 queries', async () => {
    setupSupabase({
      subscriptions: {
        ...makeChain(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null }),
      },
      usage_tracking: {
        ...makeChain(),
        upsert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...baseUsage, query_count: 75 },
          error: null,
        }),
      },
    });

    await expect(checkQueryLimit('user-1')).rejects.toMatchObject({
      limitType: 'query',
    });
  });

  it('throws when pro user hits 2000 queries in month', async () => {
    const recentReset = new Date().toISOString();
    setupSupabase({
      subscriptions: {
        ...makeChain(),
        maybeSingle: jest.fn().mockResolvedValue({ data: { plan: 'pro' } }),
      },
      usage_tracking: {
        ...makeChain(),
        upsert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            ...baseUsage,
            query_count: 2000,
            query_reset_at: recentReset,
          },
          error: null,
        }),
      },
    });

    await expect(checkQueryLimit('user-1')).rejects.toMatchObject({
      limitType: 'query',
    });
  });
});

// ---------------------------------------------------------------------------
// incrementTranscriptCount / incrementQueryCount
// ---------------------------------------------------------------------------

describe('incrementTranscriptCount', () => {
  beforeEach(() => jest.clearAllMocks());

  it('increments transcript_count by 1', async () => {
    const updateChain = { eq: jest.fn().mockResolvedValue({ error: null }) };
    const updateMock = jest.fn().mockReturnValue(updateChain);

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'usage_tracking') {
        return {
          upsert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { ...baseUsage, transcript_count: 3 },
            error: null,
          }),
          update: updateMock,
          eq: jest.fn().mockReturnThis(),
        };
      }
      return makeChain();
    });

    await incrementTranscriptCount('user-1');

    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({ transcript_count: 4 })
    );
  });

  it('throws on DB update failure', async () => {
    const updateChain = {
      eq: jest.fn().mockResolvedValue({ error: { message: 'DB error' } }),
    };
    const updateMock = jest.fn().mockReturnValue(updateChain);

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'usage_tracking') {
        return {
          upsert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { ...baseUsage, transcript_count: 2 },
            error: null,
          }),
          update: updateMock,
          eq: jest.fn().mockReturnThis(),
        };
      }
      return makeChain();
    });

    await expect(incrementTranscriptCount('user-1')).rejects.toThrow(
      'Failed to increment transcript count'
    );
    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        extra: { userId: 'user-1', type: 'increment_transcript' },
      })
    );
  });
});

describe('incrementQueryCount', () => {
  beforeEach(() => jest.clearAllMocks());

  it('increments query_count by 1', async () => {
    const updateChain = { eq: jest.fn().mockResolvedValue({ error: null }) };
    const updateMock = jest.fn().mockReturnValue(updateChain);

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'usage_tracking') {
        return {
          upsert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { ...baseUsage, query_count: 10 },
            error: null,
          }),
          update: updateMock,
          eq: jest.fn().mockReturnThis(),
        };
      }
      return makeChain();
    });

    await incrementQueryCount('user-1');

    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({ query_count: 11 })
    );
  });

  it('throws on DB update failure', async () => {
    const updateChain = {
      eq: jest.fn().mockResolvedValue({ error: { message: 'DB error' } }),
    };
    const updateMock = jest.fn().mockReturnValue(updateChain);

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'usage_tracking') {
        return {
          upsert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { ...baseUsage, query_count: 5 },
            error: null,
          }),
          update: updateMock,
          eq: jest.fn().mockReturnThis(),
        };
      }
      return makeChain();
    });

    await expect(incrementQueryCount('user-1')).rejects.toThrow(
      'Failed to increment query count'
    );
    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        extra: { userId: 'user-1', type: 'increment_query' },
      })
    );
  });
});
