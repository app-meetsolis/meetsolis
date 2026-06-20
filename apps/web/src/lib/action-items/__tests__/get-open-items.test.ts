import {
  getOpenItemsForClient,
  getOpenItemsAcrossClients,
} from '../get-open-items';

// Captures the last select() string so tests can assert the PostgREST embed
// form (guards against DATA-001: an aliased embed that errors on the live DB).
let lastSelect = '';

// Chainable + awaitable query stub: eq/neq return self, awaiting resolves data.
function makeQuery(result: { data: unknown; error: unknown }) {
  const q: Record<string, unknown> = {};
  q.select = (s: string) => {
    lastSelect = s;
    return q;
  };
  q.eq = jest.fn(() => q);
  q.neq = jest.fn(() => q);
  q.then = (resolve: (v: unknown) => unknown) => resolve(result);
  return q;
}

const mockFrom = jest.fn();
const mockRpc = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ from: mockFrom, rpc: mockRpc })),
}));

jest.mock('@/lib/config/env', () => ({
  config: {
    supabase: { url: 'https://test.supabase.co', serviceRoleKey: 'test-key' },
  },
}));

function row(over: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'a1',
    description: 'Delegate budget review',
    assignee: 'client',
    session_id: 's1',
    client_id: 'c1',
    sessions: { session_date: '2026-04-12', title: 'Session 4' },
    clients: { name: 'Marcus' },
    ...over,
  };
}

describe('getOpenItemsForClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRpc.mockResolvedValue({ data: 3 });
  });

  it('embeds sessions/clients with the unaliased PostgREST form (DATA-001 guard)', async () => {
    mockFrom.mockReturnValue(makeQuery({ data: [row()], error: null }));
    await getOpenItemsForClient('c1');
    // Aliased `table:column(...)` errors on the live DB; require the bare form.
    expect(lastSelect).toMatch(/\bsessions\(/);
    expect(lastSelect).toMatch(/\bclients\(/);
    expect(lastSelect).not.toMatch(/sessions:session_id|clients:client_id/);
  });

  it('maps rows to OpenActionItem with computed open_session_count', async () => {
    mockFrom.mockReturnValue(makeQuery({ data: [row()], error: null }));
    const items = await getOpenItemsForClient('c1');

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      id: 'a1',
      assignee: 'client',
      source_session_id: 's1',
      source_session_date: '2026-04-12',
      source_session_title: 'Session 4',
      open_session_count: 3,
      client_name: 'Marcus',
    });
  });

  it('sorts by source session date ascending (oldest first)', async () => {
    mockFrom.mockReturnValue(
      makeQuery({
        data: [
          row({
            id: 'newer',
            sessions: { session_date: '2026-05-01', title: 'S5' },
          }),
          row({
            id: 'older',
            sessions: { session_date: '2026-03-01', title: 'S3' },
          }),
        ],
        error: null,
      })
    );
    const items = await getOpenItemsForClient('c1');
    expect(items.map(i => i.id)).toEqual(['older', 'newer']);
  });

  it('does not call the SQL fn for items without a source session', async () => {
    mockFrom.mockReturnValue(
      makeQuery({
        data: [row({ session_id: null, sessions: null })],
        error: null,
      })
    );
    const items = await getOpenItemsForClient('c1');
    expect(mockRpc).not.toHaveBeenCalled();
    expect(items[0].open_session_count).toBe(0);
    expect(items[0].source_session_date).toBeNull();
  });

  it('returns [] on query error', async () => {
    mockFrom.mockReturnValue(
      makeQuery({ data: null, error: { message: 'boom' } })
    );
    expect(await getOpenItemsForClient('c1')).toEqual([]);
  });
});

describe('getOpenItemsAcrossClients', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRpc.mockResolvedValue({ data: 1 });
  });

  it('aggregates totalCount, clientsAffected, and top 5 items', async () => {
    const rows = Array.from({ length: 7 }, (_, i) =>
      row({
        id: `a${i}`,
        client_id: i < 4 ? 'c1' : 'c2',
        sessions: { session_date: `2026-0${(i % 9) + 1}-01`, title: `S${i}` },
      })
    );
    mockFrom.mockReturnValue(makeQuery({ data: rows, error: null }));

    const res = await getOpenItemsAcrossClients('user-1');
    expect(res.totalCount).toBe(7);
    expect(res.clientsAffected).toBe(2);
    expect(res.topItems).toHaveLength(5);
  });

  it('returns empty aggregate on error', async () => {
    mockFrom.mockReturnValue(
      makeQuery({ data: null, error: { message: 'x' } })
    );
    const res = await getOpenItemsAcrossClients('user-1');
    expect(res).toEqual({ totalCount: 0, topItems: [], clientsAffected: 0 });
  });
});
