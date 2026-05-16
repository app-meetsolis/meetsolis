import { runGenerateActionItems } from '../generate-action-items';

const mockSingle = jest.fn();
const mockDeleteEq = jest.fn();
const mockInsertSelect = jest.fn();

const selectChain = {
  eq: jest.fn(),
  single: mockSingle,
};

const mockFrom = jest.fn(() => ({
  select: jest.fn(() => selectChain),
  delete: jest.fn(() => ({ eq: mockDeleteEq })),
  insert: jest.fn(() => ({ select: mockInsertSelect })),
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ from: mockFrom })),
}));

const mockGenerateActionItems = jest.fn();
jest.mock('@/lib/service-factory', () => ({
  ServiceFactory: {
    createAIService: jest.fn(() => ({
      generateActionItems: mockGenerateActionItems,
    })),
  },
}));

jest.mock('@/lib/config/env', () => ({
  config: {
    supabase: { url: 'https://test.supabase.co', serviceRoleKey: 'test-key' },
  },
}));

const SESSION = {
  id: 's1',
  user_id: 'user-id',
  client_id: 'c1',
  transcript_text: 'transcript',
};
const CLIENT = { name: 'Alice', goal: 'Lead better', start_date: null };

describe('runGenerateActionItems', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    selectChain.eq.mockReturnValue(selectChain);
    mockDeleteEq.mockResolvedValue({ error: null });
  });

  it('skips when session not found', async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: null });
    const result = await runGenerateActionItems('s1', 'user-id');
    expect(result.status).toBe('skipped');
    expect(mockGenerateActionItems).not.toHaveBeenCalled();
  });

  it('skips on ownership mismatch', async () => {
    mockSingle.mockResolvedValueOnce({
      data: { ...SESSION, user_id: 'someone-else' },
      error: null,
    });
    const result = await runGenerateActionItems('s1', 'user-id');
    expect(result.status).toBe('skipped');
    expect(mockGenerateActionItems).not.toHaveBeenCalled();
  });

  it('skips when transcript_text is missing', async () => {
    mockSingle.mockResolvedValueOnce({
      data: { ...SESSION, transcript_text: null },
      error: null,
    });
    const result = await runGenerateActionItems('s1', 'user-id');
    expect(result.status).toBe('skipped');
    expect(mockGenerateActionItems).not.toHaveBeenCalled();
  });

  it('deletes existing items then inserts new ones (idempotent)', async () => {
    mockSingle
      .mockResolvedValueOnce({ data: SESSION, error: null })
      .mockResolvedValueOnce({ data: CLIENT, error: null });
    mockGenerateActionItems.mockResolvedValue({
      action_items: [
        { description: 'Do X', assigned_to: 'client' },
        { description: 'Send Y', assigned_to: 'coach' },
      ],
    });
    mockInsertSelect.mockResolvedValue({
      data: [
        { id: 'a1', description: 'Do X' },
        { id: 'a2', description: 'Send Y' },
      ],
      error: null,
    });

    const result = await runGenerateActionItems('s1', 'user-id');

    expect(result.status).toBe('complete');
    expect(result.action_items).toHaveLength(2);
    expect(mockDeleteEq).toHaveBeenCalledWith('session_id', 's1');
    expect(mockInsertSelect).toHaveBeenCalled();
    expect(mockGenerateActionItems).toHaveBeenCalledWith('transcript', {
      name: 'Alice',
      goal: 'Lead better',
      coaching_since: null,
    });
  });

  it('completes with no insert when AI returns zero items', async () => {
    mockSingle
      .mockResolvedValueOnce({ data: SESSION, error: null })
      .mockResolvedValueOnce({ data: CLIENT, error: null });
    mockGenerateActionItems.mockResolvedValue({ action_items: [] });

    const result = await runGenerateActionItems('s1', 'user-id');

    expect(result.status).toBe('complete');
    expect(result.action_items).toEqual([]);
    expect(mockDeleteEq).toHaveBeenCalledWith('session_id', 's1');
    expect(mockInsertSelect).not.toHaveBeenCalled();
  });

  it('returns error when AI throws', async () => {
    mockSingle
      .mockResolvedValueOnce({ data: SESSION, error: null })
      .mockResolvedValueOnce({ data: CLIENT, error: null });
    mockGenerateActionItems.mockRejectedValue(new Error('AI timeout'));

    const result = await runGenerateActionItems('s1', 'user-id');

    expect(result.status).toBe('error');
    expect(result.action_items).toEqual([]);
  });
});
