/**
 * AI Prep Note prompt — Coach Brief hero feature (Story 6.4).
 *
 * PROMPT GATE (BRAINSTORM §9): before this story is marked Done, this prompt
 * MUST be iterated against a 10-transcript corpus. The corpus + ideal outputs
 * are PM-supplied — see __tests__/fixtures/ and prep-note-eval.test.ts.
 * Iterate until 8/10+ outputs clear the quality bar, then ship.
 *
 * Model: Claude Sonnet via AIService.generatePrepNote (temperature 0.7).
 */

export interface PrepNoteSession {
  date: string; // 'YYYY-MM-DD'
  summary: string;
  keyTopics: string[];
}

export interface PrepNoteInput {
  clientName: string;
  clientGoal: string;
  clientNotes: string;
  /** Last 3 sessions verbatim (summary + key moments). */
  recentSessions: PrepNoteSession[];
  /** Open action item descriptions. */
  openActionItems: string[];
  /** Top sessions retrieved via hybrid search (relevance-ranked). */
  retrievedSessions: PrepNoteSession[];
  /** True when there is no prior session history with this client. */
  isFirstSession: boolean;
}

export const AI_PREP_NOTE_SYSTEM_PROMPT = `You are writing the prep note an executive coach reads 60 minutes before a session. It must read like a sharp peer wrote it — specific, declarative, committed to ONE angle. Generic coaching prose is failure.

STRUCTURE (2-3 short paragraphs):
1. Name ONE specific pattern across the sessions. Cite at least two concrete pieces of evidence — dates, numbers, named people, exact phrases — drawn from the input. Commit to one pattern. Do not list multiple.
2. Propose ONE reframe OR ONE sharp question for the coach to try this session. Write it out as the actual sentence. Do not offer alternatives.
3. (Optional, only if relevant) Connect to ONE past breakthrough in one sentence and say why it matters today.

QUOTE RULE: Use at least ONE exact verbatim quote from the input, in quotation marks. Do not paraphrase and put quotes around it.

BANNED LANGUAGE — automatic failure:
- "consider asking" / "consider exploring" / "consider how" / "consider reframing" — write the question or reframe directly, not the suggestion to ask one.
- "may help" / "could empower" / "might serve" / "this could be" — declare, don't hedge.
- "tap into" / "explore further" / "delve deeper" / "dig into" / "unpack".
- "personal growth" / "leadership journey" / "authentic self" / "inner work".
- Sentences that begin "Encouraging her to..." or "Helping him..." — flip them to declaratives.
- Hedging adverbs: "perhaps", "possibly", "potentially".

FORMAT RULES:
- Client's first name is fine after first use.
- 3-5 sentences per paragraph maximum. No wall of text.
- Flowing prose only. No bullets, no headers, no markdown.
- Do not invent facts not in the input.
- Output ONLY the prep note text. No preamble, no sign-off.

EXAMPLE OF THE QUALITY BAR (a different client — style reference, not content):

Elena's recent sessions keep landing on the same mechanism: every time she protects time for the design-system work, she gives it away again. In early April she named it as the quarter goal and admitted she defers it because nothing external forces it; last week she made seven new commitments, one a review she has no stake in. The thread isn't poor time management — it's that an empty calendar block with her name on important work is the most exposed she can be.

Her own words from last session are the key: saying yes protects her from "people being disappointed in me." She isn't overcommitted because she's disorganized, she's overcommitted because being needed is safer than being judged. Ask her directly: "If the design-system work were done brilliantly, what would you have to give up being?"

This connects directly to her March breakthrough — that "helpful" had become her whole identity, and the design-system work scares her because it would test whether she's good, not just available. The two protected mornings on her action list are the first real test of whether she can tolerate that exposure.

End of example. Write the prep note for the client below.`;

function formatSessions(sessions: PrepNoteSession[]): string {
  if (sessions.length === 0) return '(none)';
  return sessions
    .map((s, i) => {
      const topics = s.keyTopics.length
        ? ` [topics: ${s.keyTopics.join(', ')}]`
        : '';
      return `Session ${i + 1} (${s.date})${topics}:\n${s.summary || '(no summary)'}`;
    })
    .join('\n\n');
}

/** Builds the user prompt for the standard (has-history) prep note. */
export function buildPrepNoteUserPrompt(input: PrepNoteInput): string {
  if (input.isFirstSession) {
    return buildFirstSessionPrepNotePrompt(input);
  }

  return `CLIENT: ${input.clientName}
GOAL: ${input.clientGoal || '(not recorded)'}

LAST 3 SESSION SUMMARIES:
${formatSessions(input.recentSessions)}

OPEN ACTION ITEMS:
${input.openActionItems.length ? input.openActionItems.map(a => `- ${a}`).join('\n') : '(none)'}

RELEVANT PAST SESSIONS (semantically retrieved):
${formatSessions(input.retrievedSessions)}

Write the 2-3 paragraph prep note now.`;
}

/** First-ever session: no history — focus on goal/notes, suggest an exploratory opening. */
export function buildFirstSessionPrepNotePrompt(input: PrepNoteInput): string {
  return `CLIENT: ${input.clientName}
GOAL: ${input.clientGoal || '(not recorded)'}
COACH'S NOTES ON CLIENT: ${input.clientNotes || '(none)'}

This is the FIRST session with this client — there is no prior history.

Write a SHORT prep note (1-2 tight paragraphs). Ground it in the stated goal and notes. Suggest how the coach might open an exploratory first session and what to listen for. Do not invent history. Output only the prep note text.`;
}
