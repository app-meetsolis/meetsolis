/**
 * Unit tests — bot transcription router (Story 6.3)
 *
 * Focus: the 3-way routing of transcribeBotRecording (mock / Deepgram / Gladia)
 * and idempotency.
 */

jest.mock('@/lib/config/env', () => ({
  config: {
    useMockServices: false,
    gladia: {
      apiKey: undefined as string | undefined,
      baseUrl: 'https://api.gladia.io/v2',
      webhookSecret: undefined as string | undefined,
    },
    app: { env: 'test', url: 'http://localhost:3000' },
  },
}));

const mockHandleDone = jest.fn();
const mockFailure = jest.fn();
const mockDeepgram = jest.fn();

jest.mock('@/lib/sessions/process-recall-transcript', () => ({
  handleGladiaDone: (...a: unknown[]) => mockHandleDone(...a),
  runGladiaFailureRecovery: (...a: unknown[]) => mockFailure(...a),
}));
jest.mock('../deepgram-batch', () => ({
  transcribeRecordingWithDeepgram: (...a: unknown[]) => mockDeepgram(...a),
}));

import { config } from '@/lib/config/env';
import { transcribeBotRecording, DEEPGRAM_JOB_PREFIX } from '../gladia-service';

type Cfg = {
  useMockServices: boolean;
  gladia: { apiKey: string | undefined };
};
const cfg = config as unknown as Cfg;

/** Supabase stub — one recall_sessions row; records update() calls. */
function mockSupabase(row: {
  raw_recording_url: unknown;
  gladia_job_id: unknown;
}) {
  const updates: unknown[] = [];
  const builder: Record<string, unknown> = {
    select: () => builder,
    eq: () => builder,
    maybeSingle: () => Promise.resolve({ data: row, error: null }),
    update: (v: unknown) => {
      updates.push(v);
      return { eq: () => Promise.resolve({ error: null }) };
    },
  };
  return { client: { from: () => builder } as never, updates };
}

beforeEach(() => {
  jest.clearAllMocks();
  cfg.useMockServices = false;
  cfg.gladia.apiKey = undefined;
});

describe('transcribeBotRecording', () => {
  it('Deepgram path — no GLADIA key: transcribes the real audio and runs the pipeline', async () => {
    mockDeepgram.mockResolvedValue([
      { speaker: 0, text: 'Hi', start: 0, end: 1 },
    ]);
    const { client, updates } = mockSupabase({
      raw_recording_url: 'https://audio/x.mp3',
      gladia_job_id: null,
    });

    await transcribeBotRecording('rs-1', client);

    expect(mockDeepgram).toHaveBeenCalledWith('https://audio/x.mp3');
    expect(mockHandleDone).toHaveBeenCalledWith(
      'rs-1',
      [{ speaker: 0, text: 'Hi', start: 0, end: 1 }],
      expect.anything()
    );
    expect(mockFailure).not.toHaveBeenCalled();
    // Idempotency marker stored before transcription.
    expect(updates).toContainEqual({
      gladia_job_id: `${DEEPGRAM_JOB_PREFIX}rs-1`,
      status: 'transcribing',
    });
  });

  it('Deepgram path — failure routes into failure-recovery', async () => {
    mockDeepgram.mockRejectedValue(new Error('Deepgram 500'));
    const { client } = mockSupabase({
      raw_recording_url: 'https://audio/x.mp3',
      gladia_job_id: null,
    });

    await transcribeBotRecording('rs-1', client);

    expect(mockHandleDone).not.toHaveBeenCalled();
    expect(mockFailure).toHaveBeenCalledWith(
      'rs-1',
      expect.stringContaining('Deepgram'),
      expect.anything()
    );
  });

  it('mock mode — runs the fixture, never calls Deepgram or Gladia', async () => {
    cfg.useMockServices = true;
    const { client } = mockSupabase({
      raw_recording_url: 'https://audio/x.mp3',
      gladia_job_id: null,
    });

    await transcribeBotRecording('rs-1', client);

    expect(mockDeepgram).not.toHaveBeenCalled();
    expect(mockHandleDone).toHaveBeenCalled(); // fixture utterances
  });

  it('idempotent — skips when a job id is already set', async () => {
    const { client } = mockSupabase({
      raw_recording_url: 'https://audio/x.mp3',
      gladia_job_id: 'deepgram-rs-1',
    });

    await transcribeBotRecording('rs-1', client);

    expect(mockDeepgram).not.toHaveBeenCalled();
    expect(mockHandleDone).not.toHaveBeenCalled();
  });

  it('skips when there is no recording URL', async () => {
    const { client } = mockSupabase({
      raw_recording_url: null,
      gladia_job_id: null,
    });

    await transcribeBotRecording('rs-1', client);

    expect(mockDeepgram).not.toHaveBeenCalled();
  });
});
