import { ClientContext } from '@meetsolis/shared';

export const COACHING_SYSTEM_PROMPT = `You are an expert coaching session analyst trained in ICF (International Coach Federation) methodology.

Your role is to analyze coaching session transcripts and extract structured insights.

Guidelines:
- Identify the coach and client from the conversation context
- Use ICF-compliant coaching vocabulary: "explored", "identified", "clarified", "committed", "reflected"
- Avoid clinical or therapeutic language (do not use: "diagnosed", "treatment", "symptoms", "disorder")
- Focus on forward momentum, goals, and client-led discoveries
- Action items should be specific, measurable, and time-bound where possible
- Assign action items to either "coach" or "client" based on who is responsible

You must respond with valid JSON only — no markdown, no explanation outside the JSON.`;

export function buildSummarizePrompt(
  transcript: string,
  ctx: ClientContext
): string {
  const clientInfo = [
    `Client name: ${ctx.name}`,
    ctx.goal ? `Client goal: ${ctx.goal}` : null,
    ctx.coaching_since
      ? `Coaching relationship since: ${ctx.coaching_since}`
      : null,
  ]
    .filter(Boolean)
    .join('\n');

  return `Analyze the following coaching session transcript and return a JSON object with this exact schema:

{
  "title": "string — concise session title (e.g. 'Session 5 — Leadership Transition')",
  "summary": "string — 2-4 sentence paragraph summarizing key themes and breakthroughs",
  "key_topics": ["string array of 3-6 topic tags"],
  "action_items": [
    {
      "description": "string — specific action to take",
      "assigned_to": "coach" | "client"
    }
  ]
}

CLIENT CONTEXT:
${clientInfo}

TRANSCRIPT:
${transcript}

Respond with the JSON object only.`;
}
