/**
 * Session title helpers (Story 6.2c follow-up).
 *
 * Bot sessions inherit their title from the linked calendar event. Google
 * Calendar events with no summary are synced as the literal "(no title)", and
 * on-demand bots fall back to "Recorded session" — neither is meaningful. Such
 * placeholder titles are replaced by an AI-generated title once the session
 * is summarized.
 */

const PLACEHOLDER_TITLES = new Set(['', '(no title)', 'recorded session']);

/** Default title used at session-creation time before summarization runs. */
export const DEFAULT_SESSION_TITLE = 'Recorded session';

/**
 * True when a session title is missing or a generic placeholder — i.e. safe
 * to overwrite with an AI-generated title.
 */
export function isPlaceholderTitle(title: string | null | undefined): boolean {
  if (!title) return true;
  return PLACEHOLDER_TITLES.has(title.trim().toLowerCase());
}
