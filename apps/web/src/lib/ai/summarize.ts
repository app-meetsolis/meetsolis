import type { SessionSummary, SolisResponse, SessionContext } from './provider';

export function parseSummaryResponse(
  text: string,
  clientName: string
): SessionSummary {
  try {
    // Extract JSON from response (model may add preamble)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      title: parsed.title || `Session with ${clientName}`,
      summary: parsed.summary || text,
      action_items: Array.isArray(parsed.action_items)
        ? parsed.action_items
        : [],
      key_topics: Array.isArray(parsed.key_topics) ? parsed.key_topics : [],
    };
  } catch {
    // Fallback: return raw text as summary
    return {
      title: `Session with ${clientName}`,
      summary: text,
      action_items: [],
      key_topics: [],
    };
  }
}

export function parseSolisResponse(
  text: string,
  sessions: SessionContext[]
): SolisResponse {
  // Extract sources from "SOURCES: ..." line
  const sourcesMatch = text.match(/SOURCES?:\s*(.+)$/im);
  const answer = text.replace(/SOURCES?:\s*.+$/im, '').trim();

  const sources: SolisResponse['sources'] = [];

  if (sourcesMatch) {
    const sourceDates = sourcesMatch[1].split(/[,;]/).map(s => s.trim());
    for (const dateStr of sourceDates) {
      const match = sessions.find(
        s =>
          s.session_date.includes(dateStr) || dateStr.includes(s.session_date)
      );
      if (match) {
        sources.push({
          session_id: match.id,
          session_date: match.session_date,
          title: match.title,
        });
      }
    }
  }

  // If no sources parsed, include first session as reference
  if (sources.length === 0 && sessions.length > 0) {
    sources.push({
      session_id: sessions[0].id,
      session_date: sessions[0].session_date,
      title: sessions[0].title,
    });
  }

  return { answer, sources };
}
