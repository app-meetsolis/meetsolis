import type {
  AIProvider,
  ClientContext,
  SessionContext,
  SessionSummary,
  SolisResponse,
} from '../provider';

export class PlaceholderAIProvider implements AIProvider {
  async summarizeSession(
    _transcript: string,
    client: ClientContext
  ): Promise<SessionSummary> {
    await new Promise(r => setTimeout(r, 300));
    return {
      title: `Session with ${client.name}`,
      summary: `[PLACEHOLDER] Session focused on ${client.goal || 'coaching goals'}. Client showed strong engagement and progress toward their objectives. Key themes included goal alignment and accountability structures.`,
      action_items: [
        'Review progress on primary coaching goal by next session',
        'Complete reflection exercise on values alignment',
        'Schedule follow-up check-in before next session',
      ],
      key_topics: ['goal setting', 'accountability', 'progress review'],
    };
  }

  async queryIntelligence(
    query: string,
    sessions: SessionContext[],
    _client: ClientContext
  ): Promise<SolisResponse> {
    await new Promise(r => setTimeout(r, 200));
    return {
      answer: `[PLACEHOLDER] Based on ${sessions.length} session(s) in context, here is a response to: "${query}". This is placeholder AI output — configure AI_PROVIDER=claude or AI_PROVIDER=openai for real responses.`,
      sources: sessions.slice(0, 2).map(s => ({
        session_id: s.id,
        session_date: s.session_date,
        title: s.title,
      })),
    };
  }

  async generateEmbedding(_text: string): Promise<number[]> {
    // Return zero vector for placeholder
    return new Array(1536).fill(0);
  }
}
