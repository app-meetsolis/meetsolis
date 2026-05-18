/**
 * Deepgram batch (pre-recorded) diarized transcription (Story 6.3).
 *
 * The fallback transcription path for bot recordings when Gladia is not
 * configured. Unlike DeepgramTranscriptionService — which flattens the result
 * into a single text blob — this returns the structured per-speaker utterances
 * the bot pipeline needs (handleGladiaDone expects DiarizedUtterance[]).
 *
 * Deepgram and Gladia produce the same DiarizedUtterance[] shape, so the
 * downstream pipeline (speaker mapping, summary, reassignment UI) is identical
 * regardless of which provider ran.
 */

import { config } from '@/lib/config/env';
import type { DiarizedUtterance } from '@meetsolis/shared';

/** Deepgram utterance shape (subset) — present when diarize + utterances on. */
interface DeepgramUtterance {
  speaker?: number;
  transcript: string;
  start: number;
  end: number;
}

/**
 * Transcribe a recording URL with Deepgram Nova-2, diarized.
 * Throws if the API key is missing or the API call fails — the caller
 * (transcribeBotRecording) routes that into the failure-recovery fallback.
 */
export async function transcribeRecordingWithDeepgram(
  audioUrl: string
): Promise<DiarizedUtterance[]> {
  const apiKey = config.transcription.deepgramApiKey;
  if (!apiKey) {
    throw new Error('DEEPGRAM_API_KEY is not configured');
  }

  const res = await fetch(
    'https://api.deepgram.com/v1/listen?model=nova-2&diarize=true&punctuate=true&smart_format=true&utterances=true',
    {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: audioUrl }),
    }
  );

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Deepgram API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  const utterances: DeepgramUtterance[] = data?.results?.utterances ?? [];

  return utterances
    .filter(u => u.transcript?.trim())
    .map(u => ({
      speaker: u.speaker ?? 0,
      text: u.transcript,
      start: u.start,
      end: u.end,
    }));
}
