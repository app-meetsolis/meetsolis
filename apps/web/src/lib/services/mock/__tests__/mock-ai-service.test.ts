import { MockAIService } from '../mock-ai-service';

describe('MockAIService', () => {
  let service: MockAIService;

  beforeEach(() => {
    service = new MockAIService();
  });

  it('summarizeSession returns summary + key_topics only', async () => {
    const result = await service.summarizeSession('transcript text', {
      name: 'Alice',
      goal: 'Build confidence as a leader',
    });

    expect(typeof result.summary).toBe('string');
    expect(result.summary).toContain('Alice');
    expect(Array.isArray(result.key_topics)).toBe(true);
    expect(result.key_topics.length).toBeGreaterThan(0);
    expect(result).not.toHaveProperty('action_items');
  });

  it('generateActionItems returns coach/client-assigned items', async () => {
    const result = await service.generateActionItems('transcript text', {
      name: 'Alice',
      goal: 'Build confidence as a leader',
    });

    expect(Array.isArray(result.action_items)).toBe(true);
    expect(result.action_items.length).toBeGreaterThan(0);
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
