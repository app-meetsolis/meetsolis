/**
 * useMediaStream Hook Tests
 * Tests for local media stream management hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useMediaStream } from '../useMediaStream';
import { WebRTCErrorCode } from '../../../../../packages/shared/types/webrtc';

// Mock MediaStream and tracks
const mockAudioTrack = {
  kind: 'audio',
  enabled: true,
  stop: jest.fn(),
} as unknown as MediaStreamTrack;

const mockVideoTrack = {
  kind: 'video',
  enabled: true,
  stop: jest.fn(),
} as unknown as MediaStreamTrack;

const mockMediaStream = {
  getTracks: jest.fn(() => [mockAudioTrack, mockVideoTrack]),
  getAudioTracks: jest.fn(() => [mockAudioTrack]),
  getVideoTracks: jest.fn(() => [mockVideoTrack]),
  addTrack: jest.fn(),
  removeTrack: jest.fn(),
} as unknown as MediaStream;

const mockGetUserMedia = jest.fn();

// Setup navigator.mediaDevices mock
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia,
  },
  writable: true,
});

describe('useMediaStream', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserMedia.mockResolvedValue(mockMediaStream);
    mockAudioTrack.enabled = true;
    mockVideoTrack.enabled = true;
  });

  describe('Initialization', () => {
    it('should initialize media stream with default constraints', async () => {
      const { result } = renderHook(() => useMediaStream());

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.stream).toBe(mockMediaStream);
      expect(result.current.error).toBeNull();
      expect(result.current.isAudioEnabled).toBe(true);
      expect(result.current.isVideoEnabled).toBe(true);

      expect(mockGetUserMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          audio: expect.objectContaining({
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          }),
          video: expect.objectContaining({
            width: expect.any(Object),
            height: expect.any(Object),
            frameRate: expect.any(Object),
          }),
        })
      );
    });

    it('should initialize with HD video quality', async () => {
      const { result } = renderHook(() =>
        useMediaStream({ videoQuality: 'hd' })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGetUserMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          video: expect.objectContaining({
            width: { min: 640, ideal: 1280, max: 1920 },
            height: { min: 480, ideal: 720, max: 1080 },
          }),
        })
      );
    });

    it('should initialize with Full HD video quality', async () => {
      const { result } = renderHook(() =>
        useMediaStream({ videoQuality: 'fullhd' })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGetUserMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          video: expect.objectContaining({
            width: { min: 1280, ideal: 1920, max: 1920 },
            height: { min: 720, ideal: 1080, max: 1080 },
          }),
        })
      );
    });

    it('should initialize with high audio quality', async () => {
      const { result } = renderHook(() =>
        useMediaStream({ audioQuality: 'high' })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGetUserMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          audio: expect.objectContaining({
            sampleRate: 48000,
            channelCount: 2,
          }),
        })
      );
    });

    it('should handle permission denied error', async () => {
      const error = new DOMException('Permission denied', 'NotAllowedError');
      mockGetUserMedia.mockRejectedValue(error);

      const { result } = renderHook(() => useMediaStream());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.stream).toBeNull();
      expect(result.current.error).not.toBeNull();
      expect(result.current.error?.message).toContain('permission denied');
      expect((result.current.error as any)?.code).toBe(
        WebRTCErrorCode.PERMISSION_DENIED
      );
    });

    it('should handle device not found error', async () => {
      const error = new DOMException('Device not found', 'NotFoundError');
      mockGetUserMedia.mockRejectedValue(error);

      const { result } = renderHook(() => useMediaStream());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.stream).toBeNull();
      expect(result.current.error).not.toBeNull();
      expect(result.current.error?.message).toContain(
        'No camera/microphone found'
      );
      expect((result.current.error as any)?.code).toBe(
        WebRTCErrorCode.DEVICE_NOT_FOUND
      );
    });
  });

  describe('toggleAudio', () => {
    it('should toggle audio track', async () => {
      const { result } = renderHook(() => useMediaStream());

      await waitFor(() => {
        expect(result.current.stream).not.toBeNull();
      });

      act(() => {
        result.current.toggleAudio();
      });

      expect(mockAudioTrack.enabled).toBe(false);
      expect(result.current.isAudioEnabled).toBe(false);

      act(() => {
        result.current.toggleAudio();
      });

      expect(mockAudioTrack.enabled).toBe(true);
      expect(result.current.isAudioEnabled).toBe(true);
    });
  });

  describe('toggleVideo', () => {
    it('should toggle video track', async () => {
      const { result } = renderHook(() => useMediaStream());

      await waitFor(() => {
        expect(result.current.stream).not.toBeNull();
      });

      act(() => {
        result.current.toggleVideo();
      });

      expect(mockVideoTrack.enabled).toBe(false);
      expect(result.current.isVideoEnabled).toBe(false);

      act(() => {
        result.current.toggleVideo();
      });

      expect(mockVideoTrack.enabled).toBe(true);
      expect(result.current.isVideoEnabled).toBe(true);
    });
  });

  describe('stop', () => {
    it('should stop all tracks', async () => {
      const { result } = renderHook(() => useMediaStream());

      await waitFor(() => {
        expect(result.current.stream).not.toBeNull();
      });

      act(() => {
        result.current.stop();
      });

      expect(mockAudioTrack.stop).toHaveBeenCalled();
      expect(mockVideoTrack.stop).toHaveBeenCalled();
      expect(result.current.stream).toBeNull();
    });
  });

  describe('restart', () => {
    it('should restart stream', async () => {
      const { result } = renderHook(() => useMediaStream());

      await waitFor(() => {
        expect(result.current.stream).not.toBeNull();
      });

      await act(async () => {
        await result.current.restart();
      });

      await waitFor(() => {
        expect(mockAudioTrack.stop).toHaveBeenCalled();
        expect(mockVideoTrack.stop).toHaveBeenCalled();
        expect(mockGetUserMedia).toHaveBeenCalledTimes(2); // Initial + restart
      });
    });
  });

  describe('replaceTrack', () => {
    it('should replace audio track', async () => {
      const newAudioTrack = {
        kind: 'audio',
        enabled: true,
      } as MediaStreamTrack;
      const newStream = {
        getAudioTracks: jest.fn(() => [newAudioTrack]),
      } as unknown as MediaStream;

      mockGetUserMedia
        .mockResolvedValueOnce(mockMediaStream)
        .mockResolvedValueOnce(newStream);

      const { result } = renderHook(() => useMediaStream());

      await waitFor(() => {
        expect(result.current.stream).not.toBeNull();
      });

      await act(async () => {
        await result.current.replaceTrack('audio', 'new-device-id');
      });

      expect(mockMediaStream.addTrack).toHaveBeenCalledWith(newAudioTrack);
      expect(mockMediaStream.removeTrack).toHaveBeenCalledWith(mockAudioTrack);
      expect(mockAudioTrack.stop).toHaveBeenCalled();
    });

    it('should replace video track', async () => {
      const newVideoTrack = {
        kind: 'video',
        enabled: true,
      } as MediaStreamTrack;
      const newStream = {
        getVideoTracks: jest.fn(() => [newVideoTrack]),
      } as unknown as MediaStream;

      mockGetUserMedia
        .mockResolvedValueOnce(mockMediaStream)
        .mockResolvedValueOnce(newStream);

      const { result } = renderHook(() => useMediaStream());

      await waitFor(() => {
        expect(result.current.stream).not.toBeNull();
      });

      await act(async () => {
        await result.current.replaceTrack('video', 'new-device-id');
      });

      expect(mockMediaStream.addTrack).toHaveBeenCalledWith(newVideoTrack);
      expect(mockMediaStream.removeTrack).toHaveBeenCalledWith(mockVideoTrack);
      expect(mockVideoTrack.stop).toHaveBeenCalled();
    });

    it('should throw error when no active stream', async () => {
      const { result } = renderHook(() => useMediaStream());

      await waitFor(() => {
        expect(result.current.stream).not.toBeNull();
      });

      act(() => {
        result.current.stop();
      });

      await expect(
        result.current.replaceTrack('audio', 'device-id')
      ).rejects.toThrow('No active stream to replace track');
    });
  });

  describe('Cleanup', () => {
    it('should stop stream on unmount', async () => {
      const { result, unmount } = renderHook(() => useMediaStream());

      await waitFor(() => {
        expect(result.current.stream).not.toBeNull();
      });

      unmount();

      expect(mockAudioTrack.stop).toHaveBeenCalled();
      expect(mockVideoTrack.stop).toHaveBeenCalled();
    });
  });
});
