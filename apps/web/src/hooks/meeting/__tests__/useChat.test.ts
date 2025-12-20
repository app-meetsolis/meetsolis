/**
 * useChat Hook Tests
 * Tests for Story 2.4 - Real-time messaging hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useChat } from '../useChat';
import { Message } from '@meetsolis/shared';

// Mock Supabase
const mockChannel = {
  on: jest.fn().mockReturnThis(),
  subscribe: jest.fn(callback => {
    callback('SUBSCRIBED');
    return mockChannel;
  }),
};

const mockSelect = jest.fn().mockReturnThis();
const mockEq = jest.fn().mockReturnThis();
const mockOrder = jest.fn().mockReturnThis();
const mockLimit = jest.fn().mockResolvedValue({ data: [], error: null });
const mockInsert = jest.fn().mockReturnThis();
const mockUpdate = jest.fn().mockReturnThis();
const mockSingle = jest.fn();

const mockSupabase = {
  channel: jest.fn(() => mockChannel),
  from: jest.fn(() => ({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
  })),
  removeChannel: jest.fn(),
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase),
}));

const mockMeetingId = 'meeting-1';
const mockUserId = 'user-1';

describe('useChat', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock chain
    mockSelect.mockReturnValue({
      eq: mockEq,
    });

    mockEq.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
    });

    mockOrder.mockReturnValue({
      limit: mockLimit,
    });

    mockInsert.mockReturnValue({
      select: () => ({
        single: mockSingle,
      }),
    });

    mockUpdate.mockReturnValue({
      eq: mockEq,
    });
  });

  describe('Initialization', () => {
    it('should initialize with empty messages', () => {
      const { result } = renderHook(() =>
        useChat({
          meetingId: mockMeetingId,
          currentUserId: mockUserId,
        })
      );

      expect(result.current.messages).toEqual([]);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should fetch initial messages on mount', async () => {
      const mockMessages: Message[] = [
        {
          id: 'msg-1',
          meeting_id: mockMeetingId,
          sender_id: 'user-2',
          content: 'Hello',
          type: 'public',
          recipient_id: null,
          timestamp: new Date().toISOString(),
          edited_at: null,
          is_deleted: false,
          message_read_by: [],
          file_id: null,
          metadata: {},
          created_at: new Date().toISOString(),
        },
      ];

      mockLimit.mockResolvedValueOnce({ data: mockMessages, error: null });

      const { result } = renderHook(() =>
        useChat({
          meetingId: mockMeetingId,
          currentUserId: mockUserId,
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.messages).toEqual(mockMessages);
    });

    it('should handle fetch error', async () => {
      const fetchError = new Error('Failed to fetch');
      mockLimit.mockResolvedValueOnce({ data: null, error: fetchError });

      const { result } = renderHook(() =>
        useChat({
          meetingId: mockMeetingId,
          currentUserId: mockUserId,
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toEqual(fetchError);
    });
  });

  describe('Realtime Subscription', () => {
    it('should subscribe to messages channel', async () => {
      renderHook(() =>
        useChat({
          meetingId: mockMeetingId,
          currentUserId: mockUserId,
        })
      );

      await waitFor(() => {
        expect(mockSupabase.channel).toHaveBeenCalledWith(
          `meeting:${mockMeetingId}:messages`
        );
      });

      expect(mockChannel.on).toHaveBeenCalled();
      expect(mockChannel.subscribe).toHaveBeenCalled();
    });

    it('should set isConnected when subscribed', async () => {
      const { result } = renderHook(() =>
        useChat({
          meetingId: mockMeetingId,
          currentUserId: mockUserId,
        })
      );

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });
    });

    it('should not subscribe when disabled', () => {
      renderHook(() =>
        useChat({
          meetingId: mockMeetingId,
          currentUserId: mockUserId,
          enabled: false,
        })
      );

      expect(mockSupabase.channel).not.toHaveBeenCalled();
    });
  });

  describe('Send Message', () => {
    it('should send public message', async () => {
      mockSingle.mockResolvedValueOnce({
        data: {
          id: 'msg-new',
          meeting_id: mockMeetingId,
          sender_id: mockUserId,
          content: 'Test message',
          type: 'public',
          recipient_id: null,
          timestamp: new Date().toISOString(),
          edited_at: null,
          is_deleted: false,
          message_read_by: [],
          file_id: null,
          metadata: {},
          created_at: new Date().toISOString(),
        },
        error: null,
      });

      const { result } = renderHook(() =>
        useChat({
          meetingId: mockMeetingId,
          currentUserId: mockUserId,
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.sendMessage('Test message', 'public');
      });

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          meeting_id: mockMeetingId,
          sender_id: mockUserId,
          content: 'Test message',
          type: 'public',
        })
      );
    });

    it('should send private message with recipient', async () => {
      mockSingle.mockResolvedValueOnce({
        data: {
          id: 'msg-private',
          meeting_id: mockMeetingId,
          sender_id: mockUserId,
          content: 'Private message',
          type: 'private',
          recipient_id: 'user-2',
          timestamp: new Date().toISOString(),
          edited_at: null,
          is_deleted: false,
          message_read_by: [],
          file_id: null,
          metadata: {},
          created_at: new Date().toISOString(),
        },
        error: null,
      });

      const { result } = renderHook(() =>
        useChat({
          meetingId: mockMeetingId,
          currentUserId: mockUserId,
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.sendMessage(
          'Private message',
          'private',
          'user-2'
        );
      });

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          recipient_id: 'user-2',
          type: 'private',
        })
      );
    });

    it('should handle optimistic updates', async () => {
      // Delay the insert to see optimistic update
      mockSingle.mockImplementation(
        () =>
          new Promise(resolve => {
            setTimeout(() => {
              resolve({
                data: {
                  id: 'msg-real',
                  meeting_id: mockMeetingId,
                  sender_id: mockUserId,
                  content: 'Test',
                  type: 'public',
                  recipient_id: null,
                  timestamp: new Date().toISOString(),
                  edited_at: null,
                  is_deleted: false,
                  message_read_by: [],
                  file_id: null,
                  metadata: {},
                  created_at: new Date().toISOString(),
                },
                error: null,
              });
            }, 100);
          })
      );

      const { result } = renderHook(() =>
        useChat({
          meetingId: mockMeetingId,
          currentUserId: mockUserId,
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Send message
      act(() => {
        result.current.sendMessage('Test', 'public');
      });

      // Should have optimistic message immediately
      await waitFor(() => {
        expect(result.current.messages.length).toBeGreaterThan(0);
        expect(result.current.messages[0].content).toBe('Test');
      });
    });
  });

  describe('Edit Message', () => {
    it('should edit message', async () => {
      mockUpdate.mockReturnValueOnce({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      const { result } = renderHook(() =>
        useChat({
          meetingId: mockMeetingId,
          currentUserId: mockUserId,
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.editMessage('msg-1', 'Updated content');
      });

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Updated content',
        })
      );
    });
  });

  describe('Delete Message', () => {
    it('should soft delete message', async () => {
      mockUpdate.mockReturnValueOnce({
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      const { result } = renderHook(() =>
        useChat({
          meetingId: mockMeetingId,
          currentUserId: mockUserId,
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteMessage('msg-1');
      });

      expect(mockUpdate).toHaveBeenCalledWith({ is_deleted: true });
    });
  });
});
