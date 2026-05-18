/**
 * Unit tests — Gladia failure-recovery fallback (Story 6.3)
 */

import {
  runGladiaFailureRecovery,
  handleGladiaDone,
} from '../process-recall-transcript';
import type { DiarizedUtterance } from '@meetsolis/shared';

const mockRunSummarize = jest.fn();
const mockMaybeAuto = jest.fn();
const mockSendFailEmail = jest.fn().mockResolvedValue({ success: true });

jest.mock('../summarize-session', () => ({
  runSummarize: (...a: unknown[]) => mockRunSummarize(...a),
}));
jest.mock('../generate-action-items', () => ({
  maybeAutoGenerateActionItems: (...a: unknown[]) => mockMaybeAuto(...a),
}));
jest.mock('@/lib/mail', () => ({
  sendTranscriptionFailedEmail: (...a: unknown[]) => mockSendFailEmail(...a),
}));

/**
 * Minimal Supabase stub. `responses` maps a table name to a FIFO queue of
 * `{ data }` consumed by single()/maybeSingle(). update().eq() always resolves.
 */
function mockSupabase(responses: Record<string, Array<{ data: unknown }>>) {
  const updates: Array<{ table: string; values: unknown }> = [];
  const from = (table: string) => {
    const builder: Record<string, unknown> = {
      select: () => builder,
      eq: () => builder,
      maybeSingle: () =>
        Promise.resolve(responses[table]?.shift() ?? { data: null }),
      single: () =>
        Promise.resolve(responses[table]?.shift() ?? { data: null }),
      update: (values: unknown) => {
        updates.push({ table, values });
        return { eq: () => Promise.resolve({ error: null }) };
      },
    };
    return builder;
  };
  return { client: { from } as never, updates };
}

beforeEach(() => jest.clearAllMocks());

describe('runGladiaFailureRecovery', () => {
  it('degraded path — summarizes the streaming transcript when one exists', async () => {
    mockRunSummarize.mockResolvedValue('complete');
    const { client, updates } = mockSupabase({
      recall_sessions: [{ data: { user_id: 'u1', client_id: 'c1' } }],
      sessions: [{ data: { id: 's1', transcript_text: 'streamed words' } }],
    });

    await runGladiaFailureRecovery('rs1', 'submit 5xx', client);

    // Summarized the existing streaming transcript…
    expect(mockRunSummarize).toHaveBeenCalledWith('s1', 'u1');
    expect(mockMaybeAuto).toHaveBeenCalled();
    // …and marked the recall_session done (degraded diarization, still useful).
    expect(updates).toContainEqual({
      table: 'recall_sessions',
      values: { status: 'done' },
    });
    // No coach email — they still got a summary.
    expect(mockSendFailEmail).not.toHaveBeenCalled();
  });

  it('hard failure — no transcript: marks transcription_failed and emails the coach', async () => {
    const { client, updates } = mockSupabase({
      recall_sessions: [{ data: { user_id: 'u1', client_id: 'c1' } }],
      sessions: [{ data: null }],
      users: [{ data: { email: 'coach@example.com', name: 'Pat Coach' } }],
      clients: [{ data: { name: 'Sarah Chen' } }],
    });

    await runGladiaFailureRecovery('rs1', 'submit 5xx', client);

    expect(mockRunSummarize).not.toHaveBeenCalled();
    expect(updates).toContainEqual({
      table: 'recall_sessions',
      values: { status: 'transcription_failed', error_reason: 'submit 5xx' },
    });
    expect(mockSendFailEmail).toHaveBeenCalledWith(
      'coach@example.com',
      'Pat Coach',
      'Sarah Chen'
    );
  });

  it('hard failure — empty streaming transcript counts as no transcript', async () => {
    const { client, updates } = mockSupabase({
      recall_sessions: [{ data: { user_id: 'u1', client_id: 'c1' } }],
      sessions: [{ data: { id: 's1', transcript_text: '   ' } }],
      users: [{ data: { email: 'coach@example.com', name: null } }],
      clients: [{ data: { name: 'Sarah Chen' } }],
    });

    await runGladiaFailureRecovery('rs1', 'gladia error', client);

    expect(mockRunSummarize).not.toHaveBeenCalled();
    expect(updates).toContainEqual({
      table: 'recall_sessions',
      values: { status: 'transcription_failed', error_reason: 'gladia error' },
    });
  });
});

describe('handleGladiaDone', () => {
  const UTTERANCES: DiarizedUtterance[] = [
    { speaker: 0, text: 'Welcome back.', start: 0, end: 2 },
    { speaker: 1, text: 'Thanks.', start: 2, end: 3 },
  ];

  it('updates the existing sessions row + runs summary — no new row created', async () => {
    mockRunSummarize.mockResolvedValue('complete');
    const { client, updates } = mockSupabase({
      recall_sessions: [
        { data: { client_id: 'c1' } }, // handleGladiaDone client lookup
        {
          data: {
            user_id: 'u1',
            diarized_transcript: UTTERANCES,
            speaker_map: { speaker_0: 'Coach', speaker_1: 'Sarah Chen' },
          },
        }, // processRecallTranscript reload
      ],
      clients: [{ data: { name: 'Sarah Chen' } }],
      sessions: [{ data: { id: 's1' } }], // existing row found — no insert
    });

    await handleGladiaDone('rs1', UTTERANCES, client);

    // Diarized transcript written to the EXISTING session row.
    const sessionUpdate = updates.find(u => u.table === 'sessions');
    expect(sessionUpdate).toBeDefined();
    const values = sessionUpdate!.values as Record<string, string>;
    expect(values.source).toBe('recall_ai');
    expect(values.transcript_text).toContain('[Coach]: Welcome back.');
    expect(values.transcript_text).toContain('[Sarah Chen]: Thanks.');

    // Summary ran on the resolved session.
    expect(mockRunSummarize).toHaveBeenCalledWith('s1', 'u1');

    // recall_session finalized: done + raw audio URL nulled.
    expect(updates).toContainEqual({
      table: 'recall_sessions',
      values: { status: 'done', raw_recording_url: null },
    });
  });

  it('marks summary_failed when summarization errors', async () => {
    mockRunSummarize.mockResolvedValue('error');
    const { client, updates } = mockSupabase({
      recall_sessions: [
        { data: { client_id: 'c1' } },
        {
          data: {
            user_id: 'u1',
            diarized_transcript: UTTERANCES,
            speaker_map: { speaker_0: 'Coach', speaker_1: 'Sarah Chen' },
          },
        },
      ],
      clients: [{ data: { name: 'Sarah Chen' } }],
      sessions: [{ data: { id: 's1' } }],
    });

    await handleGladiaDone('rs1', UTTERANCES, client);

    expect(updates).toContainEqual({
      table: 'recall_sessions',
      values: { status: 'summary_failed', raw_recording_url: null },
    });
  });
});
