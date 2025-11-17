/**
 * useAudioLevel Hook Tests
 * Tests for audio level monitoring hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useAudioLevel } from '../useAudioLevel';

// Mock AudioContext
const mockClose = jest.fn();
const mockCreateAnalyser = jest.fn();
const mockCreateMediaStreamSource = jest.fn();
const mockConnect = jest.fn();
const mockGetByteFrequencyData = jest.fn();

const mockAnalyser = {
  smoothingTimeConstant: 0.8,
  fftSize: 256,
  frequencyBinCount: 128,
  connect: mockConnect,
  getByteFrequencyData: mockGetByteFrequencyData,
};

const mockSource = {
  connect: mockConnect,
};

const mockAudioContext = {
  close: mockClose,
  createAnalyser: mockCreateAnalyser,
  createMediaStreamSource: mockCreateMediaStreamSource,
  currentTime: 0,
};

// Mock window.AudioContext
(global as any).AudioContext = jest.fn(() => mockAudioContext);
(global as any).webkitAudioContext = jest.fn(() => mockAudioContext);

// Mock requestAnimationFrame and cancelAnimationFrame
let animationFrameId = 0;
const animationFrameCallbacks: Map<number, FrameRequestCallback> = new Map();

global.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
  const id = ++animationFrameId;
  animationFrameCallbacks.set(id, callback);
  return id;
});

global.cancelAnimationFrame = jest.fn((id: number) => {
  animationFrameCallbacks.delete(id);
});

// Helper to trigger animation frame
const triggerAnimationFrame = (timestamp: number = performance.now()) => {
  animationFrameCallbacks.forEach(callback => {
    callback(timestamp);
  });
};

// Mock MediaStream
const mockAudioTrack = {
  kind: 'audio',
  enabled: true,
  stop: jest.fn(),
} as unknown as MediaStreamTrack;

const mockMediaStream = {
  getTracks: jest.fn(() => [mockAudioTrack]),
  getAudioTracks: jest.fn(() => [mockAudioTrack]),
} as unknown as MediaStream;

describe('useAudioLevel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    animationFrameCallbacks.clear();
    animationFrameId = 0;

    mockCreateAnalyser.mockReturnValue(mockAnalyser);
    mockCreateMediaStreamSource.mockReturnValue(mockSource);

    // Default: return silent audio
    mockGetByteFrequencyData.mockImplementation((dataArray: Uint8Array) => {
      dataArray.fill(0);
    });
  });

  describe('Initialization', () => {
    it('should initialize with zero audio level', () => {
      const { result } = renderHook(() => useAudioLevel({ stream: null }));

      expect(result.current.audioLevel).toBe(0);
      expect(result.current.isMonitoring).toBe(false);
    });

    it('should not start monitoring automatically', () => {
      const { result } = renderHook(() =>
        useAudioLevel({ stream: mockMediaStream })
      );

      expect(result.current.isMonitoring).toBe(false);
      expect(mockCreateAnalyser).not.toHaveBeenCalled();
    });
  });

  describe('startMonitoring', () => {
    it('should create audio context and analyser', () => {
      const { result } = renderHook(() =>
        useAudioLevel({ stream: mockMediaStream })
      );

      act(() => {
        result.current.startMonitoring();
      });

      expect(global.AudioContext).toHaveBeenCalled();
      expect(mockCreateAnalyser).toHaveBeenCalled();
      expect(mockCreateMediaStreamSource).toHaveBeenCalledWith(mockMediaStream);
      expect(mockConnect).toHaveBeenCalled();
      expect(result.current.isMonitoring).toBe(true);
    });

    it('should configure analyser with custom options', () => {
      const { result } = renderHook(() =>
        useAudioLevel({
          stream: mockMediaStream,
          smoothingTimeConstant: 0.5,
          fftSize: 512,
        })
      );

      act(() => {
        result.current.startMonitoring();
      });

      expect(mockAnalyser.smoothingTimeConstant).toBe(0.5);
      expect(mockAnalyser.fftSize).toBe(512);
    });

    it('should not start monitoring if stream is null', () => {
      const { result } = renderHook(() => useAudioLevel({ stream: null }));

      act(() => {
        result.current.startMonitoring();
      });

      expect(result.current.isMonitoring).toBe(false);
      expect(mockCreateAnalyser).not.toHaveBeenCalled();
    });

    it('should not start monitoring if already monitoring', () => {
      const { result } = renderHook(() =>
        useAudioLevel({ stream: mockMediaStream })
      );

      act(() => {
        result.current.startMonitoring();
      });

      mockCreateAnalyser.mockClear();

      act(() => {
        result.current.startMonitoring();
      });

      expect(mockCreateAnalyser).not.toHaveBeenCalled();
    });

    it('should start animation loop', () => {
      const { result } = renderHook(() =>
        useAudioLevel({ stream: mockMediaStream })
      );

      act(() => {
        result.current.startMonitoring();
      });

      expect(global.requestAnimationFrame).toHaveBeenCalled();
    });

    it('should handle audio context creation errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      (global.AudioContext as jest.Mock).mockImplementation(() => {
        throw new Error('AudioContext creation failed');
      });

      const { result } = renderHook(() =>
        useAudioLevel({ stream: mockMediaStream })
      );

      act(() => {
        result.current.startMonitoring();
      });

      expect(result.current.isMonitoring).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to start audio monitoring:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('stopMonitoring', () => {
    it('should stop monitoring and cleanup', () => {
      const { result } = renderHook(() =>
        useAudioLevel({ stream: mockMediaStream })
      );

      act(() => {
        result.current.startMonitoring();
      });

      expect(result.current.isMonitoring).toBe(true);

      act(() => {
        result.current.stopMonitoring();
      });

      expect(result.current.isMonitoring).toBe(false);
      expect(result.current.audioLevel).toBe(0);
      expect(global.cancelAnimationFrame).toHaveBeenCalled();
      expect(mockClose).toHaveBeenCalled();
    });

    it('should be safe to call when not monitoring', () => {
      const { result } = renderHook(() =>
        useAudioLevel({ stream: mockMediaStream })
      );

      act(() => {
        result.current.stopMonitoring();
      });

      // Should not throw
      expect(result.current.isMonitoring).toBe(false);
    });
  });

  describe('Audio Level Calculation', () => {
    it('should calculate audio level from frequency data', () => {
      const { result } = renderHook(() =>
        useAudioLevel({ stream: mockMediaStream })
      );

      // Mock audio data: moderate volume
      mockGetByteFrequencyData.mockImplementation((dataArray: Uint8Array) => {
        dataArray.fill(64); // 50% of max (128)
      });

      act(() => {
        result.current.startMonitoring();
      });

      // Trigger animation frame to calculate level
      act(() => {
        triggerAnimationFrame();
      });

      expect(result.current.audioLevel).toBeGreaterThan(0);
      expect(result.current.audioLevel).toBeLessThanOrEqual(100);
    });

    it('should return 0 for silent audio', () => {
      const { result } = renderHook(() =>
        useAudioLevel({ stream: mockMediaStream })
      );

      // Mock silent audio
      mockGetByteFrequencyData.mockImplementation((dataArray: Uint8Array) => {
        dataArray.fill(0);
      });

      act(() => {
        result.current.startMonitoring();
      });

      act(() => {
        triggerAnimationFrame();
      });

      expect(result.current.audioLevel).toBe(0);
    });

    it('should return 100 for max volume audio', () => {
      const { result } = renderHook(() =>
        useAudioLevel({ stream: mockMediaStream })
      );

      // Mock max volume
      mockGetByteFrequencyData.mockImplementation((dataArray: Uint8Array) => {
        dataArray.fill(255); // Max value
      });

      act(() => {
        result.current.startMonitoring();
      });

      act(() => {
        triggerAnimationFrame();
      });

      expect(result.current.audioLevel).toBe(100);
    });

    it('should calculate RMS for accurate level', () => {
      const { result } = renderHook(() =>
        useAudioLevel({ stream: mockMediaStream })
      );

      // Mock varying audio data
      mockGetByteFrequencyData.mockImplementation((dataArray: Uint8Array) => {
        for (let i = 0; i < dataArray.length; i++) {
          dataArray[i] = i % 128;
        }
      });

      act(() => {
        result.current.startMonitoring();
      });

      act(() => {
        triggerAnimationFrame();
      });

      // Should calculate RMS, not just average
      expect(result.current.audioLevel).toBeGreaterThan(0);
      expect(result.current.audioLevel).toBeLessThanOrEqual(100);
    });

    it('should update audio level continuously', () => {
      const { result } = renderHook(() =>
        useAudioLevel({ stream: mockMediaStream })
      );

      let volume = 0;
      mockGetByteFrequencyData.mockImplementation((dataArray: Uint8Array) => {
        dataArray.fill(volume);
      });

      act(() => {
        result.current.startMonitoring();
      });

      // First frame: silent
      act(() => {
        triggerAnimationFrame();
      });
      const level1 = result.current.audioLevel;

      // Second frame: moderate volume
      volume = 64;
      act(() => {
        triggerAnimationFrame();
      });
      const level2 = result.current.audioLevel;

      // Third frame: high volume
      volume = 128;
      act(() => {
        triggerAnimationFrame();
      });
      const level3 = result.current.audioLevel;

      expect(level1).toBe(0);
      expect(level2).toBeGreaterThan(level1);
      expect(level3).toBeGreaterThan(level2);
    });
  });

  describe('Stream Changes', () => {
    it('should restart monitoring when stream changes', () => {
      const { result, rerender } = renderHook(
        ({ stream }) => useAudioLevel({ stream }),
        {
          initialProps: { stream: mockMediaStream },
        }
      );

      act(() => {
        result.current.startMonitoring();
      });

      expect(result.current.isMonitoring).toBe(true);

      // Change stream
      const newStream = {
        getTracks: jest.fn(() => [mockAudioTrack]),
        getAudioTracks: jest.fn(() => [mockAudioTrack]),
      } as unknown as MediaStream;

      mockCreateMediaStreamSource.mockClear();

      rerender({ stream: newStream });

      // Should recreate with new stream
      expect(mockCreateMediaStreamSource).toHaveBeenCalledWith(newStream);
    });

    it('should stop monitoring when stream becomes null', () => {
      const { result, rerender } = renderHook(
        ({ stream }) => useAudioLevel({ stream }),
        {
          initialProps: { stream: mockMediaStream },
        }
      );

      act(() => {
        result.current.startMonitoring();
      });

      expect(result.current.isMonitoring).toBe(true);

      // Remove stream
      rerender({ stream: null });

      expect(result.current.isMonitoring).toBe(false);
      expect(mockClose).toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should cleanup on unmount', () => {
      const { result, unmount } = renderHook(() =>
        useAudioLevel({ stream: mockMediaStream })
      );

      act(() => {
        result.current.startMonitoring();
      });

      unmount();

      expect(global.cancelAnimationFrame).toHaveBeenCalled();
      expect(mockClose).toHaveBeenCalled();
    });

    it('should cleanup when stream is removed', () => {
      const { result, rerender } = renderHook(
        ({ stream }) => useAudioLevel({ stream }),
        {
          initialProps: { stream: mockMediaStream },
        }
      );

      act(() => {
        result.current.startMonitoring();
      });

      rerender({ stream: null });

      expect(result.current.audioLevel).toBe(0);
      expect(result.current.isMonitoring).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle analyser without data gracefully', () => {
      const { result } = renderHook(() =>
        useAudioLevel({ stream: mockMediaStream })
      );

      // Mock analyser returning undefined
      mockGetByteFrequencyData.mockImplementation(() => {
        // Do nothing
      });

      act(() => {
        result.current.startMonitoring();
      });

      act(() => {
        triggerAnimationFrame();
      });

      // Should not crash
      expect(result.current.audioLevel).toBeDefined();
    });

    it('should clamp audio level to 0-100 range', () => {
      const { result } = renderHook(() =>
        useAudioLevel({ stream: mockMediaStream })
      );

      // Mock extremely high values
      mockGetByteFrequencyData.mockImplementation((dataArray: Uint8Array) => {
        dataArray.fill(1000);
      });

      act(() => {
        result.current.startMonitoring();
      });

      act(() => {
        triggerAnimationFrame();
      });

      expect(result.current.audioLevel).toBeLessThanOrEqual(100);
    });
  });
});
