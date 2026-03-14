import { runSummarize } from '../summarize-session';

// Mock Supabase
const mockUpdate = jest.fn().mockReturnThis();
const mockEq = jest.fn().mockReturnThis();
const mockSingle = jest.fn();
const mockDelete = jest.fn().mockReturnThis();
const mockInsert = jest.fn().mockResolvedValue({ error: null });

const mockFrom = jest.fn(() => ({
  select: jest.fn().mockReturnThis(),
  update: mockUpdate,
  delete: mockDelete,
  insert: mockInsert,
  eq: mockEq,
  single: mockSingle,
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ from: mockFrom })),
}));

// Mock ServiceFactory
const mockSummarizeSession = jest.fn();
const mockGenerateEmbedding = jest.fn();
jest.mock('@/lib/service-factory', () => ({
  ServiceFactory: {
    createAIService: jest.fn(() => ({
      summarizeSession: mockSummarizeSession,
      generateEmbedding: mockGenerateEmbedding,
    })),
  },
}));

// Mock config
jest.mock('@/lib/config/env', () => ({
  config: {
    supabase: { url: 'https://test.supabase.co', serviceRoleKey: 'test-key' },
  },
}));

describe('runSummarize', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockDelete.mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    });
    mockEq.mockReturnValue({ single: mockSingle, eq: mockEq });
  });

  it('does nothing if session not found', async () => {
    mockSingle.mockResolvedValue({ data: null, error: null });
    await runSummarize('session-id', 'user-id');
    expect(mockSummarizeSession).not.toHaveBeenCalled();
  });

  it('does nothing if ownership mismatch', async () => {
    mockSingle.mockResolvedValueOnce({
      data: {
        id: 's1',
        user_id: 'other-user',
        client_id: 'c1',
        transcript_text: 'text',
      },
      error: null,
    });
    await runSummarize('session-id', 'user-id');
    expect(mockSummarizeSession).not.toHaveBeenCalled();
  });

  it('does nothing if no transcript_text', async () => {
    mockSingle.mockResolvedValueOnce({
      data: {
        id: 's1',
        user_id: 'user-id',
        client_id: 'c1',
        transcript_text: null,
      },
      error: null,
    });
    await runSummarize('session-id', 'user-id');
    expect(mockSummarizeSession).not.toHaveBeenCalled();
  });

  it('calls AI and updates session on success', async () => {
    const mockSummary = {
      title: 'Test Session',
      summary: 'Client explored goals.',
      key_topics: ['goals', 'leadership'],
      action_items: [{ description: 'Do X', assigned_to: 'client' as const }],
    };

    mockSingle
      .mockResolvedValueOnce({
        data: {
          id: 's1',
          user_id: 'user-id',
          client_id: 'c1',
          transcript_text: 'transcript',
        },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { name: 'Alice', goal: 'Lead better', start_date: null },
        error: null,
      });

    mockSummarizeSession.mockResolvedValue(mockSummary);
    mockGenerateEmbedding.mockResolvedValue(Array(1536).fill(0));
    mockUpdate.mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    });

    await runSummarize('s1', 'user-id');

    expect(mockSummarizeSession).toHaveBeenCalledWith('transcript', {
      name: 'Alice',
      goal: 'Lead better',
      coaching_since: null,
    });
    expect(mockGenerateEmbedding).toHaveBeenCalledWith(
      'Client explored goals.'
    );
    expect(mockInsert).toHaveBeenCalled();
  });

  it('sets status=error when AI throws', async () => {
    mockSingle
      .mockResolvedValueOnce({
        data: {
          id: 's1',
          user_id: 'user-id',
          client_id: 'c1',
          transcript_text: 'text',
        },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { name: 'Bob', goal: null, start_date: null },
        error: null,
      });

    mockSummarizeSession.mockRejectedValue(new Error('OpenAI timeout'));
    const updateEqMock = jest.fn().mockResolvedValue({ error: null });
    mockUpdate.mockReturnValue({ eq: updateEqMock });

    await runSummarize('s1', 'user-id');

    expect(updateEqMock).toHaveBeenCalledWith('id', 's1');
  });
});
