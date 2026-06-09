/**
 * @jest-environment node
 *
 * Story 7.4 — seed-demo-client tests.
 *
 * Covers idempotency, the multi-table insert sequence, embedding generation
 * fallback when the AI provider throws, and the brief-failure non-fatal path.
 */

jest.mock('@/lib/config/env', () => ({
  config: {
    supabase: {
      url: 'http://localhost',
      serviceRoleKey: 'test-key',
    },
  },
}));

const mockGenerateEmbedding = jest.fn();
jest.mock('@/lib/service-factory', () => ({
  ServiceFactory: {
    createAIService: () => ({
      generateEmbedding: (text: string) => mockGenerateEmbedding(text),
    }),
  },
}));

// Supabase mock — single in-test state object so each call inspects what we want.
type Row = Record<string, unknown>;
interface MockState {
  existingDemoClient: Row | null;
  /** Existing row that maybeSingle returns AFTER a 23505 conflict — simulates a winning concurrent seed. */
  postConflictExisting: Row | null;
  insertedClient: Row | null;
  insertedSessions: Row[];
  insertedItems: Row[];
  insertedBrief: Row | null;
  briefInsertError: { message: string } | null;
  clientInsertError: { message: string; code?: string } | null;
  sessionInsertError: { message: string } | null;
}

const state: MockState = {
  existingDemoClient: null,
  postConflictExisting: null,
  insertedClient: null,
  insertedSessions: [],
  insertedItems: [],
  insertedBrief: null,
  briefInsertError: null,
  clientInsertError: null,
  sessionInsertError: null,
};

function resetState() {
  state.existingDemoClient = null;
  state.postConflictExisting = null;
  state.insertedClient = null;
  state.insertedSessions = [];
  state.insertedItems = [];
  state.insertedBrief = null;
  state.briefInsertError = null;
  state.clientInsertError = null;
  state.sessionInsertError = null;
}

function fromBuilder(table: string) {
  let action: 'select' | 'insert' = 'select';
  let insertedRow: Row | Row[] | null = null;

  const builder = {
    select() {
      return builder;
    },
    eq() {
      return builder;
    },
    async maybeSingle() {
      if (table === 'clients') {
        // First maybeSingle in seedDemoClient is the pre-insert idempotency
        // check. The second (only if clientInsertError code is 23505) is the
        // post-race fallback lookup — switch which row we return based on
        // whether we've already consumed the pre-insert check.
        if (state.existingDemoClient) {
          const row = state.existingDemoClient;
          state.existingDemoClient = null; // consume
          return { data: row, error: null };
        }
        if (state.postConflictExisting) {
          return { data: state.postConflictExisting, error: null };
        }
      }
      return { data: null, error: null };
    },
    insert(row: Row | Row[]) {
      action = 'insert';
      insertedRow = row;

      if (table === 'clients') {
        if (state.clientInsertError) {
          return {
            select: () => ({
              single: async () => ({
                data: null,
                error: state.clientInsertError,
              }),
            }),
          };
        }
        state.insertedClient = row as Row;
        return {
          select: () => ({
            single: async () => ({
              data: { id: 'demo-client-uuid' },
              error: null,
            }),
          }),
        };
      }

      if (table === 'sessions') {
        if (state.sessionInsertError) {
          return {
            select: () => ({
              single: async () => ({
                data: null,
                error: state.sessionInsertError,
              }),
            }),
          };
        }
        const i = state.insertedSessions.length;
        state.insertedSessions.push(row as Row);
        return {
          select: () => ({
            single: async () => ({
              data: { id: `session-uuid-${i}` },
              error: null,
            }),
          }),
        };
      }

      if (table === 'action_items') {
        const rows = Array.isArray(row) ? row : [row];
        state.insertedItems.push(...rows);
        return {
          select: async () => ({
            data: rows.map((r, i) => ({
              id: `item-uuid-${i}`,
              session_id: r.session_id,
              description: r.description,
              completed: r.completed,
            })),
            error: null,
          }),
        };
      }

      if (table === 'coach_briefs') {
        if (state.briefInsertError) {
          return Promise.resolve({ error: state.briefInsertError });
        }
        state.insertedBrief = row as Row;
        return Promise.resolve({ error: null });
      }

      return Promise.resolve({ error: null });
    },
  };

  // action_items.insert returns the chain directly; satisfies thenable consumers.
  return builder;
}

const mockSupabaseClient = {
  from: jest.fn(fromBuilder),
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: () => mockSupabaseClient,
}));

import { seedDemoClient } from '../seed-demo-client';

