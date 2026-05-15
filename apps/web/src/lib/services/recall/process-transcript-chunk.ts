/**
 * Streaming transcript chunk processing (Story 6.2b).
 *
 * Write path: appendTranscriptChunk -> atomic Postgres RPC (dedup + append).
 * Read path: normalizeChunks -> sort + dedup, since Recall webhook events can
 * arrive out of order and be re-delivered. Every reader normalizes rather
 * than trusting stored array order.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { TranscriptChunk } from '@meetsolis/shared';

/**
 * Atomic dedup + append of one finalized chunk into sessions.transcript_chunks.
 * Matches the sessions row by recall_session_id. No-op if the row does not
 * exist yet — callers must lazy-create the sessions row first.
 */
export async function appendTranscriptChunk(
  recallSessionId: string,
  chunk: TranscriptChunk,
  supabase: SupabaseClient
): Promise<void> {
  const { error } = await supabase.rpc('append_transcript_chunk', {
    p_recall_session_id: recallSessionId,
    p_chunk: chunk,
  });
  if (error) {
    throw new Error(`appendTranscriptChunk failed: ${error.message}`);
  }
}

/**
 * Sort chunks chronologically and drop duplicates (same start_ms + speaker).
 * Pure — safe to call on every read.
 */
export function normalizeChunks(chunks: TranscriptChunk[]): TranscriptChunk[] {
  const sorted = [...chunks].sort((a, b) => a.start_ms - b.start_ms);
  const seen = new Set<string>();
  const out: TranscriptChunk[] = [];
  for (const c of sorted) {
    const key = `${c.start_ms}:${c.speaker}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }
  return out;
}

/** Speaker display label — real name if the platform exposed it, else "Speaker N". */
export function speakerLabel(chunk: TranscriptChunk): string {
  return chunk.speaker_name ?? `Speaker ${chunk.speaker}`;
}

/**
 * Concatenate chunks into a plain-text transcript.
 * Format: "[Speaker 0] hello\n[Alice] hi\n..."
 */
export function concatTranscriptText(chunks: TranscriptChunk[]): string {
  return normalizeChunks(chunks)
    .map(c => `[${speakerLabel(c)}] ${c.text}`)
    .join('\n');
}
