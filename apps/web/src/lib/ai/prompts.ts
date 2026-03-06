import type { ClientContext, SessionContext } from './provider';

export function getSummarizePrompt(
  transcript: string,
  client: ClientContext
): string {
  return `You are an executive coaching session analyst. Analyze this coaching session transcript and return a structured JSON summary.

Client: ${client.name}${client.company ? ` at ${client.company}` : ''}${client.role ? `, ${client.role}` : ''}
Coaching goal: ${client.goal || 'Not specified'}

TRANSCRIPT:
${transcript}

Return ONLY valid JSON in this exact format:
{
  "title": "Brief session title (max 60 chars)",
  "summary": "2-3 paragraph narrative summary of the session. Focus on: breakthroughs, challenges discussed, progress toward coaching goal, and coach-client dynamic insights.",
  "action_items": ["action item 1", "action item 2", "action item 3"],
  "key_topics": ["topic1", "topic2", "topic3"]
}

Guidelines (ICF-aligned):
- Use coaching language: "client explored", "coach inquired", "breakthrough around"
- Action items: specific, measurable, clearly attributed (client vs coach)
- Key topics: 3-6 themes from the session
- Do NOT include PII beyond what's in the transcript`;
}

export function getSolisPrompt(
  query: string,
  sessions: SessionContext[],
  client: ClientContext
): string {
  const sessionContext = sessions
    .map((s, i) => {
      const content = s.summary || s.transcript_text || '(no content)';
      return `[Session ${i + 1} — ${s.session_date}${s.title ? ` — ${s.title}` : ''}]\n${content}`;
    })
    .join('\n\n---\n\n');

  return `You are Solis Intelligence, an AI assistant for executive coaches. Answer questions about a coach's client based on their session history.

Client: ${client.name}${client.goal ? `\nCoaching goal: ${client.goal}` : ''}

SESSION HISTORY:
${sessionContext}

QUESTION: ${query}

Instructions:
- Answer based only on information from the session history
- Be specific and reference actual session content
- Use coaching-appropriate language
- End your answer with: SOURCES: [list session dates used]
- If information isn't available, say so clearly`;
}
