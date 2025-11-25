import { renderHook, act, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { useAudioControls } from '../useAudioControls';

// Mock sonner
jest.mock('sonner', () => ({
  toast: jest.fn(),
}));

// Mock Web Audio API
const mockAudioContext = {
  createAnalyser: jest.fn(),
  createMediaStreamSource: jest.fn(),
  createOscillator: jest.fn(),
  createGain: jest.fn(),
  close: jest.fn(),
  currentTime: 0,
  destination: {},
};

const mockAnalyser = {
  fftSize: 0,
  smoothingTimeConstant: 0,
  frequencyBinCount: 256,
  getByteFrequencyData: jest.fn(),
};

const mockOscillator = {
  connect: jest.fn(),
  frequency: { value: 0 },
  type: 'sine',
  start: jest.fn(),
  stop: jest.fn(),
};

const mockGain = {
  connect: jest.fn(),
  gain: {
    setValueAtTime: jest.fn(),
    exponentialRampToValueAtTime: jest.fn(),
  },
};

const mockMicrophone = {
  connect: jest.fn(),
  disconnect: jest.fn(),
};

global.AudioContext = jest.fn().mockImplementation(() => mockAudioContext);
mockAudioContext.createAnalyser.mockReturnValue(mockAnalyser);
mockAudioContext.createMediaStreamSource.mockReturnValue(mockMicrophone);
mockAudioContext.createOscillator.mockReturnValue(mockOscillator);
mockAudioContext.createGain.mockReturnValue(mockGain);

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(cb => {
  setTimeout(cb, 16);
  return 1;
});
global.cancelAnimationFrame = jest.fn();

// Mock MediaStream and MediaStreamTrack
const createMockAudioTrack = (enabled = true) => ({
  kind: 'audio',
  enabled,
  applyConstraints: jest.fn().mockResolvedValue(undefined),
  stop: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
});

const createMockStream = (audioTrack?: any) => {
  const track = audioTrack || createMockAudioTrack();
  return {
    getAudioTracks: jest.fn().mockReturnValue([track]),
    getVideoTracks: jest.fn().mockReturnValue([]),
    getTracks: jest.fn().mockReturnValue([track]),
  } as unknown as MediaStream;
};

// Mock navigator.mediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getSupportedConstraints: jest.fn().mockReturnValue({
      noiseSuppression: true,
      echoCancellation: true,
      autoGainControl: true,
    }),
  },
});

