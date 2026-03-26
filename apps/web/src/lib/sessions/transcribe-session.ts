/**
 * Core session transcription logic.
 * Callable directly (no HTTP, no Clerk auth needed) — used by fire-and-forget trigger.
 * On success, chains into runSummarize().
 */

import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';
import { ServiceFactory } from '@/lib/service-factory';
import { runSummarize } from '@/lib/sessions/summarize-session';
import {
  checkTranscriptLimit,
  incrementTranscriptCount,
} from '@/lib/billing/checkUsage';

function getSupabase() {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!);
}

export async function runTranscribe(
  sessionId: string,
  userId: string
): Promise<'complete' | 'error' | 'skipped'> {
  const supabase = getSupabase();

  const { data: session } = await supabase
    .from('sessions')
    .select('id, user_id, transcript_audio_url, transcript_text')
    .eq('id', sessionId)
    .single();

  if (!session || session.user_id !== userId) return 'skipped';
  if (!session.transcript_audio_url) return 'skipped';

  await supabase
    .from('sessions')
    .update({ status: 'processing' })
    .eq('id', sessionId);

  try {
    await checkTranscriptLimit(userId);

    const transcriptionService = ServiceFactory.createTranscriptionService();
    const result = await transcriptionService.transcribe(
      session.transcript_audio_url
    );

    await supabase
      .from('sessions')
      .update({ transcript_text: result.text })
      .eq('id', sessionId);

    await incrementTranscriptCount(userId);

    // Delete audio from storage after successful transcription (PRD requirement)
    const audioUrl = session.transcript_audio_url;
    const storagePath = audioUrl.split('/transcripts/')[1];
    if (storagePath) {
      const { error: deleteError } = await supabase.storage
        .from('transcripts')
        .remove([storagePath]);
      if (deleteError) {
        console.warn(
          '[Transcribe] Audio delete failed (non-fatal):',
          deleteError.message
        );
      } else {
        await supabase
          .from('sessions')
          .update({ transcript_audio_url: null })
          .eq('id', sessionId);
      }
    }

    // Chain into summarization
    await runSummarize(sessionId, userId);

    console.log(`[Transcribe] Session ${sessionId} complete`);
    return 'complete';
  } catch (error) {
    console.error('[Transcribe] Error:', error);
    await supabase
      .from('sessions')
      .update({ status: 'error' })
      .eq('id', sessionId);
    return 'error';
  }
}
