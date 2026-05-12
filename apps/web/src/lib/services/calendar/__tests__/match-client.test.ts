/**
 * @jest-environment node
 */
import { matchEventToClient } from '../match-client';

function mockSupabase(clients: Array<{ id: string; email: string | null }>) {
  const builder = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    not: jest.fn().mockResolvedValue({ data: clients, error: null }),
  };
  return {
    from: jest.fn().mockReturnValue(builder),
  } as unknown as Parameters<typeof matchEventToClient>[0];
}

describe('matchEventToClient', () => {
  it('returns null on empty attendee list', async () => {
    const sb = mockSupabase([{ id: 'c1', email: 'sarah@example.com' }]);
    expect(await matchEventToClient(sb, 'u1', [])).toBeNull();
  });

  it('returns null when no client emails match', async () => {
    const sb = mockSupabase([{ id: 'c1', email: 'sarah@example.com' }]);
    expect(
      await matchEventToClient(sb, 'u1', ['stranger@other.com'])
    ).toBeNull();
  });

  it('returns first matching client_id', async () => {
    const sb = mockSupabase([
      { id: 'c1', email: 'sarah@example.com' },
      { id: 'c2', email: 'alex@example.com' },
    ]);
    expect(
      await matchEventToClient(sb, 'u1', ['noise@x.com', 'alex@example.com'])
    ).toBe('c2');
  });

  it('case-insensitive comparison', async () => {
    const sb = mockSupabase([{ id: 'c1', email: 'Sarah@Example.com' }]);
    expect(await matchEventToClient(sb, 'u1', ['SARAH@example.COM'])).toBe(
      'c1'
    );
  });

  it('skips clients with null emails', async () => {
    const sb = mockSupabase([
      { id: 'c1', email: null },
      { id: 'c2', email: 'alex@example.com' },
    ]);
    expect(await matchEventToClient(sb, 'u1', ['alex@example.com'])).toBe('c2');
  });

  it('trims whitespace from attendee emails', async () => {
    const sb = mockSupabase([{ id: 'c1', email: 'sarah@example.com' }]);
    expect(await matchEventToClient(sb, 'u1', ['  sarah@example.com  '])).toBe(
      'c1'
    );
  });
});
