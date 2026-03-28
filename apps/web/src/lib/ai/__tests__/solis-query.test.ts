/**
 * Story 4.2 — solis-query unit tests
 * Tests: parseSolisResponse, buildSolisContext, buildSolisQueryPrompt
 */

import { createClient } from '@supabase/supabase-js';

// Mock service-factory BEFORE importing solis (prevents transitive openai load)
jest.mock('@/lib/service-factory', () => ({
  ServiceFactory: {
    createAIService: jest.fn(),
    clearAllServices: jest.fn(),
  },
}));

jest.mock('@supabase/supabase-js');

import {
  parseSolisResponse,
  buildSolisContext,
  SessionSearchResult,
} from '../solis';
import { buildSolisQueryPrompt } from '../prompts';
import { ServiceFactory } from '@/lib/service-factory';

// ---------------------------------------------------------------------------
// Shared test data
// ---------------------------------------------------------------------------

const makeSession = (
  id: string,
  overrides: Partial<SessionSearchResult> = {}
): SessionSearchResult => ({
  id,
  title: `Session ${id}`,
  session_date: '2026-01-15',
  summary: `Summary for ${id}`,
  key_topics: ['goals', 'leadership'],
  semantic_rank: 0,
  keyword_rank: 0,
  ...overrides,
});

// ---------------------------------------------------------------------------
// Supabase chain mock helpers
// ---------------------------------------------------------------------------

const mockLimit = jest.fn();
const mockOrder = jest.fn().mockReturnValue({ limit: mockLimit });
const mockEq = jest.fn();
const mockSelect = jest.fn();
const mockFrom = jest.fn();
const mockRpc = jest.fn(); // used by searchSessions internally

mockEq.mockReturnValue({ eq: mockEq, order: mockOrder });
mockSelect.mockReturnValue({ eq: mockEq });
mockFrom.mockReturnValue({ select: mockSelect });

const mockGenerateEmbedding = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();

  mockLimit.mockResolvedValue({ data: [], error: null });
  mockOrder.mockReturnValue({ limit: mockLimit });
  mockEq.mockReturnValue({ eq: mockEq, order: mockOrder });
  mockSelect.mockReturnValue({ eq: mockEq });
  mockFrom.mockReturnValue({ select: mockSelect });
  mockRpc.mockResolvedValue({ data: [], error: null });

  (createClient as jest.Mock).mockReturnValue({ from: mockFrom, rpc: mockRpc });

  (ServiceFactory.createAIService as jest.Mock).mockReturnValue({
    generateEmbedding: mockGenerateEmbedding,
  });

  mockGenerateEmbedding.mockResolvedValue(Array(1536).fill(0));
});

// =============================================================================
// parseSolisResponse
// =============================================================================

describe('parseSolisResponse', () => {
  const sessions = [makeSession('sess-1'), makeSession('sess-2')];

  it('parses valid JSON and maps citations', () => {
    const raw = JSON.stringify({
      answer: 'Client focused on delegation.',
      cited_sessions: ['sess-1'],
    });

    const result = parseSolisResponse(raw, sessions);

    expect(result.answer).toBe('Client focused on delegation.');
    expect(result.citations).toHaveLength(1);
    expect(result.citations[0]).toEqual({
      session_id: 'sess-1',
      session_date: '2026-01-15',
      title: 'Session sess-1',
    });
  });

  it('filters out hallucinated citation IDs not in sessions', () => {
    const raw = JSON.stringify({
      answer: 'Some answer.',
      cited_sessions: ['sess-1', 'hallucinated-id-999'],
    });

    const result = parseSolisResponse(raw, sessions);

    expect(result.citations).toHaveLength(1);
    expect(result.citations[0].session_id).toBe('sess-1');
  });

  it('returns empty citations when cited_sessions missing', () => {
    const raw = JSON.stringify({ answer: 'No citations here.' });

    const result = parseSolisResponse(raw, sessions);

    expect(result.answer).toBe('No citations here.');
    expect(result.citations).toHaveLength(0);
  });

  it('falls back to raw text on malformed JSON', () => {
    const raw = 'This is not JSON at all.';

    const result = parseSolisResponse(raw, sessions);

    expect(result.answer).toBe('This is not JSON at all.');
    expect(result.citations).toHaveLength(0);
  });

  it('handles empty sessions array — no citations possible', () => {
    const raw = JSON.stringify({
      answer: 'Some answer.',
      cited_sessions: ['sess-1'],
    });

    const result = parseSolisResponse(raw, []);
    expect(result.citations).toHaveLength(0);
  });

  it('handles empty cited_sessions array', () => {
    const raw = JSON.stringify({
      answer: 'No sessions cited.',
      cited_sessions: [],
    });
    const result = parseSolisResponse(raw, sessions);
    expect(result.answer).toBe('No sessions cited.');
    expect(result.citations).toHaveLength(0);
  });
});

// =============================================================================
// buildSolisQueryPrompt
// =============================================================================

