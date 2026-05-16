import OpenAI from 'openai';
import {
  AIService,
  ClientContext,
  SessionSummaryResult,
  ActionItemsResult,
  ServiceStatus,
  ServiceInfo,
} from '@meetsolis/shared';
import { BaseService } from '../base-service';
import {
  COACHING_SYSTEM_PROMPT,
  buildSummarizePrompt,
  buildActionItemsPrompt,
} from '../../ai/prompts';
import { parseSummary, parseActionItems } from '../../ai/summarize';

export class OpenAIAIService extends BaseService implements AIService {
  private client: OpenAI;

  constructor(apiKey: string) {
    super();
    this.client = new OpenAI({ apiKey });
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  getServiceInfo(): ServiceInfo {
    return {
      name: 'OpenAI AI Service',
      version: '1.0.0',
      description:
        'OpenAI GPT-4o-mini for session summaries + text-embedding-3-small for embeddings',
      dependencies: ['openai'],
    };
  }

  protected async performHealthCheck(): Promise<ServiceStatus> {
    return {
      status: 'healthy',
      responseTime: 0,
      lastCheck: new Date(),
      errorCount: 0,
    };
  }

  async summarizeSession(
    transcript: string,
    ctx: ClientContext
  ): Promise<SessionSummaryResult> {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: COACHING_SYSTEM_PROMPT },
        { role: 'user', content: buildSummarizePrompt(transcript, ctx) },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI returned empty response');
    }

    return parseSummary(content);
  }

  async generateActionItems(
    transcript: string,
    ctx: ClientContext
  ): Promise<ActionItemsResult> {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: COACHING_SYSTEM_PROMPT },
        { role: 'user', content: buildActionItemsPrompt(transcript, ctx) },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI returned empty response');
    }

    return parseActionItems(content);
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.client.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return response.data[0].embedding;
  }

  // Legacy interface methods
  async generateSummary(text: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'user', content: `Summarize the following:\n\n${text}` },
      ],
      max_tokens: 500,
    });
    return response.choices[0]?.message?.content ?? '';
  }

  async analyzeText(text: string): Promise<Record<string, unknown>> {
    const wordCount = text.split(/\s+/).length;
    return { wordCount, characterCount: text.length };
  }

  async querySolis(systemPrompt: string, userPrompt: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 1500,
    });
    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('OpenAI returned empty response');
    return content;
  }
}
