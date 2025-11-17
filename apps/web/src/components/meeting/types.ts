/**
 * Meeting Component Types
 * Type definitions for meeting components including device testing
 */

export interface MediaDeviceInfo {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

export interface DevicePreferences {
  cameraId: string | null;
  microphoneId: string | null;
  speakerId: string | null;
  lastUpdated: number;
}

export interface AudioLevel {
  volume: number; // 0-100
  timestamp: number;
}

export type TestStep = 'camera' | 'microphone' | 'speaker' | 'complete';

export interface DeviceTestState {
  currentStep: TestStep;
  cameraPermission: PermissionState | null;
  microphonePermission: PermissionState | null;
  selectedCamera: string | null;
  selectedMicrophone: string | null;
  selectedSpeaker: string | null;
  audioLevel: number; // 0-100
  errors: DeviceTestError[];
}

export interface DeviceTestError {
  type: 'camera' | 'microphone' | 'speaker' | 'permission';
  message: string;
  code?: string;
}

export type PermissionState = 'granted' | 'denied' | 'prompt';
