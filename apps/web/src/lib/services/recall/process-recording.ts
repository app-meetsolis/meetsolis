/**
 * Bot recording → sessions row + transcription trigger.
 * Called by the Recall.ai webhook when recording.done fires with a URL.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { runTranscribe } from '@/lib/sessions/transcribe-session';

export async function processRecallRecording(
  recallSessionId: string,
  recordingUrl: string,
  userId: string,
  supabase: SupabaseClient
): Promise<void> {
  // Load recall_session + linked calendar event (for title + date)
  const { data: recallSess } = await supabase
    .from('recall_sessions')
    .select(
      `
      client_id,
      calendar_event_id,
      calendar_events ( title, start_time )
    `
    )
    .eq('id', recallSessionId)
    .maybeSingle();

  if (!recallSess) {
    console.warn(
      `[recall:process-recording] recall_session not found: ${recallSessionId}`
    );
    return;
  }

  const calEvent = recallSess.calendar_events as
    | { title: string; start_time: string }
    | { title: string; start_time: string }[]
    | null as { title?: string; start_time?: string } | null;

  const title = calEvent?.title ?? 'Recorded session';
  const sessionDate = calEvent?.start_time
    ? calEvent.start_time.split('T')[0]
    : new Date().toISOString().split('T')[0];

  // Idempotency — skip if a session already exists for this audio URL
  const { data: existing } = await supabase
    .from('sessions')
    .select('id')
    .eq('user_id', userId)
    .eq('transcript_audio_url', recordingUrl)
    .maybeSingle();

  if (existing) {
    console.info(
      `[recall:process-recording] session already exists for url, skipping. session_id=${existing.id}`
    );
    return;
  }

  // Create session row
  const { data: newSession, error } = await supabase
    .from('sessions')
    .insert({
      user_id: userId,
      client_id: recallSess.client_id,
      title,
      session_date: sessionDate,
      transcript_audio_url: recordingUrl,
      status: 'pending',
    })
    .select('id')
    .single();

  if (error || !newSession) {
    console.error(
      '[recall:process-recording] failed to create session:',
      error?.message
    );
    return;
  }

  console.info(
    `[recall:process-recording] created session ${newSession.id}, transcribing...`
  );

  // Fire-and-forget transcription (chains into summarization on success)
  runTranscribe(newSession.id, userId).catch(err =>
    console.error(
      `[recall:process-recording] transcribe failed for session ${newSession.id}:`,
      err
    )
  );
}
