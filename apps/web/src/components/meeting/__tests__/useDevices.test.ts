/**
 * useDevices Hook Tests
 * Tests for device enumeration and preferences hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useDevices } from '../useDevices';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock navigator.mediaDevices
const mockGetUserMedia = jest.fn();
const mockEnumerateDevices = jest.fn();
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia,
    enumerateDevices: mockEnumerateDevices,
    addEventListener: mockAddEventListener,
    removeEventListener: mockRemoveEventListener,
  },
  writable: true,
});

// Mock MediaStream
const mockMediaStream = {
  getTracks: jest.fn(() => []),
  getAudioTracks: jest.fn(() => []),
  getVideoTracks: jest.fn(() => []),
} as unknown as MediaStream;

// Mock devices
const mockDevices: MediaDeviceInfo[] = [
  {
    deviceId: 'camera-1',
    kind: 'videoinput',
    label: 'Front Camera',
    groupId: 'group-1',
    toJSON: () => ({}),
  } as MediaDeviceInfo,
  {
    deviceId: 'camera-2',
    kind: 'videoinput',
    label: 'Back Camera',
    groupId: 'group-2',
    toJSON: () => ({}),
  } as MediaDeviceInfo,
  {
    deviceId: 'mic-1',
    kind: 'audioinput',
    label: 'Built-in Microphone',
    groupId: 'group-3',
    toJSON: () => ({}),
  } as MediaDeviceInfo,
  {
    deviceId: 'mic-2',
    kind: 'audioinput',
    label: 'External Microphone',
    groupId: 'group-4',
    toJSON: () => ({}),
  } as MediaDeviceInfo,
  {
    deviceId: 'speaker-1',
    kind: 'audiooutput',
    label: 'Built-in Speakers',
    groupId: 'group-5',
    toJSON: () => ({}),
  } as MediaDeviceInfo,
  {
    deviceId: 'speaker-2',
    kind: 'audiooutput',
    label: 'External Speakers',
    groupId: 'group-6',
    toJSON: () => ({}),
  } as MediaDeviceInfo,
];

describe('useDevices', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();

    mockGetUserMedia.mockResolvedValue(mockMediaStream);
    mockEnumerateDevices.mockResolvedValue(mockDevices);
  });

  describe('Device Enumeration', () => {
    it('should enumerate devices on mount', async () => {
      const { result } = renderHook(() => useDevices());

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGetUserMedia).toHaveBeenCalledWith({
        audio: true,
        video: true,
      });
      expect(mockEnumerateDevices).toHaveBeenCalled();
    });

    it('should categorize devices correctly', async () => {
      const { result } = renderHook(() => useDevices());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.cameras).toHaveLength(2);
      expect(result.current.cameras[0].label).toBe('Front Camera');
      expect(result.current.cameras[1].label).toBe('Back Camera');

      expect(result.current.microphones).toHaveLength(2);
      expect(result.current.microphones[0].label).toBe('Built-in Microphone');
      expect(result.current.microphones[1].label).toBe('External Microphone');

      expect(result.current.speakers).toHaveLength(2);
      expect(result.current.speakers[0].label).toBe('Built-in Speakers');
      expect(result.current.speakers[1].label).toBe('External Speakers');
    });

    it('should handle devices without labels', async () => {
      const devicesWithoutLabels: MediaDeviceInfo[] = [
        {
          deviceId: 'camera-1',
          kind: 'videoinput',
          label: '',
          groupId: 'group-1',
          toJSON: () => ({}),
        } as MediaDeviceInfo,
      ];

      mockEnumerateDevices.mockResolvedValue(devicesWithoutLabels);

      const { result } = renderHook(() => useDevices());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.cameras[0].label).toBe('videoinput camera-1');
    });

    it('should handle enumeration errors', async () => {
      const error = new Error('Permission denied');
      mockEnumerateDevices.mockRejectedValue(error);

      const { result } = renderHook(() => useDevices());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).not.toBeNull();
      expect(result.current.error?.message).toContain(
        'Failed to enumerate devices'
      );
    });

    it('should refresh devices on devicechange event', async () => {
      const { result } = renderHook(() => useDevices());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify event listener was added
      expect(mockAddEventListener).toHaveBeenCalledWith(
        'devicechange',
        expect.any(Function)
      );

      // Get the devicechange handler
      const deviceChangeHandler = mockAddEventListener.mock.calls[0][1];

      // Trigger device change
      mockEnumerateDevices.mockClear();
      await act(async () => {
        await deviceChangeHandler();
      });

      expect(mockEnumerateDevices).toHaveBeenCalled();
    });

    it('should cleanup event listener on unmount', async () => {
      const { unmount } = renderHook(() => useDevices());

      await waitFor(() => {
        expect(mockAddEventListener).toHaveBeenCalled();
      });

      unmount();

      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        'devicechange',
        expect.any(Function)
      );
    });
  });

  describe('Device Preferences', () => {
    it('should load preferences from localStorage', async () => {
      const savedPreferences = {
        cameraId: 'camera-2',
        microphoneId: 'mic-2',
        speakerId: 'speaker-2',
        lastUpdated: Date.now(),
      };

      localStorageMock.setItem(
        'meetsolis_device_preferences',
        JSON.stringify(savedPreferences)
      );

      const { result } = renderHook(() => useDevices());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.preferences.cameraId).toBe('camera-2');
      expect(result.current.preferences.microphoneId).toBe('mic-2');
      expect(result.current.preferences.speakerId).toBe('speaker-2');
    });

    it('should use default preferences if localStorage is empty', async () => {
      const { result } = renderHook(() => useDevices());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.preferences).toEqual({
        cameraId: 'camera-1', // First camera device
        microphoneId: 'mic-1', // First microphone device
        speakerId: 'speaker-1', // First speaker device
        lastUpdated: expect.any(Number),
      });
    });

    it('should save preferences to localStorage', async () => {
      const { result } = renderHook(() => useDevices());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.savePreferences({
          cameraId: 'camera-2',
        });
      });

      const saved = JSON.parse(
        localStorageMock.getItem('meetsolis_device_preferences') || '{}'
      );
      expect(saved.cameraId).toBe('camera-2');
      expect(saved.lastUpdated).toBeDefined();
    });

    it('should update preferences state when saving', async () => {
      const { result } = renderHook(() => useDevices());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.savePreferences({
          microphoneId: 'mic-2',
        });
      });

      expect(result.current.preferences.microphoneId).toBe('mic-2');
    });

    it('should handle localStorage errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Make localStorage.setItem throw an error
      jest.spyOn(localStorageMock, 'setItem').mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const { result } = renderHook(() => useDevices());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.savePreferences({
          cameraId: 'camera-2',
        });
      });

      // Should not crash, just log error
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save device preferences:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should handle corrupted localStorage data', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Set corrupted JSON
      localStorageMock.setItem(
        'meetsolis_device_preferences',
        'corrupted-json{'
      );

      const { result } = renderHook(() => useDevices());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should fall back to defaults
      expect(result.current.preferences.cameraId).toBe('camera-1');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load device preferences:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('refreshDevices', () => {
    it('should manually refresh device list', async () => {
      const { result } = renderHook(() => useDevices());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockEnumerateDevices.mockClear();

      await act(async () => {
        await result.current.refreshDevices();
      });

      expect(mockEnumerateDevices).toHaveBeenCalled();
    });

    it('should update devices after refresh', async () => {
      const { result } = renderHook(() => useDevices());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Add new device
      const newDevices = [
        ...mockDevices,
        {
          deviceId: 'camera-3',
          kind: 'videoinput',
          label: 'New Camera',
          groupId: 'group-7',
          toJSON: () => ({}),
        } as MediaDeviceInfo,
      ];

      mockEnumerateDevices.mockResolvedValue(newDevices);

      await act(async () => {
        await result.current.refreshDevices();
      });

      expect(result.current.cameras).toHaveLength(3);
      expect(result.current.cameras[2].label).toBe('New Camera');
    });
  });

  describe('Error Handling', () => {
    it('should handle getUserMedia permission denial', async () => {
      const error = new DOMException('Permission denied', 'NotAllowedError');
      mockGetUserMedia.mockRejectedValue(error);

      const { result } = renderHook(() => useDevices());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).not.toBeNull();
      expect(result.current.cameras).toHaveLength(0);
      expect(result.current.microphones).toHaveLength(0);
    });

    it('should clear error on successful refresh', async () => {
      const error = new Error('Device error');
      mockEnumerateDevices
        .mockRejectedValueOnce(error)
        .mockResolvedValue(mockDevices);

      const { result } = renderHook(() => useDevices());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).not.toBeNull();

      // Refresh devices
      await act(async () => {
        await result.current.refreshDevices();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });
});