describe('buildSolisQueryPrompt', () => {
  const sessions = [makeSession('sess-abc')];

  it('includes SESSION_ID in context', () => {
    const prompt = buildSolisQueryPrompt('What are the goals?', sessions);
    expect(prompt).toContain('[SESSION_ID: sess-abc]');
  });

  it('wraps user query in <user_query> tags', () => {
    const prompt = buildSolisQueryPrompt('What are the goals?', sessions);
    expect(prompt).toContain('<user_query>What are the goals?</user_query>');
  });

  it('includes session date and title', () => {
    const prompt = buildSolisQueryPrompt('query', sessions);
    expect(prompt).toContain('2026-01-15');
    expect(prompt).toContain('Session sess-abc');
  });

  it('includes topics', () => {
    const prompt = buildSolisQueryPrompt('query', sessions);
    expect(prompt).toContain('goals');
    expect(prompt).toContain('leadership');
  });

  it('handles empty sessions gracefully', () => {
    const prompt = buildSolisQueryPrompt('query', []);
    expect(prompt).toContain('<user_query>query</user_query>');
    // SESSION CONTEXT omitted when no sessions — clientMeta will provide context instead
    expect(prompt).not.toContain('SESSION CONTEXT:');
  });
});

// =============================================================================
// buildSolisContext
// =============================================================================

describe('buildSolisContext', () => {
  it('skips pgvector (no RPC call) when embedding is zero vector', async () => {
    mockGenerateEmbedding.mockResolvedValue(Array(1536).fill(0));

    await buildSolisContext('What are goals?', 'user-1');

    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('calls hybrid_session_search RPC when embedding has non-zero values', async () => {
    const realEmbedding = Array(1536).fill(0.01);
    mockGenerateEmbedding.mockResolvedValue(realEmbedding);
    mockRpc.mockResolvedValue({
      data: [
        {
          id: 'sem-1',
          title: 'Sem Session',
          session_date: '2026-01-10',
          summary: 'x',
          key_topics: [],
          semantic_rank: 0.016,
          keyword_rank: 0,
        },
      ],
      error: null,
    });

    const result = await buildSolisContext('What are goals?', 'user-1');

    expect(mockRpc).toHaveBeenCalledWith(
      'hybrid_session_search',
      expect.objectContaining({
        p_user_id: 'user-1',
        p_query_text: 'What are goals?',
      })
    );
    expect(result.sessions.some(s => s.id === 'sem-1')).toBe(true);
  });

  it('deduplicates sessions from semantic + recency results', async () => {
    const realEmbedding = Array(1536).fill(0.01);
    mockGenerateEmbedding.mockResolvedValue(realEmbedding);

    // Recency: shared-1 + recent-1
    mockLimit.mockResolvedValue({
      data: [
        {
          id: 'shared-1',
          title: 'Shared',
          session_date: '2026-01-15',
          summary: 'x',
          key_topics: [],
        },
        {
          id: 'recent-1',
          title: 'Recent',
          session_date: '2026-01-14',
          summary: 'x',
          key_topics: [],
        },
      ],
      error: null,
    });

    // Semantic: shared-1 (dup) + sem-2
    mockRpc.mockResolvedValue({
      data: [
        {
          id: 'shared-1',
          title: 'Shared',
          session_date: '2026-01-15',
          summary: 'x',
          key_topics: [],
          semantic_rank: 0.02,
          keyword_rank: 0,
        },
        {
          id: 'sem-2',
          title: 'Sem 2',
          session_date: '2026-01-12',
          summary: 'x',
          key_topics: [],
          semantic_rank: 0.01,
          keyword_rank: 0,
        },
      ],
      error: null,
    });

    const result = await buildSolisContext('query', 'user-1');

    const ids = result.sessions.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.filter(id => id === 'shared-1')).toHaveLength(1);
  });

  it('caps merged sessions at 6', async () => {
    const realEmbedding = Array(1536).fill(0.01);
    mockGenerateEmbedding.mockResolvedValue(realEmbedding);

    // 3 semantic
    mockRpc.mockResolvedValue({
      data: [
        {
          id: 's1',
          title: 's1',
          session_date: '2026-01-15',
          summary: 'x',
          key_topics: [],
          semantic_rank: 0,
          keyword_rank: 0,
        },
        {
          id: 's2',
          title: 's2',
          session_date: '2026-01-14',
          summary: 'x',
          key_topics: [],
          semantic_rank: 0,
          keyword_rank: 0,
        },
        {
          id: 's3',
          title: 's3',
          session_date: '2026-01-13',
          summary: 'x',
          key_topics: [],
          semantic_rank: 0,
          keyword_rank: 0,
        },
      ],
      error: null,
    });
    // 5 recency (all unique)
    mockLimit.mockResolvedValue({
      data: ['r1', 'r2', 'r3', 'r4', 'r5'].map(id => ({
        id,
        title: id,
        session_date: '2026-01-10',
        summary: 'x',
        key_topics: [],
      })),
      error: null,
    });

    const result = await buildSolisContext('query', 'user-1');

    expect(result.sessions.length).toBeLessThanOrEqual(6);
  });

  it('returns prompt string containing the query', async () => {
    mockGenerateEmbedding.mockResolvedValue(Array(1536).fill(0));

    const result = await buildSolisContext('How is client doing?', 'user-1');

    expect(typeof result.prompt).toBe('string');
    expect(result.prompt).toContain(
      '<user_query>How is client doing?</user_query>'
    );
  });
});
