/**
 * Zod schema + mapper for Recall.ai `transcript.data` real-time events
 * (Story 6.2b).
 *
 * Payload is doubly-nested: `data.data.words[]`. Timestamps are float
 * seconds relative to recording start; `end_timestamp` can be null.
 */

import { z } from 'zod';
import type { TranscriptChunk } from '@meetsolis/shared';

const RelativeTimestamp = z.object({ relative: z.number() });

const TranscriptWord = z.object({
  text: z.string(),
  start_timestamp: RelativeTimestamp,
  end_timestamp: RelativeTimestamp.nullable(),
});

const TranscriptDataInner = z.object({
  words: z.array(TranscriptWord),
  participant: z.object({
    id: z.number().int(),
    name: z.string().nullish(),
  }),
});

export const RecallTranscriptDataEventSchema = z.object({
  event: z.literal('transcript.data'),
  data: z.object({
    data: TranscriptDataInner,
    bot: z.object({ id: z.string() }),
    recording: z.object({ id: z.string() }).optional(),
  }),
});

export type RecallTranscriptDataEvent = z.infer<
  typeof RecallTranscriptDataEventSchema
>;

/**
 * Collapse a validated transcript.data event into one stored TranscriptChunk.
 * Returns null when the event carries no usable words.
 */
export function mapEventToChunk(
  event: RecallTranscriptDataEvent
): TranscriptChunk | null {
  const inner = event.data.data;
  const { words } = inner;
  if (words.length === 0) return null;

  const text = words
    .map(w => w.text)
    .join(' ')
    .trim();
  if (!text) return null;

  const first = words[0];
  const last = words[words.length - 1];
  const startRel = first.start_timestamp.relative;
  const endRel = last.end_timestamp?.relative ?? last.start_timestamp.relative;

  return {
    speaker: inner.participant.id,
    speaker_name: inner.participant.name ?? null,
    text,
    start_ms: Math.round(startRel * 1000),
    end_ms: Math.round(endRel * 1000),
  };
}
