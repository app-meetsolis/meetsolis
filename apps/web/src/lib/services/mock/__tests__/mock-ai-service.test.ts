import { MockAIService } from '../mock-ai-service';

describe('MockAIService', () => {
  let service: MockAIService;

  beforeEach(() => {
    service = new MockAIService();
  });

  it('summarizeSession returns valid SessionSummary shape', async () => {
    const result = await service.summarizeSession('transcript text', {
      name: 'Alice',
      goal: 'Build confidence as a leader',
    });

    expect(typeof result.title).toBe('string');
    expect(typeof result.summary).toBe('string');
    expect(result.summary).toContain('Alice');
    expect(Array.isArray(result.key_topics)).toBe(true);
    expect(result.key_topics.length).toBeGreaterThan(0);
    expect(Array.isArray(result.action_items)).toBe(true);
    result.action_items.forEach(item => {
      expect(typeof item.description).toBe('string');
      expect(['coach', 'client']).toContain(item.assigned_to);
    });
  });

  it('generateEmbedding returns 1536-dim zero vector', async () => {
    const embedding = await service.generateEmbedding('some text');
    expect(embedding).toHaveLength(1536);
    expect(embedding.every(v => v === 0)).toBe(true);
  });

  it('isAvailable returns true', async () => {
    expect(await service.isAvailable()).toBe(true);
  });
});
