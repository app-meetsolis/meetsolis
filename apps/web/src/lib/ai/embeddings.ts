import { getAIProvider } from './index';

export async function generateEmbedding(text: string): Promise<number[]> {
  const provider = getAIProvider();
  return provider.generateEmbedding(text);
}
