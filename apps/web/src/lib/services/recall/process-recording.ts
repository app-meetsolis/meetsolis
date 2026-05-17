/**
 * Bot recording → sessions row + transcription trigger.
 * Called by the Recall.ai webhook when recording.done fires with a URL.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { runTranscribe } from '@/lib/sessions/transcribe-session';
import {
  isPlaceholderTitle,
  DEFAULT_SESSION_TITLE,
} from '@/lib/sessions/session-title';

interface CalEventLite {
  title?: string;
  start_time?: string;
}

export async function processRecallRecording(
  recallSessionId: string,
  recordingUrl: string,
  userId: string,
  supabase: SupabaseClient
): Promise<void> {
  console.info(
    `[recall:process-recording] start recall_session=${recallSessionId} user=${userId}`
  );

  // Load recall_session + linked calendar event (for title + date)
  const { data: recallSess, error: loadErr } = await supabase
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

  if (loadErr) {
    console.error(`[recall:process-recording] load failed: ${loadErr.message}`);
    return;
  }

  if (!recallSess) {
    console.warn(
      `[recall:process-recording] recall_session not found: ${recallSessionId}`
    );
    return;
  }

  // Supabase returns the joined record as an object or array depending on FK config
  const rawCal = (recallSess as { calendar_events?: unknown }).calendar_events;
  const calEvent: CalEventLite = Array.isArray(rawCal)
    ? ((rawCal[0] as CalEventLite) ?? {})
    : ((rawCal as CalEventLite | null) ?? {});

  const calTitle = calEvent.title?.trim();
  const title =
    calTitle && !isPlaceholderTitle(calTitle)
      ? calTitle
      : DEFAULT_SESSION_TITLE;
  const sessionDate = calEvent.start_time
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
      `[recall:process-recording] session already exists, skipping. session_id=${existing.id}`
    );
    return;
  }

  // Create session row
  const { data: newSession, error: insertErr } = await supabase
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

  if (insertErr || !newSession) {
    console.error(
      `[recall:process-recording] insert failed: ${insertErr?.message} client_id=${recallSess.client_id}`
    );
    return;
  }

  console.info(
    `[recall:process-recording] created session ${newSession.id}, starting transcribe`
  );

  // Fire-and-forget transcription (chains into summarization on success)
  runTranscribe(newSession.id, userId).catch(err =>
    console.error(
      `[recall:process-recording] transcribe failed session=${newSession.id}:`,
      err instanceof Error ? err.message : String(err)
    )
  );
}