describe('useAudioControls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAnalyser.getByteFrequencyData.mockImplementation(
      (dataArray: Uint8Array) => {
        dataArray.fill(0);
      }
    );
  });

  describe('Initialization', () => {
    it('should initialize with muted state by default', () => {
      const mockStream = createMockStream();
      const { result } = renderHook(() =>
        useAudioControls({ stream: mockStream })
      );

      expect(result.current.isMuted).toBe(true);
      expect(result.current.isSpeaking).toBe(false);
      expect(result.current.audioLevel).toBe(0);
    });

    it('should initialize with noise suppression disabled by default', () => {
      const mockStream = createMockStream();
      const { result } = renderHook(() =>
        useAudioControls({ stream: mockStream })
      );

      expect(result.current.noiseSuppressionEnabled).toBe(false);
    });

    it('should initialize with noise suppression enabled when specified', () => {
      const mockStream = createMockStream();
      const { result } = renderHook(() =>
        useAudioControls({ stream: mockStream, enableNoiseSupression: true })
      );

      expect(result.current.noiseSuppressionEnabled).toBe(true);
    });

    it('should handle null stream gracefully', () => {
      const { result } = renderHook(() => useAudioControls({ stream: null }));

      expect(result.current.isMuted).toBe(true);
      expect(result.current.isSpeaking).toBe(false);
    });
  });

  describe('Mute/Unmute Functionality', () => {
    it('should toggle mute state', () => {
      const mockTrack = createMockAudioTrack(true);
      const mockStream = createMockStream(mockTrack);
      const { result } = renderHook(() =>
        useAudioControls({ stream: mockStream })
      );

      expect(result.current.isMuted).toBe(true);

      act(() => {
        result.current.toggleMute();
      });

      expect(result.current.isMuted).toBe(false);
      expect(mockTrack.enabled).toBe(true);

      act(() => {
        result.current.toggleMute();
      });

      expect(result.current.isMuted).toBe(true);
      expect(mockTrack.enabled).toBe(false);
    });

    it('should call onMuteChange callback when mute state changes', () => {
      const mockTrack = createMockAudioTrack(true);
      const mockStream = createMockStream(mockTrack);
      const onMuteChange = jest.fn();

      const { result } = renderHook(() =>
        useAudioControls({ stream: mockStream, onMuteChange })
      );

      act(() => {
        result.current.toggleMute();
      });

      expect(onMuteChange).toHaveBeenCalledWith(false);

      act(() => {
        result.current.toggleMute();
      });

      expect(onMuteChange).toHaveBeenCalledWith(true);
      expect(onMuteChange).toHaveBeenCalledTimes(2);
    });

    it('should set mute state directly', () => {
      const mockTrack = createMockAudioTrack(true);
      const mockStream = createMockStream(mockTrack);
      const { result } = renderHook(() =>
        useAudioControls({ stream: mockStream })
      );

      act(() => {
        result.current.setMuted(false);
      });

      expect(result.current.isMuted).toBe(false);
      expect(mockTrack.enabled).toBe(true);

      act(() => {
        result.current.setMuted(true);
      });

      expect(result.current.isMuted).toBe(true);
      expect(mockTrack.enabled).toBe(false);
    });

    it('should warn when trying to mute without audio track', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const mockStream = {
        getAudioTracks: jest.fn().mockReturnValue([]),
      } as unknown as MediaStream;

      const { result } = renderHook(() =>
        useAudioControls({ stream: mockStream })
      );

      act(() => {
        result.current.toggleMute();
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith('No audio track available');
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Audio Feedback', () => {
    it('should play beep when playAudioFeedback is enabled', () => {
      const mockTrack = createMockAudioTrack(true);
      const mockStream = createMockStream(mockTrack);

      const { result } = renderHook(() =>
        useAudioControls({ stream: mockStream, playAudioFeedback: true })
      );

      act(() => {
        result.current.toggleMute();
      });

      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockAudioContext.createGain).toHaveBeenCalled();
      expect(mockOscillator.start).toHaveBeenCalled();
      expect(mockOscillator.stop).toHaveBeenCalled();
    });

    it('should not play beep when playAudioFeedback is disabled', () => {
      const mockTrack = createMockAudioTrack(true);
      const mockStream = createMockStream(mockTrack);

      const { result } = renderHook(() =>
        useAudioControls({ stream: mockStream, playAudioFeedback: false })
      );

      mockAudioContext.createOscillator.mockClear();

      act(() => {
        result.current.toggleMute();
      });

      // Note: AudioContext is still created for speaking detection
      // but oscillator should not be created for feedback
    });

    it('should use different frequencies for mute and unmute', () => {
      const mockTrack = createMockAudioTrack(true);
      const mockStream = createMockStream(mockTrack);

      const { result } = renderHook(() =>
        useAudioControls({ stream: mockStream, playAudioFeedback: true })
      );

      // Mute (800Hz)
      act(() => {
        result.current.setMuted(true);
      });
      expect(mockOscillator.frequency.value).toBe(800);

      mockOscillator.frequency.value = 0;

      // Unmute (1200Hz)
      act(() => {
        result.current.setMuted(false);
      });
      expect(mockOscillator.frequency.value).toBe(1200);
    });
  });

  describe('Noise Suppression', () => {
    it('should toggle noise suppression when supported', async () => {
      const mockTrack = createMockAudioTrack();
      const mockStream = createMockStream(mockTrack);

      const { result } = renderHook(() =>
        useAudioControls({ stream: mockStream, enableNoiseSupression: false })
      );

      expect(result.current.noiseSuppressionEnabled).toBe(false);

      await act(async () => {
        await result.current.toggleNoiseSuppression();
      });

      expect(mockTrack.applyConstraints).toHaveBeenCalledWith({
        noiseSuppression: true,
        echoCancellation: true,
        autoGainControl: true,
      });
      expect(result.current.noiseSuppressionEnabled).toBe(true);
      expect(toast.success).toHaveBeenCalledWith('Noise suppression enabled');

      await act(async () => {
        await result.current.toggleNoiseSuppression();
      });

      expect(result.current.noiseSuppressionEnabled).toBe(false);
      expect(toast.success).toHaveBeenCalledWith('Noise suppression disabled');
    });

    it('should show warning when noise suppression is not supported', async () => {
      const mockTrack = createMockAudioTrack();
      const mockStream = createMockStream(mockTrack);

      // Mock unsupported browser
      (
        navigator.mediaDevices.getSupportedConstraints as jest.Mock
      ).mockReturnValueOnce({
        noiseSuppression: false,
      });

      const { result } = renderHook(() =>
        useAudioControls({ stream: mockStream })
      );

      await act(async () => {
        await result.current.toggleNoiseSuppression();
      });

      expect(toast.warning).toHaveBeenCalledWith(
        'Noise suppression is not supported in this browser'
      );
      expect(mockTrack.applyConstraints).not.toHaveBeenCalled();
    });

    it('should handle errors when applying constraints fails', async () => {
      const mockTrack = createMockAudioTrack();
      mockTrack.applyConstraints.mockRejectedValueOnce(
        new Error('Constraint error')
      );
      const mockStream = createMockStream(mockTrack);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() =>
        useAudioControls({ stream: mockStream })
      );

      await act(async () => {
        await result.current.toggleNoiseSuppression();
      });

      expect(toast.error).toHaveBeenCalledWith(
        'Failed to toggle noise suppression'
      );
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('should show error when no stream is available', async () => {
      const { result } = renderHook(() => useAudioControls({ stream: null }));

      await act(async () => {
        await result.current.toggleNoiseSuppression();
      });

      expect(toast.error).toHaveBeenCalledWith('No audio stream available');
    });
  });

  describe('Speaking Detection', () => {
    it('should detect speaking when audio level exceeds threshold', async () => {
      const mockTrack = createMockAudioTrack(true);
      const mockStream = createMockStream(mockTrack);

      // Mock audio data with high levels (speaking)
      mockAnalyser.getByteFrequencyData.mockImplementation(
        (dataArray: Uint8Array) => {
          dataArray.fill(100); // High audio level
        }
      );

      const { result } = renderHook(() =>
        useAudioControls({ stream: mockStream })
      );

      // Unmute to allow speaking detection
      act(() => {
        result.current.setMuted(false);
      });

      await waitFor(() => {
        expect(result.current.isSpeaking).toBe(true);
        expect(result.current.audioLevel).toBeGreaterThan(0);
      });
    });

    it('should not detect speaking when muted', async () => {
      const mockTrack = createMockAudioTrack(true);
      const mockStream = createMockStream(mockTrack);

      // Mock audio data with high levels
      mockAnalyser.getByteFrequencyData.mockImplementation(
        (dataArray: Uint8Array) => {
          dataArray.fill(100);
        }
      );

      const { result } = renderHook(() =>
        useAudioControls({ stream: mockStream })
      );

      // Keep muted
      await waitFor(() => {
        expect(result.current.isSpeaking).toBe(false);
      });
    });

    it('should not detect speaking when audio level is below threshold', async () => {
      const mockTrack = createMockAudioTrack(true);
      const mockStream = createMockStream(mockTrack);

      // Mock audio data with low levels (not speaking)
      mockAnalyser.getByteFrequencyData.mockImplementation(
        (dataArray: Uint8Array) => {
          dataArray.fill(10); // Low audio level
        }
      );

      const { result } = renderHook(() =>
        useAudioControls({ stream: mockStream })
      );

      act(() => {
        result.current.setMuted(false);
      });

      await waitFor(() => {
        expect(result.current.isSpeaking).toBe(false);
      });
    });

    it('should calculate normalized audio level', async () => {
      const mockTrack = createMockAudioTrack(true);
      const mockStream = createMockStream(mockTrack);

      // Mock audio data
      mockAnalyser.getByteFrequencyData.mockImplementation(
        (dataArray: Uint8Array) => {
          dataArray.fill(128); // Mid-level audio
        }
      );

      const { result } = renderHook(() =>
        useAudioControls({ stream: mockStream })
      );

      await waitFor(() => {
        expect(result.current.audioLevel).toBeGreaterThan(0);
        expect(result.current.audioLevel).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Cleanup', () => {
    it('should cleanup audio context on unmount', () => {
      const mockTrack = createMockAudioTrack(true);
      const mockStream = createMockStream(mockTrack);

      const { unmount } = renderHook(() =>
        useAudioControls({ stream: mockStream })
      );

      unmount();

      expect(cancelAnimationFrame).toHaveBeenCalled();
      expect(mockMicrophone.disconnect).toHaveBeenCalled();
      expect(mockAudioContext.close).toHaveBeenCalled();
    });

    it('should handle cleanup when audio context is not initialized', () => {
      const { unmount } = renderHook(() => useAudioControls({ stream: null }));

      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle speaking detection initialization errors gracefully', () => {
      const mockTrack = createMockAudioTrack(true);
      const mockStream = createMockStream(mockTrack);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock AudioContext to throw error
      global.AudioContext = jest.fn().mockImplementation(() => {
        throw new Error('AudioContext error');
      });

      const { result } = renderHook(() =>
        useAudioControls({ stream: mockStream })
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to initialize speaking detection:',
        expect.any(Error)
      );
      expect(result.current.isSpeaking).toBe(false);

      consoleErrorSpy.mockRestore();
    });

    it('should handle audio feedback errors gracefully', () => {
      const mockTrack = createMockAudioTrack(true);
      const mockStream = createMockStream(mockTrack);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock createOscillator to throw error
      mockAudioContext.createOscillator.mockImplementationOnce(() => {
        throw new Error('Oscillator error');
      });

      const { result } = renderHook(() =>
        useAudioControls({ stream: mockStream, playAudioFeedback: true })
      );

      act(() => {
        result.current.toggleMute();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to play audio feedback:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
