/**
 * Integration tests — /api/recall/sessions/[id]/speakers (Story 6.3)
 * Focus: PATCH re-runs the summary on the coach-corrected transcript.
 */

import { PATCH, GET } from '../route';
import { NextRequest } from 'next/server';

jest.mock('@clerk/nextjs/server', () => ({ auth: jest.fn() }));
jest.mock('@/lib/helpers/user', () => ({ getInternalUserId: jest.fn() }));
jest.mock('@/lib/config/env', () => ({
  config: { supabase: { url: 'x', serviceRoleKey: 'y' } },
}));

const mockRunSummarize = jest.fn();
const mockMaybeAuto = jest.fn();
jest.mock('@/lib/sessions/summarize-session', () => ({
  runSummarize: (...a: unknown[]) => mockRunSummarize(...a),
}));
jest.mock('@/lib/sessions/generate-action-items', () => ({
  maybeAutoGenerateActionItems: (...a: unknown[]) => mockMaybeAuto(...a),
}));

/** FIFO Supabase stub — single() pulls per table; update() is recorded. */
const responses: Record<string, Array<{ data: unknown }>> = {};
const updates: Array<{ table: string; values: unknown }> = [];
jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: (table: string) => {
      const builder: Record<string, unknown> = {
        select: () => builder,
        eq: () => builder,
        single: () =>
          Promise.resolve(responses[table]?.shift() ?? { data: null }),
        update: (values: unknown) => {
          updates.push({ table, values });
          return { eq: () => Promise.resolve({ error: null }) };
        },
      };
      return builder;
    },
  }),
}));

import { auth } from '@clerk/nextjs/server';
import { getInternalUserId } from '@/lib/helpers/user';

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockUserId = getInternalUserId as jest.MockedFunction<
  typeof getInternalUserId
>;

const VALID_ID = '11111111-1111-1111-1111-111111111111';
type AuthReturn = Awaited<ReturnType<typeof auth>>;

function patch(id: string, body: unknown) {
  return PATCH(
    new NextRequest(`http://localhost/api/recall/sessions/${id}/speakers`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
    { params: { id } }
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  updates.length = 0;
  for (const k of Object.keys(responses)) delete responses[k];
  mockAuth.mockResolvedValue({ userId: 'clerk_1' } as AuthReturn);
  mockUserId.mockResolvedValue('user_1');
  mockRunSummarize.mockResolvedValue('complete');
});

describe('PATCH /api/recall/sessions/[id]/speakers', () => {
  it('400 on an invalid session id', async () => {
    const res = await patch('not-a-uuid', { speaker_map: { speaker_0: 'X' } });
    expect(res.status).toBe(400);
  });

  it('401 when unauthenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null } as AuthReturn);
    const res = await patch(VALID_ID, { speaker_map: { speaker_0: 'X' } });
    expect(res.status).toBe(401);
  });

  it('400 when speaker_map is missing/invalid', async () => {
    const res = await patch(VALID_ID, { wrong: true });
    expect(res.status).toBe(400);
  });

  it('404 when the session is not owned by the caller', async () => {
    responses.sessions = [
      { data: { user_id: 'other', recall_session_id: 'rs-1' } },
    ];
    const res = await patch(VALID_ID, { speaker_map: { speaker_0: 'Coach' } });
    expect(res.status).toBe(404);
  });

  it('reformats the transcript and re-runs the summary on success', async () => {
    responses.sessions = [
      { data: { user_id: 'user_1', recall_session_id: 'rs-1' } },
    ];
    responses.recall_sessions = [
      {
        data: {
          diarized_transcript: [
            { speaker: 0, text: 'Hello.', start: 0, end: 1 },
            { speaker: 1, text: 'Hi.', start: 1, end: 2 },
          ],
        },
      },
    ];

    const res = await patch(VALID_ID, {
      speaker_map: { speaker_0: 'Coach', speaker_1: 'Sarah Chen' },
    });
    expect(res.status).toBe(200);

    // speaker_map persisted + review flag cleared
    expect(updates).toContainEqual({
      table: 'recall_sessions',
      values: {
        speaker_map: { speaker_0: 'Coach', speaker_1: 'Sarah Chen' },
        speaker_review_needed: false,
      },
    });

    // transcript reformatted with the corrected labels
    const sessionUpdate = updates.find(u => u.table === 'sessions');
    const values = sessionUpdate!.values as Record<string, string>;
    expect(values.transcript_text).toContain('[Coach]: Hello.');
    expect(values.transcript_text).toContain('[Sarah Chen]: Hi.');
    expect(values.source).toBe('recall_ai');

    // summary regeneration triggered
    expect(mockRunSummarize).toHaveBeenCalledWith(VALID_ID, 'user_1');
  });

  it('409 when the session has no diarized transcript to re-map', async () => {
    responses.sessions = [
      { data: { user_id: 'user_1', recall_session_id: 'rs-1' } },
    ];
    responses.recall_sessions = [{ data: { diarized_transcript: [] } }];

    const res = await patch(VALID_ID, {
      speaker_map: { speaker_0: 'Coach' },
    });
    expect(res.status).toBe(409);
    expect(mockRunSummarize).not.toHaveBeenCalled();
  });
});

describe('GET /api/recall/sessions/[id]/speakers', () => {
  it('returns the speaker map + review state for a bot session', async () => {
    responses.sessions = [
      {
        data: {
          user_id: 'user_1',
          recall_session_id: 'rs-1',
          source: 'recall_ai',
        },
      },
    ];
    responses.recall_sessions = [
      {
        data: {
          speaker_map: { speaker_0: 'Coach' },
          speaker_review_needed: true,
          error_reason: '3 speakers detected',
          client_id: 'c1',
        },
      },
    ];
    responses.clients = [{ data: { name: 'Sarah Chen' } }];

    const res = await GET(
      new NextRequest(
        `http://localhost/api/recall/sessions/${VALID_ID}/speakers`
      ),
      { params: { id: VALID_ID } }
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.speaker_review_needed).toBe(true);
    expect(body.client_name).toBe('Sarah Chen');
  });
});
