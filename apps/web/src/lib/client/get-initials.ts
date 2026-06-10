/**
 * Story 7.7 — extract up to 2 uppercase initials from a client name.
 *
 * Rules:
 * - Split on whitespace + dash + comma (handles "Alex Rivera", "Mary-Jane Doe", "Doe, Jane")
 * - Take first char of first + last token
 * - Single-word name → first char only ("Mononymous" → "M")
 * - Empty/whitespace input → "?"
 * - Non-letter first chars are kept verbatim (so "李 Wei" → "李W"); we don't try to
 *   strip diacritics or transliterate.
 */

export function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  const cleaned = name.trim();
  if (!cleaned) return '?';

  const tokens = cleaned.split(/[\s,\-_/]+/).filter(Boolean);
  if (tokens.length === 0) return '?';

  const first = tokens[0][0] ?? '';
  if (tokens.length === 1) {
    return first.toUpperCase();
  }
  const last = tokens[tokens.length - 1][0] ?? '';
  return `${first}${last}`.toUpperCase();
}
