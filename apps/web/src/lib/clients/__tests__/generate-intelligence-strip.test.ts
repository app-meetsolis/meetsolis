/**
 * Story 7.2 — Unit tests for generateIntelligenceStrip.
 */

import { AIIntelligenceStripSchema } from '@meetsolis/shared';

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

jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
}));

jest.mock('@/lib/service-factory', () => ({
  ServiceFactory: {
    createAIService: jest.fn(),
  },
}));

import { createClient } from '@supabase/supabase-js';
import * as Sentry from '@sentry/nextjs';
import { ServiceFactory } from '@/lib/service-factory';
import { generateIntelligenceStrip } from '../generate-intelligence-strip';

const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;
const mockServiceFactory = ServiceFactory.createAIService as jest.Mock;

function buildSupabaseChain(opts: {
  client?: any;
  clientError?: any;
  sessions?: any[];
  updateError?: any;
}) {
  let updatePayload: any = null;

  const supabase: any = {
    from: jest.fn((table: string) => {
      if (table === 'clients') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: opts.client ?? null,
            error: opts.clientError ?? null,
          }),
          update: jest.fn((payload: any) => {
            updatePayload = payload;
            return {
              eq: jest.fn().mockReturnThis(),
              then: undefined,
            };
          }),
        };
      }
      if (table === 'sessions') {
        // chainable until `.order()`, which resolves
        const chain: any = {
          select: jest.fn(() => chain),
          eq: jest.fn(() => chain),
          not: jest.fn(() => chain),
          order: jest
            .fn()
            .mockResolvedValue({ data: opts.sessions ?? [], error: null }),
        };
        return chain;
      }
      return {};
    }),
    __getUpdatePayload: () => updatePayload,
  };

  // Update call returns a promise via final await on `.eq().eq()`. Override.
  supabase.from = jest.fn((table: string) => {
    if (table === 'clients') {
      const obj: any = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: opts.client ?? null,
          error: opts.clientError ?? null,
        }),
        update: jest.fn((payload: any) => {
          updatePayload = payload;
          const upd: any = {
            eq: jest.fn(() => upd),
            then: (resolve: any) =>
              resolve({ data: null, error: opts.updateError ?? null }),
          };
          return upd;
        }),
      };
      return obj;
    }
    if (table === 'sessions') {
      const chain: any = {
        select: jest.fn(() => chain),
        eq: jest.fn(() => chain),
        not: jest.fn(() => chain),
        order: jest
          .fn()
          .mockResolvedValue({ data: opts.sessions ?? [], error: null }),
      };
      return chain;
    }
    return {};
  });

  supabase.__getUpdatePayload = () => updatePayload;
  return supabase;
}

describe('generateIntelligenceStrip', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns skipped=client_not_found when client missing', async () => {
    const supabase = buildSupabaseChain({ client: null });
    mockCreateClient.mockReturnValue(supabase as any);

    const result = await generateIntelligenceStrip('cid', 'uid');
    expect(result.success).toBe(false);
    expect(result.skipped).toBe('client_not_found');
  });

  it('returns skipped=no_sessions when client has zero sessions', async () => {
    const supabase = buildSupabaseChain({
      client: {
        id: 'cid',
        user_id: 'uid',
        name: 'A',
        goal: null,
        start_date: null,
      },
      sessions: [],
    });
    mockCreateClient.mockReturnValue(supabase as any);

    const result = await generateIntelligenceStrip('cid', 'uid');
    expect(result.success).toBe(false);
    expect(result.skipped).toBe('no_sessions');
    expect(mockServiceFactory).not.toHaveBeenCalled();
  });

  it('writes a valid strip when AI returns valid output', async () => {
    const supabase = buildSupabaseChain({
      client: {
        id: 'cid',
        user_id: 'uid',
        name: 'Alex',
        goal: 'lead with calm',
        start_date: '2025-01-01',
      },
      sessions: [
        {
          id: 's1',
          session_date: '2026-05-01',
          summary: 'aha',
          key_topics: ['x'],
        },
        { id: 's2', session_date: '2026-04-01', summary: 'b', key_topics: [] },
      ],
    });
    mockCreateClient.mockReturnValue(supabase as any);
    mockServiceFactory.mockReturnValue({
      generateIntelligenceStrip: jest.fn().mockResolvedValue({
        recurring_theme: 'imposter syndrome',
        theme_frequency: '2 of 2 sessions',
        recent_breakthrough: 'named the inner critic',
        current_focus: 'pacing big decisions',
      }),
    });

    const result = await generateIntelligenceStrip('cid', 'uid');
    expect(result.success).toBe(true);
    expect(result.strip).toBeDefined();
    expect(result.strip!.generated_at).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
    );
    // Did NOT write coach_notes:
    const payload = (supabase as any).__getUpdatePayload();
    expect(Object.keys(payload)).toEqual(['ai_intelligence_strip']);
  });

  it('captures AI errors to Sentry without throwing', async () => {
    const supabase = buildSupabaseChain({
      client: {
        id: 'cid',
        user_id: 'uid',
        name: 'A',
        goal: null,
        start_date: null,
      },
      sessions: [
        { id: 's1', session_date: '2026-05-01', summary: 'x', key_topics: [] },
      ],
    });
    mockCreateClient.mockReturnValue(supabase as any);
    mockServiceFactory.mockReturnValue({
      generateIntelligenceStrip: jest
        .fn()
        .mockRejectedValue(new Error('AI boom')),
    });

    const result = await generateIntelligenceStrip('cid', 'uid');
    expect(result.success).toBe(false);
    expect(result.error).toBe('AI boom');
    expect(Sentry.captureException).toHaveBeenCalled();
  });

  it('Zod schema rejects malformed AI output (missing recurring_theme)', () => {
    const bad = {
      theme_frequency: 'x',
      recent_breakthrough: 'y',
      current_focus: 'z',
      generated_at: new Date().toISOString(),
    };
    const result = AIIntelligenceStripSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });

  it('Zod schema rejects malformed AI output (wrong type)', () => {
    const bad = {
      recurring_theme: 123,
      theme_frequency: 'x',
      recent_breakthrough: 'y',
      current_focus: 'z',
      generated_at: new Date().toISOString(),
    };
    const result = AIIntelligenceStripSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });

  it('Zod schema accepts well-formed strip', () => {
    const good = {
      recurring_theme: 'a',
      theme_frequency: 'b',
      recent_breakthrough: 'c',
      current_focus: 'd',
      generated_at: '2026-06-09T00:00:00.000Z',
    };
    const result = AIIntelligenceStripSchema.safeParse(good);
    expect(result.success).toBe(true);
  });
});
