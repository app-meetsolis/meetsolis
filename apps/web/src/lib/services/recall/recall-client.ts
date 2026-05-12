/**
 * Recall.ai API wrapper (Story 6.2)
 * Covers: createBot, getBot
 * Auth: Authorization header with API key (Token prefix optional per docs)
 */

import { config } from '@/lib/config/env';
import type {
  RecallCreateBotRequest,
  RecallCreateBotResponse,
  RecallGetBotResponse,
} from '@meetsolis/shared';

function getHeaders(): HeadersInit {
  if (!config.recall.apiKey) {
    throw new Error('RECALL_API_KEY is not configured');
  }
  return {
    Authorization: config.recall.apiKey,
    'Content-Type': 'application/json',
  };
}

export async function createRecallBot(
  params: RecallCreateBotRequest
): Promise<RecallCreateBotResponse> {
  const res = await fetch(`${config.recall.baseUrl}/bot`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(
      `Recall.ai createBot failed: ${res.status} ${res.statusText} — ${body}`
    );
  }

  return res.json() as Promise<RecallCreateBotResponse>;
}

export async function getRecallBot(
  botId: string
): Promise<RecallGetBotResponse> {
  const res = await fetch(`${config.recall.baseUrl}/bot/${botId}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(
      `Recall.ai getBot failed: ${res.status} ${res.statusText} — ${body}`
    );
  }

  return res.json() as Promise<RecallGetBotResponse>;
}
