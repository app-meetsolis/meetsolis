/**
 * Unit tests — Deepgram batch diarized transcription (Story 6.3)
 */

jest.mock('@/lib/config/env', () => ({
  config: { transcription: { deepgramApiKey: 'dg-key' as string | undefined } },
}));

import { config } from '@/lib/config/env';
import { transcribeRecordingWithDeepgram } from '../deepgram-batch';

const setKey = (v: string | undefined) => {
  (
    config as { transcription: { deepgramApiKey: string | undefined } }
  ).transcription.deepgramApiKey = v;
};

function mockFetch(ok: boolean, body: unknown) {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    json: async () => body,
    text: async () => JSON.stringify(body),
  }) as unknown as typeof fetch;
}

beforeEach(() => setKey('dg-key'));

describe('transcribeRecordingWithDeepgram', () => {
  it('maps Deepgram utterances to DiarizedUtterance[]', async () => {
    mockFetch(true, {
      results: {
        utterances: [
          { speaker: 0, transcript: 'Hello there.', start: 0, end: 1.5 },
          { speaker: 1, transcript: 'Hi back.', start: 1.6, end: 2.4 },
        ],
      },
    });

    const out = await transcribeRecordingWithDeepgram('https://audio/x.mp3');

    expect(out).toEqual([
      { speaker: 0, text: 'Hello there.', start: 0, end: 1.5 },
      { speaker: 1, text: 'Hi back.', start: 1.6, end: 2.4 },
    ]);
  });

  it('defaults a missing speaker index to 0', async () => {
    mockFetch(true, {
      results: {
        utterances: [{ transcript: 'No speaker field.', start: 0, end: 1 }],
      },
    });
    const out = await transcribeRecordingWithDeepgram('https://audio/x.mp3');
    expect(out[0].speaker).toBe(0);
  });

  it('drops blank utterances', async () => {
    mockFetch(true, {
      results: {
        utterances: [
          { speaker: 0, transcript: '   ', start: 0, end: 1 },
          { speaker: 1, transcript: 'real', start: 1, end: 2 },
        ],
      },
    });
    const out = await transcribeRecordingWithDeepgram('https://audio/x.mp3');
    expect(out).toHaveLength(1);
    expect(out[0].text).toBe('real');
  });

  it('throws when no API key is configured', async () => {
    setKey(undefined);
    await expect(
      transcribeRecordingWithDeepgram('https://audio/x.mp3')
    ).rejects.toThrow('DEEPGRAM_API_KEY');
  });

  it('throws on a non-ok Deepgram response', async () => {
    mockFetch(false, { err: 'boom' });
    await expect(
      transcribeRecordingWithDeepgram('https://audio/x.mp3')
    ).rejects.toThrow('Deepgram API error 500');
  });
});
