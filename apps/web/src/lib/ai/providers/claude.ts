import type {
  AIProvider,
  ClientContext,
  SessionContext,
  SessionSummary,
  SolisResponse,
} from '../provider';
import { getSummarizePrompt, getSolisPrompt } from '../prompts';
import { parseSummaryResponse, parseSolisResponse } from '../summarize';

export class ClaudeAIProvider implements AIProvider {
  private apiKey: string;
  private model = 'claude-sonnet-4-6';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async summarizeSession(
    transcript: string,
    client: ClientContext
  ): Promise<SessionSummary> {
    const prompt = getSummarizePrompt(transcript, client);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    return parseSummaryResponse(text, client.name);
  }

  async queryIntelligence(
    query: string,
    sessions: SessionContext[],
    client: ClientContext
  ): Promise<SolisResponse> {
    const prompt = getSolisPrompt(query, sessions, client);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    return parseSolisResponse(text, sessions);
  }

  async generateEmbedding(text: string): Promise<number[]> {
    // Claude doesn't have embeddings — delegate to OpenAI text-embedding-3-small
    // If no OpenAI key, return zero vector
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) return new Array(1536).fill(0);

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
      }),
    });

    if (!response.ok) return new Array(1536).fill(0);
    const data = await response.json();
    return data.data?.[0]?.embedding || new Array(1536).fill(0);
  }
}
