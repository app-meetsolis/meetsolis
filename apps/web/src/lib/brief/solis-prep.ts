/**
 * Solis prep-intent response builder (Story 6.4).
 * Turns a matched prep request into an abbreviated brief response, generating
 * (or reusing) a Coach Brief behind the scenes.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';
import { generateBrief } from './generate-brief';
import type {
  CoachBrief,
  CoachBriefContent,
  SubscriptionPlan,
} from '@meetsolis/shared';

function getSupabase() {
  return createClient(config.supabase.url!, config.supabase.serviceRoleKey!);
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export interface PrepResponse {
  answer: string;
  /** Non-null only when a calendar event matched AND the user is Pro. */
  eventId: string | null;
}

/** First paragraph of a multi-paragraph note. */
function firstParagraph(text: string): string {
  return text.split(/\n\n+/)[0]?.trim() ?? '';
}

function abbreviate(content: CoachBriefContent): string {
  const lines: string[] = [`**Prep for ${content.client_name}**`];

  if (content.last_session?.key_theme) {
    lines.push(`_Last session theme: ${content.last_session.key_theme}_`);
  }

  if (content.ai_prep_note) {
    lines.push(firstParagraph(content.ai_prep_note));
  } else if (content.is_first_session) {
    lines.push(
      `This is your first session with ${content.client_name} — no history yet.`
    );
  } else {
    lines.push(
      `I've pulled together what I have on ${content.client_name}. Open the full Coach Brief for the complete picture.`
    );
  }

  return lines.join('\n\n');
}

/**
 * Generates (or reuses) a brief for the matched client and returns an
 * abbreviated chat response. Pro users with a matched calendar event also
 * get a CTA link to the full brief screen.
 */
export async function buildPrepResponse(params: {
  userId: string;
  clientId: string;
  tier: SubscriptionPlan;
}): Promise<PrepResponse> {
  const { userId, clientId, tier } = params;
  const supabase = getSupabase();
  const now = new Date();

  // Nearest upcoming calendar event for this client, within 7 days
  const { data: event } = await supabase
    .from('calendar_events')
    .select('id, start_time')
    .eq('user_id', userId)
    .eq('client_id', clientId)
    .gte('start_time', now.toISOString())
    .lte('start_time', new Date(now.getTime() + SEVEN_DAYS_MS).toISOString())
    .order('start_time', { ascending: true })
    .limit(1)
    .maybeSingle();

  let brief: CoachBrief;

  if (event) {
    const { data: existing } = await supabase
      .from('coach_briefs')
      .select('*')
      .eq('user_id', userId)
      .eq('calendar_event_id', event.id)
      .maybeSingle();
    brief =
      (existing as CoachBrief | null) ??
      (await generateBrief({
        userId,
        clientId,
        calendarEventId: event.id as string,
        startTime: event.start_time as string,
      }));
  } else {
    const { data: existing } = await supabase
      .from('coach_briefs')
      .select('*')
      .eq('user_id', userId)
      .eq('client_id', clientId)
      .is('calendar_event_id', null)
      .maybeSingle();
    brief =
      (existing as CoachBrief | null) ??
      (await generateBrief({
        userId,
        clientId,
        calendarEventId: null,
        startTime: null,
      }));
  }

  const content = brief.content as CoachBriefContent;
  let answer = abbreviate(content);

  // Pro coaches with a matched event get a CTA to the dedicated screen
  const eventId = event && tier === 'pro' ? (event.id as string) : null;
  if (eventId) {
    answer += `\n\n[View full Coach Brief →](/brief/${eventId})`;
  }

  return { answer, eventId };
}
