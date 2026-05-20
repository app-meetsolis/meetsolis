/**
 * Solis prep-intent detection (Story 6.4).
 * Regex + client-name fuzzy match — NO LLM cost, keeps Solis snappy.
 */

export interface PrepIntentClient {
  id: string;
  name: string;
}

export interface PrepIntentResult {
  /** True when the query is a prep request. */
  isPrep: boolean;
  /** Set only when exactly one client matched the named phrase. */
  matchedClient?: PrepIntentClient;
  /** Candidate clients when the name is ambiguous (0 or 2+ matches). */
  candidates?: PrepIntentClient[];
}

const PREP_INTENT_REGEX =
  /(prep me for|prepare me for|prep for|brief me on)\s+(.+?)(?:[.?!]|$)/i;

/**
 * Detects prep intent and resolves the referenced client.
 * - exactly 1 name match  -> { isPrep: true, matchedClient }
 * - 0 or 2+ name matches  -> { isPrep: true, candidates } (caller asks "which client?")
 * - no prep phrasing      -> { isPrep: false }
 */
export function detectPrepIntent(
  query: string,
  userClients: PrepIntentClient[]
): PrepIntentResult {
  const match = query.match(PREP_INTENT_REGEX);
  if (!match) return { isPrep: false };

  const namePhrase = match[2]?.trim().toLowerCase() ?? '';
  if (!namePhrase) return { isPrep: false };

  const matches = userClients.filter(c => {
    const full = c.name.trim().toLowerCase();
    if (!full) return false;
    const first = full.split(/\s+/)[0];
    return namePhrase.includes(full) || namePhrase.includes(first);
  });

  if (matches.length === 1) {
    return { isPrep: true, matchedClient: matches[0] };
  }
  return { isPrep: true, candidates: matches };
}
