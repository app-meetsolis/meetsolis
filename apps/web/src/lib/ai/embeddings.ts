import { ServiceFactory } from '@/lib/service-factory';

export async function generateEmbedding(text: string): Promise<number[]> {
  return ServiceFactory.createAIService().generateEmbedding(text);
}
