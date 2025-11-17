/**
 * useDevices Hook
 * Manages media device enumeration and preferences
 */

import { useState, useEffect, useCallback } from 'react';
import type { MediaDeviceInfo, DevicePreferences } from './types';

const STORAGE_KEY = 'meetsolis_device_preferences';

export interface UseDevicesResult {
  cameras: MediaDeviceInfo[];
  microphones: MediaDeviceInfo[];
  speakers: MediaDeviceInfo[];
  isLoading: boolean;
  error: Error | null;
  preferences: DevicePreferences;
  refreshDevices: () => Promise<void>;
  savePreferences: (prefs: Partial<DevicePreferences>) => void;
}

/**
 * Load device preferences from localStorage
 */
function loadPreferences(): DevicePreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load device preferences:', error);
  }

  return {
    cameraId: null,
    microphoneId: null,
    speakerId: null,
    lastUpdated: Date.now(),
  };
}

/**
 * Save device preferences to localStorage
 */
function storePreferences(preferences: DevicePreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Failed to save device preferences:', error);
  }
}

/**
 * Hook for managing media devices
 */
export function useDevices(): UseDevicesResult {
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [speakers, setSpeakers] = useState<MediaDeviceInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [preferences, setPreferences] =
    useState<DevicePreferences>(loadPreferences);

  /**
   * Enumerate all media devices
   */
  const enumerateDevices = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Request permissions first to get device labels
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

      const devices = await navigator.mediaDevices.enumerateDevices();

      const cameraDevices: MediaDeviceInfo[] = [];
      const microphoneDevices: MediaDeviceInfo[] = [];
      const speakerDevices: MediaDeviceInfo[] = [];

      devices.forEach(device => {
        const deviceInfo: MediaDeviceInfo = {
          deviceId: device.deviceId,
          label:
            device.label || `${device.kind} ${device.deviceId.slice(0, 8)}`,
          kind: device.kind,
        };

        if (device.kind === 'videoinput') {
          cameraDevices.push(deviceInfo);
        } else if (device.kind === 'audioinput') {
          microphoneDevices.push(deviceInfo);
        } else if (device.kind === 'audiooutput') {
          speakerDevices.push(deviceInfo);
        }
      });

      setCameras(cameraDevices);
      setMicrophones(microphoneDevices);
      setSpeakers(speakerDevices);

      // Set defaults if no preferences exist
      if (!preferences.cameraId && cameraDevices.length > 0) {
        setPreferences(prev => ({
          ...prev,
          cameraId: cameraDevices[0].deviceId,
        }));
      }

      if (!preferences.microphoneId && microphoneDevices.length > 0) {
        setPreferences(prev => ({
          ...prev,
          microphoneId: microphoneDevices[0].deviceId,
        }));
      }

      if (!preferences.speakerId && speakerDevices.length > 0) {
        setPreferences(prev => ({
          ...prev,
          speakerId: speakerDevices[0].deviceId,
        }));
      }
    } catch (err) {
      const error = err as Error;
      setError(new Error(`Failed to enumerate devices: ${error.message}`));
      console.error('Device enumeration error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [preferences.cameraId, preferences.microphoneId, preferences.speakerId]);

  /**
   * Save device preferences
   */
  const savePreferences = useCallback(
    (newPrefs: Partial<DevicePreferences>) => {
      setPreferences(prev => {
        const updated: DevicePreferences = {
          ...prev,
          ...newPrefs,
          lastUpdated: Date.now(),
        };
        storePreferences(updated);
        return updated;
      });
    },
    []
  );

  /**
   * Refresh device list
   */
  const refreshDevices = useCallback(async () => {
    await enumerateDevices();
  }, [enumerateDevices]);

  // Initial device enumeration
  useEffect(() => {
    enumerateDevices();

    // Listen for device changes
    const handleDeviceChange = () => {
      enumerateDevices();
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);

    return () => {
      navigator.mediaDevices.removeEventListener(
        'devicechange',
        handleDeviceChange
      );
    };
  }, [enumerateDevices]);

  return {
    cameras,
    microphones,
    speakers,
    isLoading,
    error,
    preferences,
    refreshDevices,
    savePreferences,
  };
}
