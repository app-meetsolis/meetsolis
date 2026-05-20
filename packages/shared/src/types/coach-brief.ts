/**
 * Coach Brief Types (Story 6.4)
 * Mirrors schema from migration 20260519_story_6_4_coach_briefs.sql
 */

import type { SubscriptionPlan } from './database';

/** Action item as surfaced in a brief. status maps DB pending/in_progress -> 'open', completed -> 'done'. */
export interface BriefActionItem {
  id: string;
  text: string;
  status: 'open' | 'done';
}

export interface BriefLastSession {
  session_id: string;
  date: string; // ISO date 'YYYY-MM-DD'
  weeks_ago: number;
  action_items: BriefActionItem[];
  key_theme: string;
}

export interface BriefBreakthrough {
  session_id: string;
  date: string; // ISO date 'YYYY-MM-DD'
  summary: string;
}

/** JSONB payload stored in coach_briefs.content. */
export interface CoachBriefContent {
  client_name: string;
  /** Snapshot at generation time; UI recomputes live from event start_time. Null for manual briefs. */
  minutes_until_session: number | null;
  /** Null on first-ever session with the client. */
  last_session: BriefLastSession | null;
  ai_prep_note: string;
  past_breakthroughs: BriefBreakthrough[];
  /** Mirror of clients.coach_notes at generation time; live value loaded separately on the screen. */
  coach_open_questions: string;
  is_first_session: boolean;
  /** First-session opening questions (AI-generated). Empty otherwise. */
  suggested_questions: string[];
  /** Content keys the coach has manually edited (drives the "edited" pencil icon). */
  edited_fields: string[];
}

export type BriefGenerationStatus = 'ok' | 'ai_failed' | 'partial';

export interface CoachBrief {
  id: string;
  user_id: string;
  client_id: string;
  calendar_event_id: string | null;
  content: CoachBriefContent;
  generation_status: BriefGenerationStatus;
  dismissed: boolean;
  dismissed_at: string | null;
  generated_at: string;
  updated_at: string;
}

/** Lightweight calendar event shape needed by the brief screen. */
export interface BriefEvent {
  id: string;
  title: string;
  start_time: string; // ISO timestamp
}

/** Payload returned by GET /api/brief. */
export interface CoachBriefView {
  brief: CoachBrief;
  event: BriefEvent | null;
  /** Other briefs scheduled later today (for the "Next brief" button). */
  sibling_event_ids: string[];
  tier: SubscriptionPlan;
}

/** Dashboard banner item — one active (undismissed, in-window) brief. */
export interface ActiveBriefSummary {
  brief_id: string;
  calendar_event_id: string;
  client_name: string;
  start_time: string; // ISO timestamp
}
