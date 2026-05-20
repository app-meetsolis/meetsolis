/**
 * Composes the coach_briefs.content JSONB from gathered context (Story 6.4).
 */

import type { CoachBriefContent, BriefActionItem } from '@meetsolis/shared';
import type { BriefContext } from './fetch-context';

/** Maps a DB action_items.status to the brief's open/done model. */
export function dbStatusToBrief(status: string): 'open' | 'done' {
  return status === 'completed' ? 'done' : 'open';
}

export interface BuildContentParams {
  ctx: BriefContext;
  aiPrepNote: string;
  suggestedQuestions: string[];
  /** Minutes until session at generation time; null for manual briefs. */
  minutesUntilSession: number | null;
}

export function buildBriefContent(p: BuildContentParams): CoachBriefContent {
  const { ctx, aiPrepNote, suggestedQuestions, minutesUntilSession } = p;

  const lastSessionActionItems: BriefActionItem[] =
    ctx.lastSessionActionItems.map(a => ({
      id: a.id,
      text: a.text,
      status: dbStatusToBrief(a.status),
    }));

  const keyTheme = ctx.lastSession?.keyTopics?.[0] ?? '';

  return {
    client_name: ctx.client.name,
    minutes_until_session: minutesUntilSession,
    last_session: ctx.lastSession
      ? {
          session_id: ctx.lastSession.id,
          date: ctx.lastSession.date,
          weeks_ago: ctx.lastSessionWeeksAgo,
          action_items: lastSessionActionItems,
          key_theme: keyTheme,
        }
      : null,
    ai_prep_note: aiPrepNote,
    past_breakthroughs: ctx.breakthroughs,
    coach_open_questions: ctx.client.coachNotes,
    is_first_session: ctx.isFirstSession,
    suggested_questions: suggestedQuestions,
    edited_fields: [],
  };
}
