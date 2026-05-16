/**
 * Finalize a streamed transcript when a bot call ends (Story 6.2b).
 *
 * Concatenates transcript_chunks into transcript_text, marks streaming
 * complete, and triggers AI summarization directly. Skips runTranscribe —
 * the transcript already exists from live streaming.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { TranscriptChunk } from '@meetsolis/shared';
import { concatTranscriptText } from './process-transcript-chunk';
import { runSummarize } from '@/lib/sessions/summarize-session';
import { maybeAutoGenerateActionItems } from '@/lib/sessions/generate-action-items';

export async function finalizeStreamingTranscript(
  recallSessionId: string,
  userId: string,
  supabase: SupabaseClient
): Promise<void> {
  const { data: sessionRow, error } = await supabase
    .from('sessions')
    .select('id, transcript_chunks')
    .eq('recall_session_id', recallSessionId)
    .maybeSingle();

  if (error || !sessionRow) {
    console.warn(
      `[recall:finalize] no session row for recall_session=${recallSessionId}`
    );
    return;
  }

  const chunks = (sessionRow.transcript_chunks ?? []) as TranscriptChunk[];

  // Silent or failed stream — mark complete so the UI stops polling.
  if (chunks.length === 0) {
    await supabase
      .from('sessions')
      .update({ transcript_streaming_complete: true })
      .eq('id', sessionRow.id);
    console.warn(
      `[recall:finalize] session ${sessionRow.id} ended with 0 transcript chunks`
    );
    return;
  }

  await supabase
    .from('sessions')
    .update({
      transcript_text: concatTranscriptText(chunks),
      transcript_streaming_complete: true,
    })
    .eq('id', sessionRow.id);

  // Fire-and-forget — generates summary + key topics + embedding, then
  // auto-generates action items only if the user opted in (Story 6.2c).
  runSummarize(sessionRow.id, userId)
    .then(status => {
      if (status === 'complete') {
        return maybeAutoGenerateActionItems(sessionRow.id, userId, supabase);
      }
    })
    .catch(err =>
      console.error(
        `[recall:finalize] runSummarize failed session=${sessionRow.id}:`,
        err instanceof Error ? err.message : String(err)
      )
    );
}
