/**
 * Tests for useWaitingRoom hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useWaitingRoom } from '../useWaitingRoom';

// Mock fetch
global.fetch = jest.fn();

// Mock realtime subscription
jest.mock('@/lib/supabase/realtime', () => ({
  subscribeToMeetingEvents: jest.fn(() => ({
    unsubscribe: jest.fn(),
  })),
}));

describe('useWaitingRoom', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  describe('initialization', () => {
    it('should initialize with empty state', () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      });

      const { result } = renderHook(() => useWaitingRoom('test-meeting'));

      expect(result.current.waitingParticipants).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should fetch participants on mount', async () => {
      const mockParticipants = [
        {
          id: '1',
          user_id: 'user-1',
          display_name: 'User 1',
          status: 'waiting',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockParticipants }),
      });

      const { result } = renderHook(() => useWaitingRoom('test-meeting'));

      await waitFor(() => {
        expect(result.current.waitingParticipants).toEqual(mockParticipants);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/meetings/test-meeting/waiting-room'
      );
    });

    it('should not fetch if disabled', () => {
      const { result } = renderHook(() =>
        useWaitingRoom('test-meeting', false)
      );

      expect(global.fetch).not.toHaveBeenCalled();
      expect(result.current.waitingParticipants).toEqual([]);
    });
  });

  describe('admitParticipant', () => {
    it('should call admit API and update state', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ data: [{ user_id: 'user-1' }] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });

      const { result } = renderHook(() => useWaitingRoom('test-meeting'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.admitParticipant('user-1');
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/meetings/test-meeting/waiting-room/admit',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ user_id: 'user-1' }),
        })
      );
    });

    it('should handle admit error', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ data: [] }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ message: 'Failed to admit' }),
        });

      const { result } = renderHook(() => useWaitingRoom('test-meeting'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.admitParticipant('user-1');
        })
      ).rejects.toThrow('Failed to admit');

      expect(result.current.error).toBe('Failed to admit');
    });
  });

  describe('rejectParticipant', () => {
    it('should call reject API and update state', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ data: [{ user_id: 'user-1' }] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });

      const { result } = renderHook(() => useWaitingRoom('test-meeting'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.rejectParticipant('user-1');
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/meetings/test-meeting/waiting-room/reject',
        expect.objectContaining({
          method: 'DELETE',
          body: JSON.stringify({ user_id: 'user-1' }),
        })
      );
    });
  });

  describe('admitAll', () => {
    it('should admit all waiting participants', async () => {
      const mockParticipants = [
        {
          id: '1',
          user_id: 'user-1',
          display_name: 'User 1',
          status: 'waiting',
        },
        {
          id: '2',
          user_id: 'user-2',
          display_name: 'User 2',
          status: 'waiting',
        },
      ];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ data: mockParticipants }),
        })
        .mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });

      const { result } = renderHook(() => useWaitingRoom('test-meeting'));

      await waitFor(() => {
        expect(result.current.waitingParticipants).toHaveLength(2);
      });

      await act(async () => {
        await result.current.admitAll();
      });

      // Should have called admit for each participant
      expect(global.fetch).toHaveBeenCalledTimes(3); // 1 fetch + 2 admits
    });

    it('should not call API if no participants', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      });

      const { result } = renderHook(() => useWaitingRoom('test-meeting'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.admitAll();
      });

      // Only the initial fetch should have been called
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('refetch', () => {
    it('should refetch participants', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ data: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ data: [{ user_id: 'new-user' }] }),
        });

      const { result } = renderHook(() => useWaitingRoom('test-meeting'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.refetch();
      });

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});
