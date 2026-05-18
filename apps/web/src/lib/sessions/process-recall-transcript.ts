/**
 * Bridge from Gladia diarized output into the existing summary pipeline
 * (Story 6.3).
 *
 * Story 6.2b already created the `sessions` row and streamed a live transcript
 * into it. Gladia re-transcribes the recording for a high-quality diarized
 * transcript — this module overwrites `sessions.transcript_text` with it and
 * re-runs the summary chain. The streaming transcript stays the live view;
 * Gladia produces the final one.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { DiarizedUtterance, SpeakerMap } from '@meetsolis/shared';
import { runSummarize } from '@/lib/sessions/summarize-session';
import { maybeAutoGenerateActionItems } from '@/lib/sessions/generate-action-items';
import { ensureSessionRow } from '@/lib/services/recall/ensure-session';
import { formatDiarizedTranscript } from '@/lib/sessions/format-diarized-transcript';
import { mapSpeakers } from '@/lib/sessions/map-speakers';
import { sendTranscriptionFailedEmail } from '@/lib/mail';

/** Resolve the `sessions` row id for a bot session, creating it if missing. */
async function resolveSessionId(
  recallSessionId: string,
  supabase: SupabaseClient
): Promise<string | null> {
  const { data: row } = await supabase
    .from('sessions')
    .select('id')
    .eq('recall_session_id', recallSessionId)
    .maybeSingle();
  if (row) return row.id as string;
  return ensureSessionRow(recallSessionId, supabase);
}

/**
 * Re-format the diarized transcript with the current speaker map and re-run
 * the summary + action-item chain. Shared by the Gladia webhook (initial run)
 * and the speaker-reassignment endpoint (coach-corrected re-run).
 *
 * Returns the summary status so callers can mark recall_sessions accordingly.
 */
export async function regenerateFromDiarized(
  sessionId: string,
  userId: string,
  utterances: DiarizedUtterance[],
  speakerMap: SpeakerMap,
  supabase: SupabaseClient
): Promise<'complete' | 'error' | 'skipped'> {
  const transcriptText = formatDiarizedTranscript(utterances, speakerMap);

  await supabase
    .from('sessions')
    .update({ transcript_text: transcriptText, source: 'recall_ai' })
    .eq('id', sessionId);

  const status = await runSummarize(sessionId, userId);
  if (status === 'complete') {
    await maybeAutoGenerateActionItems(sessionId, userId, supabase);
  }
  return status;
}

/**
 * Process a completed Gladia transcript: overwrite the streaming transcript
 * with the diarized one, then summarize. Reads diarized_transcript +
 * speaker_map already stored on recall_sessions.
 *
 * Returns the summary status; the caller owns the recall_sessions status.
 */
export async function processRecallTranscript(
  recallSessionId: string,
  supabase: SupabaseClient
): Promise<'complete' | 'error' | 'skipped'> {
  const { data: rs, error } = await supabase
    .from('recall_sessions')
    .select('user_id, diarized_transcript, speaker_map')
    .eq('id', recallSessionId)
    .maybeSingle();

  if (error || !rs) {
    console.error(
      `[recall:process-transcript] recall_session not found: ${recallSessionId}`
    );
    return 'error';
  }

  const utterances = (rs.diarized_transcript ?? []) as DiarizedUtterance[];
  const speakerMap = (rs.speaker_map ?? {}) as SpeakerMap;

  const sessionId = await resolveSessionId(recallSessionId, supabase);
  if (!sessionId) {
    console.error(
      `[recall:process-transcript] could not resolve sessions row for ${recallSessionId}`
    );
    return 'error';
  }

  return regenerateFromDiarized(
    sessionId,
    rs.user_id,
    utterances,
    speakerMap,
    supabase
  );
}

/**
 * Full handler for a successful Gladia transcription. Stores the diarized
 * transcript + speaker map, runs the summary pipeline, then finalizes the
 * recall_sessions row. Called by the Gladia webhook (`status:'done'`) and the
 * mock-mode submit path.
 */
