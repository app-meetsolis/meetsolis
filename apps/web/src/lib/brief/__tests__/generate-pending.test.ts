/**
 * Integration tests — Coach Brief cron eligibility (Story 6.4)
 * Verifies Pro/Free gating, per-user window, and idempotent dedup
 * without hitting the DB or the AI provider.
 */

jest.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: jest.fn(),
}));
jest.mock('@/lib/brief/generate-brief', () => ({
  generateBrief: jest.fn(),
}));

import { getSupabaseServerClient } from '@/lib/supabase/server';
import { generateBrief } from '@/lib/brief/generate-brief';
import { generatePendingBriefs } from '../generate-pending';

type TableData = Record<string, { data: unknown; error?: unknown }>;

/** Builds a chainable, awaitable Supabase stub keyed by table name. */
function mockSupabase(tables: TableData) {
  const from = (table: string) => {
    const result = tables[table] ?? { data: [], error: null };
    const builder: Record<string, unknown> = {};
    for (const m of [
      'select',
      'gte',
      'lte',
      'not',
      'in',
      'eq',
      'is',
      'order',
      'limit',
    ]) {
      builder[m] = () => builder;
    }
    builder.then = (resolve: (v: unknown) => unknown) => resolve(result);
    return builder;
  };
  return { from };
}

const now = Date.now();
const inMin = (m: number) => new Date(now + m * 60_000).toISOString();

const events = [
  { id: 'evt1', user_id: 'pro1', client_id: 'cl1', start_time: inMin(30) },
  { id: 'evt2', user_id: 'free1', client_id: 'cl2', start_time: inMin(30) },
  { id: 'evt3', user_id: 'pro1', client_id: 'cl3', start_time: inMin(200) },
  { id: 'evt4', user_id: 'pro1', client_id: 'cl4', start_time: inMin(30) },
];

beforeEach(() => {
  (generateBrief as jest.Mock).mockReset().mockResolvedValue({ id: 'b' });
});

describe('generatePendingBriefs', () => {
  it('generates for in-window Pro events, skips dups, excludes Free + out-of-window', async () => {
    (getSupabaseServerClient as jest.Mock).mockReturnValue(
      mockSupabase({
        calendar_events: { data: events, error: null },
        subscriptions: { data: [{ user_id: 'pro1' }] },
        user_preferences: { data: [] }, // default 60-min window
        coach_briefs: { data: [{ calendar_event_id: 'evt4' }] },
      })
    );

    const r = await generatePendingBriefs();

    // evt1 + evt4 pass Pro+window; evt2 (Free) and evt3 (200min > 60) excluded
    expect(r.eligible).toBe(2);
    expect(r.generated).toBe(1); // evt1
    expect(r.skipped).toBe(1); // evt4 already has a brief
    expect(r.errors).toBe(0);
    expect(generateBrief).toHaveBeenCalledTimes(1);
    expect((generateBrief as jest.Mock).mock.calls[0][0].calendarEventId).toBe(
      'evt1'
    );
  });

  it('respects a custom 240-minute window', async () => {
    (getSupabaseServerClient as jest.Mock).mockReturnValue(
      mockSupabase({
        calendar_events: { data: events, error: null },
        subscriptions: { data: [{ user_id: 'pro1' }] },
        user_preferences: {
          data: [{ user_id: 'pro1', coach_brief_window_minutes: 240 }],
        },
        coach_briefs: { data: [] },
      })
    );

    const r = await generatePendingBriefs();

    // pro1 events evt1/evt3/evt4 all within 240 min
    expect(r.eligible).toBe(3);
    expect(r.generated).toBe(3);
  });

  it('returns zeroes when there are no calendar events', async () => {
    (getSupabaseServerClient as jest.Mock).mockReturnValue(
      mockSupabase({ calendar_events: { data: [], error: null } })
    );

    const r = await generatePendingBriefs();
    expect(r).toEqual({ eligible: 0, generated: 0, skipped: 0, errors: 0 });
    expect(generateBrief).not.toHaveBeenCalled();
  });

  it('counts a generation failure as an error, not a crash', async () => {
    (generateBrief as jest.Mock).mockRejectedValueOnce(new Error('AI down'));
    (getSupabaseServerClient as jest.Mock).mockReturnValue(
      mockSupabase({
        calendar_events: {
          data: [events[0]], // evt1 only
          error: null,
        },
        subscriptions: { data: [{ user_id: 'pro1' }] },
        user_preferences: { data: [] },
        coach_briefs: { data: [] },
      })
    );

    const r = await generatePendingBriefs();
    expect(r.eligible).toBe(1);
    expect(r.generated).toBe(0);
    expect(r.errors).toBe(1);
  });
});
