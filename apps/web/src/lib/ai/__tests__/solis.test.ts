import { createClient } from '@supabase/supabase-js';
import { searchSessions } from '../solis';

jest.mock('@supabase/supabase-js');

const mockRpc = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (createClient as jest.Mock).mockReturnValue({ rpc: mockRpc });
});

const validEmbedding = Array(1536).fill(0.1);

const fakeResults = [
  {
    id: 'sess-uuid-1',
    title: 'Goal Setting',
    session_date: '2026-01-10',
    summary: 'Client set Q1 goals.',
    key_topics: ['goals', 'Q1'],
    semantic_rank: 0.016,
    keyword_rank: 0,
  },
];

describe('searchSessions', () => {
  describe('happy path', () => {
    it('calls RPC with correct params', async () => {
      mockRpc.mockResolvedValue({ data: fakeResults, error: null });

      const result = await searchSessions(
        validEmbedding,
        'Q1 goals',
        'user-uuid',
        'client-uuid',
        3
      );

      expect(mockRpc).toHaveBeenCalledWith('hybrid_session_search', {
        p_user_id: 'user-uuid',
        p_client_id: 'client-uuid',
        p_query_text: 'Q1 goals',
        p_query_embedding: validEmbedding,
        p_match_count: 3,
      });
      expect(result).toEqual(fakeResults);
    });

    it('passes null p_client_id when clientId omitted', async () => {
      mockRpc.mockResolvedValue({ data: [], error: null });
      await searchSessions(validEmbedding, 'goals', 'user-uuid');
      expect(mockRpc).toHaveBeenCalledWith(
        'hybrid_session_search',
        expect.objectContaining({ p_client_id: null })
      );
    });

    it('uses default limit of 3', async () => {
      mockRpc.mockResolvedValue({ data: [], error: null });
      await searchSessions(validEmbedding, 'goals', 'user-uuid', 'client-uuid');
      expect(mockRpc).toHaveBeenCalledWith(
        'hybrid_session_search',
        expect.objectContaining({ p_match_count: 3 })
      );
    });

    it('returns [] when RPC returns null data', async () => {
      mockRpc.mockResolvedValue({ data: null, error: null });
      const result = await searchSessions(
        validEmbedding,
        '',
        'user-uuid',
        'client-uuid'
      );
      expect(result).toEqual([]);
    });

    it('passes empty queryText through (semantic-only fallback)', async () => {
      mockRpc.mockResolvedValue({ data: fakeResults, error: null });
      await searchSessions(validEmbedding, '', 'user-uuid', 'client-uuid');
      expect(mockRpc).toHaveBeenCalledWith(
        'hybrid_session_search',
        expect.objectContaining({ p_query_text: '' })
      );
    });
  });

  describe('limit clamping', () => {
    it('caps limit at 10', async () => {
      mockRpc.mockResolvedValue({ data: [], error: null });
      await searchSessions(
        validEmbedding,
        'goals',
        'user-uuid',
        'client-uuid',
        99
      );
      expect(mockRpc).toHaveBeenCalledWith(
        'hybrid_session_search',
        expect.objectContaining({ p_match_count: 10 })
      );
    });

    it('enforces minimum limit of 1', async () => {
      mockRpc.mockResolvedValue({ data: [], error: null });
      await searchSessions(
        validEmbedding,
        'goals',
        'user-uuid',
        'client-uuid',
        0
      );
      expect(mockRpc).toHaveBeenCalledWith(
        'hybrid_session_search',
        expect.objectContaining({ p_match_count: 1 })
      );
    });
  });

  describe('security validations', () => {
    it('throws on wrong embedding dimensions — RPC never called', async () => {
      await expect(
        searchSessions(
          Array(512).fill(0.1),
          'goals',
          'user-uuid',
          'client-uuid'
        )
      ).rejects.toThrow('Invalid query embedding');
      expect(mockRpc).not.toHaveBeenCalled();
    });

    it('throws on non-array embedding', async () => {
      await expect(
        searchSessions('not-array' as unknown as number[], 'goals', 'user-uuid')
      ).rejects.toThrow('Invalid query embedding');
      expect(mockRpc).not.toHaveBeenCalled();
    });

    it('throws on queryText > 1000 chars — RPC never called', async () => {
      await expect(
        searchSessions(
          validEmbedding,
          'a'.repeat(1001),
          'user-uuid',
          'client-uuid'
        )
      ).rejects.toThrow('Query text too long');
      expect(mockRpc).not.toHaveBeenCalled();
    });

    it('throws generic "Search failed" — no internal detail leaked', async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: { message: 'connection refused', code: '08006' },
      });
      await expect(
        searchSessions(validEmbedding, 'goals', 'user-uuid', 'client-uuid')
      ).rejects.toThrow('Search failed');
    });
  });
});