export async function handleGladiaDone(
  recallSessionId: string,
  utterances: DiarizedUtterance[],
  supabase: SupabaseClient
): Promise<void> {
  const { data: rs } = await supabase
    .from('recall_sessions')
    .select('client_id')
    .eq('id', recallSessionId)
    .maybeSingle();

  if (!rs) {
    console.error(
      `[recall:gladia-done] recall_session not found: ${recallSessionId}`
    );
    return;
  }

  const { data: client } = await supabase
    .from('clients')
    .select('name')
    .eq('id', rs.client_id)
    .single();

  const mapping = mapSpeakers(utterances, client?.name ?? 'Client');

  await supabase
    .from('recall_sessions')
    .update({
      diarized_transcript: utterances,
      speaker_map: mapping.speaker_map,
      speaker_review_needed: mapping.speaker_review_needed,
      error_reason: mapping.note,
    })
    .eq('id', recallSessionId);

  const status = await processRecallTranscript(recallSessionId, supabase);

  // Gladia transcribed successfully — the raw audio signed URL is now stale.
  // 'summary_failed' lets the coach retry the summary from the dashboard.
  await supabase
    .from('recall_sessions')
    .update({
      status: status === 'error' ? 'summary_failed' : 'done',
      raw_recording_url: null,
    })
    .eq('id', recallSessionId);
}

/**
 * Failure-recovery fallback — invoked when Gladia submission fails 3× or the
 * Gladia webhook reports `status:'error'`.
 *
 *  - If a streaming transcript exists → summarize that instead (degraded
 *    diarization, but the coach still gets a summary). recall_sessions → 'done'.
 *  - Otherwise → recall_sessions → 'transcription_failed'; email the coach so
 *    they can fall back to a manual upload.
 */
export async function runGladiaFailureRecovery(
  recallSessionId: string,
  reason: string,
  supabase: SupabaseClient
): Promise<void> {
  const { data: rs } = await supabase
    .from('recall_sessions')
    .select('user_id, client_id')
    .eq('id', recallSessionId)
    .maybeSingle();

  if (!rs) {
    console.error(
      `[recall:fallback] recall_session not found: ${recallSessionId}`
    );
    return;
  }

  const { data: sessionRow } = await supabase
    .from('sessions')
    .select('id, transcript_text')
    .eq('recall_session_id', recallSessionId)
    .maybeSingle();

  const streamingText = sessionRow?.transcript_text?.trim();

  if (sessionRow && streamingText) {
    // Degraded path — summarize the streaming transcript.
    console.warn(
      `[recall:fallback] Gladia failed (${reason}) — summarizing streaming transcript for ${recallSessionId}`
    );
    const status = await runSummarize(sessionRow.id, rs.user_id);
    if (status === 'complete') {
      await maybeAutoGenerateActionItems(sessionRow.id, rs.user_id, supabase);
    }
    await supabase
      .from('recall_sessions')
      .update({ status: 'done' })
      .eq('id', recallSessionId);
    return;
  }

  // No transcript at all — hard failure. Notify the coach.
  await supabase
    .from('recall_sessions')
    .update({ status: 'transcription_failed', error_reason: reason })
    .eq('id', recallSessionId);

  const [{ data: user }, { data: client }] = await Promise.all([
    supabase.from('users').select('email, name').eq('id', rs.user_id).single(),
    supabase.from('clients').select('name').eq('id', rs.client_id).single(),
  ]);

  if (user?.email) {
    await sendTranscriptionFailedEmail(
      user.email,
      user.name ?? null,
      client?.name ?? 'your client'
    ).catch(err =>
      console.error('[recall:fallback] failure email send failed:', err)
    );
  }

  console.error(
    `[recall:fallback] transcription_failed for ${recallSessionId}: ${reason}`
  );
}
