/**
 * Integration tests — POST /api/gladia/webhook (Story 6.3)
 */

import { POST } from '../route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/services/transcription/verify-gladia-callback', () => ({
  verifyGladiaCallbackToken: jest.fn(),
}));
jest.mock('@/lib/sessions/process-recall-transcript', () => ({
  handleGladiaDone: jest.fn(),
  runGladiaFailureRecovery: jest.fn(),
}));

const mockMaybeSingle = jest.fn();
jest.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: mockMaybeSingle }),
      }),
    }),
  }),
}));

import { verifyGladiaCallbackToken } from '@/lib/services/transcription/verify-gladia-callback';
import {
  handleGladiaDone,
  runGladiaFailureRecovery,
} from '@/lib/sessions/process-recall-transcript';

const mockVerify = verifyGladiaCallbackToken as jest.Mock;
const mockHandleDone = handleGladiaDone as jest.Mock;
const mockFailure = runGladiaFailureRecovery as jest.Mock;

function call(body: unknown, token = 'tok') {
  const init: { method: string; body?: string } = { method: 'POST' };
  init.body = typeof body === 'string' ? body : JSON.stringify(body);
  return POST(
    new NextRequest(`http://localhost/api/gladia/webhook?token=${token}`, init)
  );
}

const SUCCESS_PAYLOAD = {
  id: 'job-123',
  event: 'transcription.success',
  payload: {
    transcription: {
      utterances: [
        { speaker: 0, text: 'Hello.', start: 0, end: 1, confidence: 0.9 },
        { speaker: 1, text: 'Hi.', start: 1, end: 2, confidence: 0.9 },
      ],
    },
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  mockVerify.mockReturnValue(true);
});

describe('POST /api/gladia/webhook', () => {
  it('rejects an invalid callback token with 401', async () => {
    mockVerify.mockReturnValue(false);
    const res = await call(SUCCESS_PAYLOAD);
    expect(res.status).toBe(401);
    expect(mockHandleDone).not.toHaveBeenCalled();
  });

  it('rejects malformed JSON with 400', async () => {
    const res = await call('}{ not json');
    expect(res.status).toBe(400);
  });

  it('rejects a payload missing the event discriminator with 400', async () => {
    const res = await call({ id: 'job-123' });
    expect(res.status).toBe(400);
  });

  it('returns 200 without dispatching when the job id is unknown', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null });
    const res = await call(SUCCESS_PAYLOAD);
    expect(res.status).toBe(200);
    expect(mockHandleDone).not.toHaveBeenCalled();
  });

  it('on transcription.success runs the pipeline with the parsed utterances', async () => {
    mockMaybeSingle.mockResolvedValue({ data: { id: 'rs-1' } });
    const res = await call(SUCCESS_PAYLOAD);
    expect(res.status).toBe(200);
    expect(mockHandleDone).toHaveBeenCalledWith(
      'rs-1',
      [
        { speaker: 0, text: 'Hello.', start: 0, end: 1 },
        { speaker: 1, text: 'Hi.', start: 1, end: 2 },
      ],
      expect.anything()
    );
    expect(mockFailure).not.toHaveBeenCalled();
  });

  it('on transcription.error runs failure recovery', async () => {
    mockMaybeSingle.mockResolvedValue({ data: { id: 'rs-1' } });
    const res = await call({ id: 'job-123', event: 'transcription.error' });
    expect(res.status).toBe(200);
    expect(mockFailure).toHaveBeenCalledWith(
      'rs-1',
      expect.any(String),
      expect.anything()
    );
    expect(mockHandleDone).not.toHaveBeenCalled();
  });
});
