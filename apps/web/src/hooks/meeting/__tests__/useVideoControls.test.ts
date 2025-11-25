import { renderHook, act } from '@testing-library/react';
import { useVideoControls } from '../useVideoControls';

// Mock MediaStreamTrack
const createMockVideoTrack = (enabled = true) => ({
  kind: 'video',
  enabled,
  stop: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
});

const createMockStream = (videoTrack?: any) => {
  const track = videoTrack || createMockVideoTrack();
  return {
    getVideoTracks: jest.fn().mockReturnValue([track]),
    getAudioTracks: jest.fn().mockReturnValue([]),
    getTracks: jest.fn().mockReturnValue([track]),
  } as unknown as MediaStream;
};

describe('useVideoControls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with video off by default (privacy-first)', () => {
      const mockStream = createMockStream();
      const { result } = renderHook(() =>
        useVideoControls({ stream: mockStream })
      );

      expect(result.current.isVideoOff).toBe(true);
      expect(result.current.hasVideoTrack).toBe(true);
    });

    it('should initialize with video on when defaultVideoOff is false', () => {
      const mockStream = createMockStream();
      const { result } = renderHook(() =>
        useVideoControls({ stream: mockStream, defaultVideoOff: false })
      );

      expect(result.current.isVideoOff).toBe(false);
    });

    it('should apply default video-off state to track on mount', () => {
      const mockTrack = createMockVideoTrack(true);
      const mockStream = createMockStream(mockTrack);

      renderHook(() =>
        useVideoControls({ stream: mockStream, defaultVideoOff: true })
      );

      expect(mockTrack.enabled).toBe(false);
    });

    it('should not apply default state when defaultVideoOff is false', () => {
      const mockTrack = createMockVideoTrack(true);
      const mockStream = createMockStream(mockTrack);

      renderHook(() =>
        useVideoControls({ stream: mockStream, defaultVideoOff: false })
      );

      expect(mockTrack.enabled).toBe(true);
    });

    it('should handle null stream gracefully', () => {
      const { result } = renderHook(() => useVideoControls({ stream: null }));

      expect(result.current.isVideoOff).toBe(true);
      expect(result.current.hasVideoTrack).toBe(false);
    });

    it('should handle stream without video track', () => {
      const mockStream = {
        getVideoTracks: jest.fn().mockReturnValue([]),
        getAudioTracks: jest.fn().mockReturnValue([]),
        getTracks: jest.fn().mockReturnValue([]),
      } as unknown as MediaStream;

      const { result } = renderHook(() =>
        useVideoControls({ stream: mockStream })
      );

      expect(result.current.hasVideoTrack).toBe(false);
    });
  });

  describe('Video On/Off Functionality', () => {
    it('should toggle video state', () => {
      const mockTrack = createMockVideoTrack(false);
      const mockStream = createMockStream(mockTrack);
      const { result } = renderHook(() =>
        useVideoControls({ stream: mockStream, defaultVideoOff: true })
      );

      expect(result.current.isVideoOff).toBe(true);
      expect(mockTrack.enabled).toBe(false);

      // Toggle to ON
      act(() => {
        result.current.toggleVideo();
      });

      expect(result.current.isVideoOff).toBe(false);
      expect(mockTrack.enabled).toBe(true);

      // Toggle to OFF
      act(() => {
        result.current.toggleVideo();
      });

      expect(result.current.isVideoOff).toBe(true);
      expect(mockTrack.enabled).toBe(false);
    });

    it('should set video state directly', () => {
      const mockTrack = createMockVideoTrack(true);
      const mockStream = createMockStream(mockTrack);
      const { result } = renderHook(() =>
        useVideoControls({ stream: mockStream, defaultVideoOff: false })
      );

      // Turn video OFF
      act(() => {
        result.current.setVideoOff(true);
      });

      expect(result.current.isVideoOff).toBe(true);
      expect(mockTrack.enabled).toBe(false);

      // Turn video ON
      act(() => {
        result.current.setVideoOff(false);
      });

      expect(result.current.isVideoOff).toBe(false);
      expect(mockTrack.enabled).toBe(true);
    });

    it('should call onVideoChange callback when video state changes', () => {
      const mockTrack = createMockVideoTrack(true);
      const mockStream = createMockStream(mockTrack);
      const onVideoChange = jest.fn();

      const { result } = renderHook(() =>
        useVideoControls({
          stream: mockStream,
          onVideoChange,
          defaultVideoOff: false,
        })
      );

      act(() => {
        result.current.toggleVideo();
      });

      expect(onVideoChange).toHaveBeenCalledWith(true);

      act(() => {
        result.current.toggleVideo();
      });

      expect(onVideoChange).toHaveBeenCalledWith(false);
      expect(onVideoChange).toHaveBeenCalledTimes(2);
    });

    it('should warn when trying to toggle video without video track', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const mockStream = {
        getVideoTracks: jest.fn().mockReturnValue([]),
      } as unknown as MediaStream;

      const { result } = renderHook(() =>
        useVideoControls({ stream: mockStream })
      );

      act(() => {
        result.current.toggleVideo();
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith('No video track available');
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Track Enable/Disable Transitions', () => {
    it('should enable track smoothly when turning video on', () => {
      const mockTrack = createMockVideoTrack(false);
      const mockStream = createMockStream(mockTrack);
      const { result } = renderHook(() =>
        useVideoControls({ stream: mockStream, defaultVideoOff: true })
      );

      act(() => {
        result.current.setVideoOff(false);
      });

      expect(mockTrack.enabled).toBe(true);
      expect(result.current.isVideoOff).toBe(false);
    });

    it('should disable track smoothly when turning video off', () => {
      const mockTrack = createMockVideoTrack(true);
      const mockStream = createMockStream(mockTrack);
      const { result } = renderHook(() =>
        useVideoControls({ stream: mockStream, defaultVideoOff: false })
      );

      act(() => {
        result.current.setVideoOff(true);
      });

      expect(mockTrack.enabled).toBe(false);
      expect(result.current.isVideoOff).toBe(true);
    });

    it('should handle multiple rapid toggles', () => {
      const mockTrack = createMockVideoTrack(true);
      const mockStream = createMockStream(mockTrack);
      const { result } = renderHook(() =>
        useVideoControls({ stream: mockStream, defaultVideoOff: false })
      );

      act(() => {
        result.current.toggleVideo(); // OFF
        result.current.toggleVideo(); // ON
        result.current.toggleVideo(); // OFF
      });

      expect(result.current.isVideoOff).toBe(true);
      expect(mockTrack.enabled).toBe(false);
    });
  });

  describe('Privacy-First Defaults', () => {
    it('should default to video off for privacy', () => {
      const mockStream = createMockStream();
      const { result } = renderHook(() =>
        useVideoControls({ stream: mockStream })
      );

      expect(result.current.isVideoOff).toBe(true);
    });

    it('should apply video-off state when stream becomes available', () => {
      const mockTrack = createMockVideoTrack(true);

      const { rerender } = renderHook(
        ({ stream }) => useVideoControls({ stream, defaultVideoOff: true }),
        { initialProps: { stream: null } }
      );

      const mockStream = createMockStream(mockTrack);

      rerender({ stream: mockStream });

      expect(mockTrack.enabled).toBe(false);
    });

    it('should respect defaultVideoOff option', () => {
      const mockTrack1 = createMockVideoTrack(true);
      const mockStream1 = createMockStream(mockTrack1);

      const { result: result1 } = renderHook(() =>
        useVideoControls({ stream: mockStream1, defaultVideoOff: true })
      );

      expect(result1.current.isVideoOff).toBe(true);

      const mockTrack2 = createMockVideoTrack(true);
      const mockStream2 = createMockStream(mockTrack2);

      const { result: result2 } = renderHook(() =>
        useVideoControls({ stream: mockStream2, defaultVideoOff: false })
      );

      expect(result2.current.isVideoOff).toBe(false);
    });
  });

  describe('Video Track Detection', () => {
    it('should detect when video track is available', () => {
      const mockStream = createMockStream();
      const { result } = renderHook(() =>
        useVideoControls({ stream: mockStream })
      );

      expect(result.current.hasVideoTrack).toBe(true);
    });

    it('should detect when video track is not available', () => {
      const mockStream = {
        getVideoTracks: jest.fn().mockReturnValue([]),
      } as unknown as MediaStream;

      const { result } = renderHook(() =>
        useVideoControls({ stream: mockStream })
      );

      expect(result.current.hasVideoTrack).toBe(false);
    });

    it('should update hasVideoTrack when stream changes', () => {
      const { rerender, result } = renderHook(
        ({ stream }) => useVideoControls({ stream }),
        { initialProps: { stream: null } }
      );

      expect(result.current.hasVideoTrack).toBe(false);

      const mockStream = createMockStream();
      rerender({ stream: mockStream });

      expect(result.current.hasVideoTrack).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle stream with null video tracks array', () => {
      const mockStream = {
        getVideoTracks: jest.fn().mockReturnValue(null),
      } as unknown as MediaStream;

      const { result } = renderHook(() =>
        useVideoControls({ stream: mockStream })
      );

      expect(result.current.hasVideoTrack).toBe(false);
    });

    it('should handle setVideoOff when no stream is available', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const { result } = renderHook(() => useVideoControls({ stream: null }));

      act(() => {
        result.current.setVideoOff(false);
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith('No video track available');
      expect(result.current.isVideoOff).toBe(true); // Should remain in initial state
      consoleWarnSpy.mockRestore();
    });

    it('should not crash when toggling without callback', () => {
      const mockStream = createMockStream();
      const { result } = renderHook(() =>
        useVideoControls({ stream: mockStream })
      );

      expect(() => {
        act(() => {
          result.current.toggleVideo();
        });
      }).not.toThrow();
    });
  });

  describe('Cleanup', () => {
    it('should not stop track on unmount (managed by parent stream)', () => {
      const mockTrack = createMockVideoTrack(true);
      const mockStream = createMockStream(mockTrack);

      const { unmount } = renderHook(() =>
        useVideoControls({ stream: mockStream })
      );

      unmount();

      // Track should NOT be stopped (managed by parent MediaStream)
      expect(mockTrack.stop).not.toHaveBeenCalled();
    });

    it('should cleanup without errors when stream is null', () => {
      const { unmount } = renderHook(() => useVideoControls({ stream: null }));

      expect(() => unmount()).not.toThrow();
    });
  });

  describe('State Consistency', () => {
    it('should maintain consistent state between hook and track', () => {
      const mockTrack = createMockVideoTrack(true);
      const mockStream = createMockStream(mockTrack);
      const { result } = renderHook(() =>
        useVideoControls({ stream: mockStream, defaultVideoOff: false })
      );

      // Initial state
      expect(result.current.isVideoOff).toBe(false);
      expect(mockTrack.enabled).toBe(true);

      // Turn OFF
      act(() => {
        result.current.setVideoOff(true);
      });
      expect(result.current.isVideoOff).toBe(true);
      expect(mockTrack.enabled).toBe(false);

      // Turn ON
      act(() => {
        result.current.setVideoOff(false);
      });
      expect(result.current.isVideoOff).toBe(false);
      expect(mockTrack.enabled).toBe(true);
    });

    it('should handle callback updates correctly', () => {
      const mockTrack = createMockVideoTrack(true);
      const mockStream = createMockStream(mockTrack);
      const onVideoChange1 = jest.fn();
      const onVideoChange2 = jest.fn();

      const { result, rerender } = renderHook(
        ({ callback }) =>
          useVideoControls({
            stream: mockStream,
            onVideoChange: callback,
            defaultVideoOff: false,
          }),
        { initialProps: { callback: onVideoChange1 } }
      );

      act(() => {
        result.current.toggleVideo();
      });

      expect(onVideoChange1).toHaveBeenCalledWith(true);
      expect(onVideoChange2).not.toHaveBeenCalled();

      // Change callback
      rerender({ callback: onVideoChange2 });

      act(() => {
        result.current.toggleVideo();
      });

      expect(onVideoChange2).toHaveBeenCalledWith(false);
      expect(onVideoChange1).toHaveBeenCalledTimes(1); // Not called again
    });
  });
});
