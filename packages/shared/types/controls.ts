/**
 * Control State Types
 * Shared types for meeting control states across the application
 */

export interface ControlState {
  // Audio controls
  isAudioMuted: boolean;
  audioLevel: number;
  isSpeaking: boolean;
  noiseSuppressionEnabled: boolean;

  // Video controls
  isVideoOff: boolean;

  // Push-to-talk
  isPushToTalkMode: boolean;
  isPushToTalkActive: boolean;

  // Device selection
  selectedMicrophone: string | null;
  selectedCamera: string | null;
  selectedSpeaker: string | null;

  // User preferences
  autoMuteOnJoin: boolean;
  defaultVideoOff: boolean;
}

export interface UserMeetingPreferences {
  autoMuteOnJoin: boolean;
  defaultVideoOff: boolean;
  preferredMicrophone: string | null;
  preferredCamera: string | null;
  preferredSpeaker: string | null;
  noiseSuppressionEnabled: boolean;
  pushToTalkMode: boolean;
  audioFeedbackEnabled: boolean;
}

export interface ControlActions {
  // Audio actions
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
  toggleNoiseSuppression: () => Promise<void>;

  // Video actions
  toggleVideo: () => void;
  setVideoOff: (off: boolean) => void;

  // Push-to-talk actions
  togglePushToTalkMode: () => void;
  setPushToTalkMode: (enabled: boolean) => void;
  onPushToTalkStart: () => void;
  onPushToTalkEnd: () => void;

  // Device actions
  selectMicrophone: (deviceId: string) => void;
  selectCamera: (deviceId: string) => void;
  selectSpeaker: (deviceId: string) => void;
  refreshDevices: () => Promise<void>;

  // Preferences
  updatePreferences: (prefs: Partial<UserMeetingPreferences>) => void;
}

export interface ControlContextValue {
  state: ControlState;
  actions: ControlActions;
}
