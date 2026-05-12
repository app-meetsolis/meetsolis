/**
 * @jest-environment node
 */

jest.mock('@/lib/config', () => ({
  config: {
    security: {
      calendarTokenEncryptionKey: 'dGVzdC1rZXktbm90LXVzZWQtaW4tdGhpcy10ZXN0',
      cronSecret: 'test-cron-secret',
    },
    app: { env: 'test', url: 'http://localhost' },
  },
}));

jest.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
  }),
}));

import { POST } from '../route';
import { NextRequest } from 'next/server';

function makeReq(authHeader: string | null): NextRequest {
  const headers = new Headers();
  if (authHeader !== null) headers.set('authorization', authHeader);
  return new NextRequest('http://localhost/api/calendar/sync-all', {
    method: 'POST',
    headers,
  });
}

describe('POST /api/calendar/sync-all — CRON_SECRET auth', () => {
  it('rejects missing Authorization header', async () => {
    const res = await POST(makeReq(null));
    expect(res.status).toBe(401);
  });

  it('rejects wrong bearer token', async () => {
    const res = await POST(makeReq('Bearer wrong-secret'));
    expect(res.status).toBe(401);
  });

  it('accepts correct bearer token', async () => {
    const res = await POST(makeReq('Bearer test-cron-secret'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      processed: 0,
      succeeded: 0,
      failed: 0,
    });
  });
});
