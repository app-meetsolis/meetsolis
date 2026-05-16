import Anthropic from '@anthropic-ai/sdk';
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

export class ClaudeAIService extends BaseService implements AIService {
  private client: Anthropic;

  constructor(apiKey: string) {
    super();
    this.client = new Anthropic({ apiKey });
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  getServiceInfo(): ServiceInfo {
    return {
      name: 'Claude AI Service',
      version: '1.0.0',
      description: 'Anthropic Claude for session summaries with prompt caching',
      dependencies: ['@anthropic-ai/sdk'],
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
    const response = await this.client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      system: [
        {
          type: 'text',
          text: COACHING_SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        { role: 'user', content: buildSummarizePrompt(transcript, ctx) },
      ],
    });

    const block = response.content[0];
    if (block.type !== 'text') {
      throw new Error('Claude returned non-text response');
    }

    return parseSummary(block.text);
  }

  async generateActionItems(
    transcript: string,
    ctx: ClientContext
  ): Promise<ActionItemsResult> {
    const response = await this.client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      system: [
        {
          type: 'text',
          text: COACHING_SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        { role: 'user', content: buildActionItemsPrompt(transcript, ctx) },
      ],
    });

    const block = response.content[0];
    if (block.type !== 'text') {
      throw new Error('Claude returned non-text response');
    }

    return parseActionItems(block.text);
  }

  async generateEmbedding(_text: string): Promise<number[]> {
    // TODO(story-5.x): Voyage AI embeddings for Claude provider
    return Array(1536).fill(0);
  }

  // Legacy interface methods
  async generateSummary(text: string): Promise<string> {
    const response = await this.client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [
        { role: 'user', content: `Summarize the following:\n\n${text}` },
      ],
    });
    const block = response.content[0];
    return block.type === 'text' ? block.text : '';
  }

  async analyzeText(text: string): Promise<Record<string, unknown>> {
    const wordCount = text.split(/\s+/).length;
    return { wordCount, characterCount: text.length };
  }

  async querySolis(systemPrompt: string, userPrompt: string): Promise<string> {
    const response = await this.client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      system: [
        {
          type: 'text',
          text: systemPrompt,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: userPrompt }],
    });
    const block = response.content[0];
    if (block.type !== 'text')
      throw new Error('Claude returned non-text response');
    return block.text;
  }
}
