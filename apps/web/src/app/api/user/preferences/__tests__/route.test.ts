import { GET, PATCH } from '../route';
import { NextRequest } from 'next/server';

jest.mock('@clerk/nextjs/server', () => ({ auth: jest.fn() }));
jest.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: jest.fn(),
}));
jest.mock('@/lib/helpers/user', () => ({ getInternalUserId: jest.fn() }));

import { auth } from '@clerk/nextjs/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getInternalUserId } from '@/lib/helpers/user';

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockGetSupabase = getSupabaseServerClient as jest.MockedFunction<
  typeof getSupabaseServerClient
>;
const mockGetInternalUserId = getInternalUserId as jest.MockedFunction<
  typeof getInternalUserId
>;

interface MakeSupabaseOpts {
  userRow?: Record<string, unknown> | null;
  prefRow?: Record<string, unknown> | null;
  usersUpdateError?: unknown;
  prefsUpsertError?: unknown;
}

function makeSupabase(opts: MakeSupabaseOpts = {}) {
  const {
    userRow = null,
    prefRow = null,
    usersUpdateError = null,
    prefsUpsertError = null,
  } = opts;
  return {
    from: jest.fn((table: string) => {
      if (table === 'users') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: userRow }),
          update: jest.fn(() => ({
            eq: jest.fn().mockResolvedValue({ error: usersUpdateError }),
          })),
        };
      }
      if (table === 'user_preferences') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest.fn().mockResolvedValue({ data: prefRow }),
          upsert: jest.fn().mockResolvedValue({ error: prefsUpsertError }),
        };
      }
      throw new Error(`Unexpected table: ${table}`);
    }),
  };
}

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/user/preferences', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

type AuthResult = Awaited<ReturnType<typeof auth>>;
const authed = (clerkUserId: string | null) =>
  ({ userId: clerkUserId }) as AuthResult;

describe('GET /api/user/preferences', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when unauthenticated', async () => {
    mockAuth.mockResolvedValue(authed(null));
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns merged users + user_preferences', async () => {
    mockAuth.mockResolvedValue(authed('clerk_1'));
    mockGetInternalUserId.mockResolvedValue('user_1');
    mockGetSupabase.mockReturnValue(
      makeSupabase({
        userRow: {
          email_notifications_enabled: false,
          timezone: 'Europe/London',
          auto_action_items_enabled: true,
        },
        prefRow: {
          auto_transcribe_enabled: false,
          coach_brief_window_minutes: 120,
          manual_transcription_provider: 'gladia',
        },
      }) as ReturnType<typeof getSupabaseServerClient>
    );
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toEqual({
      email_notifications_enabled: false,
      timezone: 'Europe/London',
      auto_action_items_enabled: true,
      auto_transcribe_enabled: false,
      coach_brief_window_minutes: 120,
      manual_transcription_provider: 'gladia',
    });
  });

  it('returns defaults when user_preferences row missing', async () => {
    mockAuth.mockResolvedValue(authed('clerk_1'));
    mockGetInternalUserId.mockResolvedValue('user_1');
    mockGetSupabase.mockReturnValue(
      makeSupabase({
        userRow: {},
        prefRow: null,
      }) as ReturnType<typeof getSupabaseServerClient>
    );
    const res = await GET();
    const body = await res.json();
    expect(body.auto_transcribe_enabled).toBe(true);
    expect(body.coach_brief_window_minutes).toBe(60);
    expect(body.manual_transcription_provider).toBe('deepgram');
  });
});

describe('PATCH /api/user/preferences', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when unauthenticated', async () => {
    mockAuth.mockResolvedValue(authed(null));
    const res = await PATCH(makeRequest({ timezone: 'UTC' }));
    expect(res.status).toBe(401);
  });

  it('returns 400 for empty body', async () => {
    mockAuth.mockResolvedValue(authed('clerk_1'));
    mockGetInternalUserId.mockResolvedValue('user_1');
    mockGetSupabase.mockReturnValue(
      makeSupabase() as ReturnType<typeof getSupabaseServerClient>
    );
    const res = await PATCH(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it('updates a users-table field (timezone)', async () => {
    mockAuth.mockResolvedValue(authed('clerk_1'));
    mockGetInternalUserId.mockResolvedValue('user_1');
    mockGetSupabase.mockReturnValue(
      makeSupabase() as ReturnType<typeof getSupabaseServerClient>
    );
    const res = await PATCH(makeRequest({ timezone: 'Asia/Tokyo' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it('updates a user_preferences-table field (auto_transcribe_enabled)', async () => {
    mockAuth.mockResolvedValue(authed('clerk_1'));
    mockGetInternalUserId.mockResolvedValue('user_1');
    mockGetSupabase.mockReturnValue(
      makeSupabase() as ReturnType<typeof getSupabaseServerClient>
    );
    const res = await PATCH(makeRequest({ auto_transcribe_enabled: false }));
    expect(res.status).toBe(200);
  });

  it('rejects coach_brief_window_minutes outside the IN-list (45)', async () => {
    mockAuth.mockResolvedValue(authed('clerk_1'));
    mockGetInternalUserId.mockResolvedValue('user_1');
    mockGetSupabase.mockReturnValue(
      makeSupabase() as ReturnType<typeof getSupabaseServerClient>
    );
    const res = await PATCH(makeRequest({ coach_brief_window_minutes: 45 }));
    expect(res.status).toBe(400);
  });

  it('accepts coach_brief_window_minutes 30/60/120/240', async () => {
    for (const v of [30, 60, 120, 240]) {
      mockAuth.mockResolvedValue(authed('clerk_1'));
      mockGetInternalUserId.mockResolvedValue('user_1');
      mockGetSupabase.mockReturnValue(
        makeSupabase() as ReturnType<typeof getSupabaseServerClient>
      );
      const res = await PATCH(makeRequest({ coach_brief_window_minutes: v }));
      expect(res.status).toBe(200);
    }
  });

  it('rejects manual_transcription_provider outside enum', async () => {
    mockAuth.mockResolvedValue(authed('clerk_1'));
    mockGetInternalUserId.mockResolvedValue('user_1');
    mockGetSupabase.mockReturnValue(
      makeSupabase() as ReturnType<typeof getSupabaseServerClient>
    );
    const res = await PATCH(
      makeRequest({ manual_transcription_provider: 'whisper' })
    );
    expect(res.status).toBe(400);
  });

  it('returns 207 when only user_preferences upsert fails', async () => {
    mockAuth.mockResolvedValue(authed('clerk_1'));
    mockGetInternalUserId.mockResolvedValue('user_1');
    mockGetSupabase.mockReturnValue(
      makeSupabase({
        prefsUpsertError: { message: 'boom' },
      }) as ReturnType<typeof getSupabaseServerClient>
    );
    const res = await PATCH(
      makeRequest({
        timezone: 'UTC',
        coach_brief_window_minutes: 60,
      })
    );
    expect(res.status).toBe(207);
    const body = await res.json();
    expect(body.failed).toEqual(['user_preferences']);
  });

  it('returns 500 when both updates fail', async () => {
    mockAuth.mockResolvedValue(authed('clerk_1'));
    mockGetInternalUserId.mockResolvedValue('user_1');
    mockGetSupabase.mockReturnValue(
      makeSupabase({
        usersUpdateError: { message: 'a' },
        prefsUpsertError: { message: 'b' },
      }) as ReturnType<typeof getSupabaseServerClient>
    );
    const res = await PATCH(
      makeRequest({
        timezone: 'UTC',
        coach_brief_window_minutes: 60,
      })
    );
    expect(res.status).toBe(500);
  });
});
