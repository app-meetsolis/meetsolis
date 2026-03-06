import type {
  AIProvider,
  ClientContext,
  SessionContext,
  SessionSummary,
  SolisResponse,
} from '../provider';
import { getSummarizePrompt, getSolisPrompt } from '../prompts';
import { parseSummaryResponse, parseSolisResponse } from '../summarize';

export class OpenAIProvider implements AIProvider {
  private apiKey: string;
  private model = 'gpt-4o-mini';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async summarizeSession(
    transcript: string,
    client: ClientContext
  ): Promise<SessionSummary> {
    const prompt = getSummarizePrompt(transcript, client);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    return parseSummaryResponse(text, client.name);
  }

  async queryIntelligence(
    query: string,
    sessions: SessionContext[],
    client: ClientContext
  ): Promise<SolisResponse> {
    const prompt = getSolisPrompt(query, sessions, client);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    return parseSolisResponse(text, sessions);
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
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
