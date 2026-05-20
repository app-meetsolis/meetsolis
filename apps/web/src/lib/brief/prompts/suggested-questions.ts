/**
 * First-session opening questions prompt (Story 6.4).
 * When a client has zero history, the Coach Brief replaces "Past Breakthroughs"
 * with 3 AI-generated opening questions derived from the client card.
 */

export interface SuggestedQuestionsInput {
  clientName: string;
  clientGoal: string;
  clientNotes: string;
}

export const SUGGESTED_QUESTIONS_SYSTEM_PROMPT = `You help an executive coach prepare opening questions for a first session with a new client.

Produce exactly 3 opening questions. Each question must:
- Be specific to this client's stated goal and notes — not generic.
- Be open-ended and exploratory.
- Be something a skilled coach would actually ask in a first session.

Output ONLY the 3 questions, one per line, with no numbering, no bullets, no preamble.`;

export function buildSuggestedQuestionsPrompt(
  input: SuggestedQuestionsInput
): string {
  return `CLIENT: ${input.clientName}
GOAL: ${input.clientGoal || '(not recorded)'}
COACH'S NOTES: ${input.clientNotes || '(none)'}

Write the 3 opening questions now.`;
}

/** Parses model output into a clean list of up to 3 questions. */
export function parseSuggestedQuestions(raw: string): string[] {
  return raw
    .split('\n')
    .map(line =>
      line
        // strip leading numbering / bullets
        .replace(/^\s*(?:\d+[.)]\s*|[-*•]\s*)/, '')
        // strip wrapping quotes
        .replace(/^["']|["']$/g, '')
        .trim()
    )
    .filter(line => line.length > 0)
    .slice(0, 3);
}
