/**
 * Video Service Interface - Provider-Agnostic Abstraction Layer
 *
 * This interface defines the contract that all video service providers
 * (Stream, LiveKit, Agora, etc.) must implement. This abstraction allows
 * for easy provider switching with minimal code changes.
 *
 * Benefits:
 * - Vendor independence: Switch providers by changing env var + 1-2 days implementation
 * - Consistent API: Components don't need to know which provider is used
 * - Testability: Easy to mock for unit tests
 */

/**
 * Video participant representation
 * Normalized across all providers
 */
export interface VideoParticipant {
  /** Unique participant ID (Clerk user ID) */
  id: string;

  /** Display name */
  name: string;

  /** Combined audio/video MediaStream (if available) */
  stream: MediaStream | null;

  /** Whether this is the local user */
  isLocal: boolean;

  /** Audio mute state */
  isMuted: boolean;

  /** Video off state */
  isVideoOff: boolean;

  /** Network connection quality */
  connectionQuality: 'excellent' | 'good' | 'poor';

  /** Whether participant is currently speaking (optional) */
  isSpeaking?: boolean;

  /** Screen sharing stream (optional) */
  screenShareStream?: MediaStream | null;
}

/**
 * Configuration for initializing a video call
 */
export interface CallConfig {
  /** Meeting code/ID */
  meetingId: string;

  /** User ID (Clerk ID) */
  userId: string;

  /** User display name */
  userName: string;

  /** Enable audio on join (default: true) */
  audio?: boolean;

  /** Enable video on join (default: true) */
  video?: boolean;

  /** Provider-specific authentication token */
  token?: string;

  /** Additional provider-specific options */
  options?: Record<string, unknown>;
}

/**
 * Recording state information
 */
export interface RecordingState {
  /** Whether recording is active */
  isRecording: boolean;

  /** Recording start time (if active) */
  startTime?: Date;

  /** Recording duration in milliseconds (if active) */
  duration?: number;

  /** Recording ID (provider-specific) */
  recordingId?: string;
}

/**
 * Connection state
 */
export type ConnectionState =
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'failed';

/**
 * Event callbacks for video service events
 */
export interface VideoServiceEvents {
  /** Called when a participant joins the call */
  onParticipantJoined?: (participant: VideoParticipant) => void;

  /** Called when a participant leaves the call */
  onParticipantLeft?: (participantId: string) => void;

  /** Called when a participant's stream updates (e.g., unmutes) */
  onStreamUpdate?: (participantId: string, stream: MediaStream) => void;

  /** Called when a participant's audio/video state changes */
  onParticipantUpdate?: (participant: VideoParticipant) => void;

  /** Called when connection state changes */
  onConnectionStateChange?: (state: ConnectionState) => void;

  /** Called when recording state changes */
  onRecordingStateChange?: (state: RecordingState) => void;

  /** Called when an error occurs */
  onError?: (error: Error) => void;

  /** Called when speaking state changes */
  onSpeakingChange?: (participantId: string, isSpeaking: boolean) => void;
}

/**
 * Abstract base class for video service implementations
 *
 * All video providers (Stream, LiveKit, etc.) must extend this class
 * and implement all abstract methods.
 */
export abstract class VideoServiceInterface {
  protected events: VideoServiceEvents = {};

  /**
   * Initialize the video service with configuration
   * This sets up the client but doesn't join the call yet
   *
   * @param config - Call configuration
   */
  abstract initialize(config: CallConfig): Promise<void>;

  /**
   * Join the video call
   * After this, the local user should be visible to others
   */
  abstract joinCall(): Promise<void>;

  /**
   * Leave the video call
   * Cleanup should happen here
   */
  abstract leaveCall(): Promise<void>;

  /**
   * Toggle local audio (mute/unmute)
   * @returns New mute state (true = muted)
   */
  abstract toggleAudio(): Promise<boolean>;

  /**
   * Toggle local video (on/off)
   * @returns New video state (true = video off)
   */
  abstract toggleVideo(): Promise<boolean>;

  /**
   * Set audio state explicitly
   * @param enabled - True to enable audio, false to mute
   */
  abstract setAudio(enabled: boolean): Promise<void>;

  /**
   * Set video state explicitly
   * @param enabled - True to enable video, false to disable
   */
  abstract setVideo(enabled: boolean): Promise<void>;

  /**
   * Get all current participants
   * @returns Array of participants
   */
  abstract getParticipants(): VideoParticipant[];

  /**
   * Get a specific participant by ID
   * @param participantId - Participant ID to find
   * @returns Participant or undefined if not found
   */
  abstract getParticipant(participantId: string): VideoParticipant | undefined;

  /**
   * Start recording the call
   * @returns Recording ID (provider-specific)
   */
  abstract startRecording(): Promise<string>;

  /**
   * Stop recording the call
   */
  abstract stopRecording(): Promise<void>;

  /**
   * Get current recording state
   * @returns Recording state information
   */
  abstract getRecordingState(): RecordingState;

  /**
   * Start screen sharing
   * @returns MediaStream of screen share
   */
  abstract startScreenShare(): Promise<MediaStream>;

  /**
   * Stop screen sharing
   */
  abstract stopScreenShare(): Promise<void>;

  /**
   * Get current connection state
   * @returns Current connection state
   */
  abstract getConnectionState(): ConnectionState;

  /**
   * Get local participant (current user)
   * @returns Local participant or undefined if not initialized
   */
  abstract getLocalParticipant(): VideoParticipant | undefined;

  /**
   * Cleanup and destroy the service
   * Should be called when component unmounts
   */
  abstract destroy(): void;

  /**
   * Register event callbacks
   * @param events - Event callbacks to register
   */
  on(events: VideoServiceEvents): void {
    this.events = { ...this.events, ...events };
  }

  /**
   * Unregister all event callbacks
   */
  off(): void {
    this.events = {};
  }

  /**
   * Get the provider name
   * @returns Provider identifier ('stream', 'livekit', etc.)
   */
  abstract getProviderName(): string;
}

/**
 * Type guard to check if a service is initialized
 */
export const isVideoServiceInitialized = (
  service: VideoServiceInterface | null
): service is VideoServiceInterface => {
  return service !== null;
};
