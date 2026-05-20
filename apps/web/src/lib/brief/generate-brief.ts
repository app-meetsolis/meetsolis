/**
 * Coach Brief generation orchestrator (Story 6.4).
 * Gathers context -> generates AI Prep Note -> composes content -> persists.
 */

import { createClient } from '@supabase/supabase-js';
import { differenceInMinutes } from 'date-fns';
import { config } from '@/lib/config/env';
import { ServiceFactory } from '@/lib/service-factory';
import type { CoachBrief, BriefGenerationStatus } from '@meetsolis/shared';
import { fetchBriefContext } from './fetch-context';
import { buildBriefContent } from './build-content';
import {
  AI_PREP_NOTE_SYSTEM_PROMPT,
  buildPrepNoteUserPrompt,
} from './prompts/ai-prep-note';
import {
  SUGGESTED_QUESTIONS_SYSTEM_PROMPT,
  buildSuggestedQuestionsPrompt,
  parseSuggestedQuestions,
} from './prompts/suggested-questions';

function getSupabase() {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!);
}

export interface GenerateBriefParams {
  userId: string;
  clientId: string;
  /** Calendar event the brief is for. Null for manual (no-calendar) briefs. */
  calendarEventId: string | null;
  /** Session start (ISO) — null for manual briefs. Drives minutes_until_session. */
  startTime: string | null;
}

/**
 * Generates and persists a Coach Brief. Event briefs upsert on
 * calendar_event_id (idempotent). Manual briefs replace any prior manual
 * brief for the same client.
 */
export async function generateBrief(
  params: GenerateBriefParams
): Promise<CoachBrief> {
  const { userId, clientId, calendarEventId, startTime } = params;

  const ctx = await fetchBriefContext(userId, clientId);
  const aiService = ServiceFactory.createAIService();

  let aiPrepNote = '';
  let suggestedQuestions: string[] = [];
  let generationStatus: BriefGenerationStatus = 'ok';

  try {
    aiPrepNote = await aiService.generatePrepNote(
      AI_PREP_NOTE_SYSTEM_PROMPT,
      buildPrepNoteUserPrompt({
        clientName: ctx.client.name,
        clientGoal: ctx.client.goal,
        clientNotes: ctx.client.notes,
        recentSessions: ctx.recentSessions.map(s => ({
          date: s.date,
          summary: s.summary,
          keyTopics: s.keyTopics,
        })),
        openActionItems: ctx.openActionItems.map(a => a.text),
        retrievedSessions: ctx.breakthroughs.map(b => ({
          date: b.date,
          summary: b.summary,
          keyTopics: [],
        })),
        isFirstSession: ctx.isFirstSession,
      })
    );

    if (ctx.isFirstSession) {
      const rawQuestions = await aiService.generatePrepNote(
        SUGGESTED_QUESTIONS_SYSTEM_PROMPT,
        buildSuggestedQuestionsPrompt({
          clientName: ctx.client.name,
          clientGoal: ctx.client.goal,
          clientNotes: ctx.client.notes,
        })
      );
      suggestedQuestions = parseSuggestedQuestions(rawQuestions);
    }
  } catch (err) {
    console.error('[brief:generate] AI prep note failed:', err);
    generationStatus = 'ai_failed';
    aiPrepNote = '';
  }

  const minutesUntilSession = startTime
    ? differenceInMinutes(new Date(startTime), new Date())
    : null;

  const content = buildBriefContent({
    ctx,
    aiPrepNote,
    suggestedQuestions,
    minutesUntilSession,
  });

  const supabase = getSupabase();
  const now = new Date().toISOString();

  if (calendarEventId) {
    const { data, error } = await supabase
      .from('coach_briefs')
      .upsert(
        {
          user_id: userId,
          client_id: clientId,
          calendar_event_id: calendarEventId,
          content,
          generation_status: generationStatus,
          generated_at: now,
          updated_at: now,
        },
        { onConflict: 'calendar_event_id' }
      )
      .select()
      .single();
    if (error || !data) {
      throw new Error(`Failed to persist brief: ${error?.message}`);
    }
    return data as CoachBrief;
  }

  // Manual brief — replace any prior manual brief for this client
  await supabase
    .from('coach_briefs')
    .delete()
    .eq('client_id', clientId)
    .is('calendar_event_id', null);

  const { data, error } = await supabase
    .from('coach_briefs')
    .insert({
      user_id: userId,
      client_id: clientId,
      calendar_event_id: null,
      content,
      generation_status: generationStatus,
      generated_at: now,
      updated_at: now,
    })
    .select()
    .single();
  if (error || !data) {
    throw new Error(`Failed to persist manual brief: ${error?.message}`);
  }
  return data as CoachBrief;
}
