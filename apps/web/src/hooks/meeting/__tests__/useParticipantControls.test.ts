/**
 * Tests for useParticipantControls hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useParticipantControls } from '../useParticipantControls';

// Mock fetch
global.fetch = jest.fn();

// Mock useLayoutConfig
jest.mock('@/hooks/useLayoutConfig', () => ({
  useLayoutConfig: () => ({
    setSpotlightParticipant: jest.fn(),
  }),
}));

describe('useParticipantControls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  describe('initialization', () => {
    it('should initialize with correct default states', () => {
      const { result } = renderHook(() =>
        useParticipantControls({
          meetingId: 'test-meeting',
          currentUserRole: 'host',
        })
      );

      expect(result.current.isSpotlighting).toBe(false);
      expect(result.current.isChangingRole).toBe(false);
      expect(result.current.isRemoving).toBe(false);
      expect(result.current.isMuting).toBe(false);
      expect(result.current.spotlightError).toBeNull();
      expect(result.current.roleError).toBeNull();
      expect(result.current.removeError).toBeNull();
      expect(result.current.muteError).toBeNull();
    });
  });

  describe('setSpotlight', () => {
    it('should call spotlight API when user is host', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const { result } = renderHook(() =>
        useParticipantControls({
          meetingId: 'test-meeting',
          currentUserRole: 'host',
        })
      );

      await act(async () => {
        await result.current.setSpotlight('participant-123');
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/meetings/test-meeting/spotlight',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ spotlight_participant_id: 'participant-123' }),
        })
      );
    });

    it('should call spotlight API when user is co-host', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const { result } = renderHook(() =>
        useParticipantControls({
          meetingId: 'test-meeting',
          currentUserRole: 'co-host',
        })
      );

      await act(async () => {
        await result.current.setSpotlight('participant-123');
      });

      expect(global.fetch).toHaveBeenCalled();
    });

    it('should set error when user is participant', async () => {
      const { result } = renderHook(() =>
        useParticipantControls({
          meetingId: 'test-meeting',
          currentUserRole: 'participant',
        })
      );

      await act(async () => {
        await result.current.setSpotlight('participant-123');
      });

      expect(global.fetch).not.toHaveBeenCalled();
      expect(result.current.spotlightError).toBe(
        'Only host or co-host can spotlight participants'
      );
    });

    it('should clear spotlight with null', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const { result } = renderHook(() =>
        useParticipantControls({
          meetingId: 'test-meeting',
          currentUserRole: 'host',
        })
      );

      await act(async () => {
        await result.current.setSpotlight(null);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/meetings/test-meeting/spotlight',
        expect.objectContaining({
          body: JSON.stringify({ spotlight_participant_id: null }),
        })
      );
    });
  });

  describe('changeRole', () => {
    it('should call role API when user is host', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const { result } = renderHook(() =>
        useParticipantControls({
          meetingId: 'test-meeting',
          currentUserRole: 'host',
        })
      );

      await act(async () => {
        await result.current.changeRole('participant-123', 'co-host');
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/meetings/test-meeting/participants/participant-123/role',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ role: 'co-host' }),
        })
      );
    });

    it('should set error when user is not host', async () => {
      const { result } = renderHook(() =>
        useParticipantControls({
          meetingId: 'test-meeting',
          currentUserRole: 'co-host',
        })
      );

      await act(async () => {
        await result.current.changeRole('participant-123', 'co-host');
      });

      expect(global.fetch).not.toHaveBeenCalled();
      expect(result.current.roleError).toBe(
        'Only host can change participant roles'
      );
    });

    it('should handle role change error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Cannot demote last host' }),
      });

      const { result } = renderHook(() =>
        useParticipantControls({
          meetingId: 'test-meeting',
          currentUserRole: 'host',
        })
      );

      await act(async () => {
        await result.current.changeRole('participant-123', 'participant');
      });

      expect(result.current.roleError).toBe('Cannot demote last host');
    });
  });

  describe('removeParticipant', () => {
    it('should call remove API when user is host', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const { result } = renderHook(() =>
        useParticipantControls({
          meetingId: 'test-meeting',
          currentUserRole: 'host',
        })
      );

      await act(async () => {
        await result.current.removeParticipant('participant-123');
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/meetings/test-meeting/participants/participant-123/remove',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('should call remove API when user is co-host', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const { result } = renderHook(() =>
        useParticipantControls({
          meetingId: 'test-meeting',
          currentUserRole: 'co-host',
        })
      );

      await act(async () => {
        await result.current.removeParticipant('participant-123');
      });

      expect(global.fetch).toHaveBeenCalled();
    });

    it('should set error when user is participant', async () => {
      const { result } = renderHook(() =>
        useParticipantControls({
          meetingId: 'test-meeting',
          currentUserRole: 'participant',
        })
      );

      await act(async () => {
        await result.current.removeParticipant('participant-123');
      });

      expect(global.fetch).not.toHaveBeenCalled();
      expect(result.current.removeError).toBe(
        'Only host or co-host can remove participants'
      );
    });
  });

  describe('requestMute', () => {
    it('should not set error when user is host', async () => {
      const { result } = renderHook(() =>
        useParticipantControls({
          meetingId: 'test-meeting',
          currentUserRole: 'host',
        })
      );

      await act(async () => {
        await result.current.requestMute('participant-123');
      });

      expect(result.current.muteError).toBeNull();
    });

    it('should set error when user is participant', async () => {
      const { result } = renderHook(() =>
        useParticipantControls({
          meetingId: 'test-meeting',
          currentUserRole: 'participant',
        })
      );

      await act(async () => {
        await result.current.requestMute('participant-123');
      });

      expect(result.current.muteError).toBe(
        'Only host or co-host can mute participants'
      );
    });
  });
});