describe('seedDemoClient', () => {
  beforeEach(() => {
    resetState();
    mockGenerateEmbedding.mockReset();
    mockGenerateEmbedding.mockResolvedValue(new Array(1536).fill(0.01));
    mockSupabaseClient.from.mockClear();
  });

  it('returns alreadySeeded when user already has an is_demo client', async () => {
    state.existingDemoClient = { id: 'existing-demo-uuid' };

    const res = await seedDemoClient('user-1');

    expect(res).toEqual({
      clientId: 'existing-demo-uuid',
      alreadySeeded: true,
      sessionsCreated: 0,
      actionItemsCreated: 0,
      briefCreated: false,
    });
    expect(mockGenerateEmbedding).not.toHaveBeenCalled();
  });

  it('inserts 1 client + 4 sessions + 8 action items + 1 brief on first run', async () => {
    const res = await seedDemoClient('user-1');

    expect(res.alreadySeeded).toBe(false);
    expect(res.clientId).toBe('demo-client-uuid');
    expect(res.sessionsCreated).toBe(4);
    expect(res.actionItemsCreated).toBe(8);
    expect(res.briefCreated).toBe(true);

    // Client row has is_demo + ai_intelligence_strip
    expect(state.insertedClient).toMatchObject({
      user_id: 'user-1',
      name: 'Alex Rivera',
      is_demo: true,
    });
    expect(state.insertedClient?.ai_intelligence_strip).toBeDefined();

    // 4 sessions, all linked to demo client, all status=complete
    expect(state.insertedSessions).toHaveLength(4);
    state.insertedSessions.forEach(s => {
      expect(s.client_id).toBe('demo-client-uuid');
      expect(s.user_id).toBe('user-1');
      expect(s.status).toBe('complete');
      expect(s.source).toBe('manual');
      // Embedding stored as JSON-stringified array (Story 3 pattern)
      expect(typeof s.embedding).toBe('string');
    });

    // Embedding called once per session
    expect(mockGenerateEmbedding).toHaveBeenCalledTimes(4);

    // 8 action items, mix of completed and not
    expect(state.insertedItems).toHaveLength(8);
    const completedCount = state.insertedItems.filter(i => i.completed).length;
    expect(completedCount).toBeGreaterThan(0);
    expect(completedCount).toBeLessThan(8);

    // Brief inserted with content + null calendar_event_id (manual brief)
    expect(state.insertedBrief).toMatchObject({
      user_id: 'user-1',
      client_id: 'demo-client-uuid',
      calendar_event_id: null,
      generation_status: 'ok',
    });
    expect(state.insertedBrief?.content).toBeDefined();
  });

  it('falls back to zero-vector embedding when AI service throws', async () => {
    mockGenerateEmbedding.mockRejectedValue(new Error('AI down'));

    const res = await seedDemoClient('user-1');

    expect(res.sessionsCreated).toBe(4);
    expect(mockGenerateEmbedding).toHaveBeenCalledTimes(4);
    // Each stored embedding is a 1536-length zero vector
    state.insertedSessions.forEach(s => {
      const arr = JSON.parse(s.embedding as string);
      expect(arr).toHaveLength(1536);
      expect(arr.every((x: number) => x === 0)).toBe(true);
    });
  });

  it('returns briefCreated=false but still succeeds if brief insert errors', async () => {
    state.briefInsertError = { message: 'brief failed' };

    const res = await seedDemoClient('user-1');

    expect(res.clientId).toBe('demo-client-uuid');
    expect(res.sessionsCreated).toBe(4);
    expect(res.actionItemsCreated).toBe(8);
    expect(res.briefCreated).toBe(false);
  });

  it('throws when client insert fails (fatal)', async () => {
    state.clientInsertError = { message: 'client insert failed' };

    await expect(seedDemoClient('user-1')).rejects.toThrow(
      /failed to insert client/
    );
    expect(state.insertedSessions).toHaveLength(0);
  });

  it('handles 23505 unique violation by returning the winning concurrent demo as alreadySeeded', async () => {
    // Pre-insert idempotency check returns null (race: both calls saw empty)
    state.existingDemoClient = null;
    // Insert hits the UNIQUE partial index from migration 031
    state.clientInsertError = { code: '23505', message: 'duplicate key' };
    // Post-conflict re-fetch finds the row inserted by the concurrent call
    state.postConflictExisting = { id: 'winner-demo-uuid' };

    const res = await seedDemoClient('user-1');

    expect(res).toEqual({
      clientId: 'winner-demo-uuid',
      alreadySeeded: true,
      sessionsCreated: 0,
      actionItemsCreated: 0,
      briefCreated: false,
    });
    // We should NOT have proceeded to insert sessions
    expect(state.insertedSessions).toHaveLength(0);
  });
});
