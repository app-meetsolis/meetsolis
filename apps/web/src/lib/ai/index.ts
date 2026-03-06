import type { AIProvider } from './provider';
import { PlaceholderAIProvider } from './providers/placeholder';

let _provider: AIProvider | undefined;

function createProvider(): AIProvider {
  const providerName = process.env.AI_PROVIDER || 'placeholder';

  if (providerName === 'claude') {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key)
      throw new Error('ANTHROPIC_API_KEY required for AI_PROVIDER=claude');
    const { ClaudeAIProvider } = require('./providers/claude');
    return new ClaudeAIProvider(key) as AIProvider;
  }
  if (providerName === 'openai') {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error('OPENAI_API_KEY required for AI_PROVIDER=openai');
    const { OpenAIProvider } = require('./providers/openai');
    return new OpenAIProvider(key) as AIProvider;
  }
  return new PlaceholderAIProvider();
}

export function getAIProvider(): AIProvider {
  if (!_provider) _provider = createProvider();
  return _provider;
}
