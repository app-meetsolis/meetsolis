/**
 * Stream Video Service Implementation
 *
 * Wraps the Stream Video SDK and implements the VideoServiceInterface.
 * This provides a clean abstraction over Stream's API and maps events
 * to our standardized interface.
 *
 * Stream SDK Docs: https://getstream.io/video/docs/
 */

import { StreamVideoClient, Call } from '@stream-io/video-react-sdk';
import type { StreamVideoParticipant } from '@stream-io/video-react-sdk';
import {
  VideoServiceInterface,
  VideoParticipant,
  CallConfig,
  RecordingState,
  ConnectionState,
} from './VideoServiceInterface';
import {
  mapConnectionQuality,
  mapConnectionState,
  generateCallId,
  handleStreamError,
} from '@/lib/stream/utils';

/**
 * Stream Video Service
 *
 * Implements VideoServiceInterface using Stream SDK.
 * Handles SFU-based video calls with built-in recording and transcription.
 */
export class StreamVideoService extends VideoServiceInterface {
  private client: StreamVideoClient | null = null;
  private call: Call | null = null;
  private participants: Map<string, VideoParticipant> = new Map();
  private connectionState: ConnectionState = 'disconnected';
  private localParticipant: VideoParticipant | null = null;
  private recordingState: RecordingState = { isRecording: false };

  /**
   * Initialize the Stream Video client
   */
  async initialize(config: CallConfig): Promise<void> {
    try {
      if (!config.token) {
        throw new Error('Stream token is required for initialization');
      }

      const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
      if (!apiKey) {
        throw new Error('NEXT_PUBLIC_STREAM_API_KEY not configured');
      }

      // Create Stream Video client
      this.client = new StreamVideoClient({
        apiKey,
        user: {
          id: config.userId,
          name: config.userName,
        },
        token: config.token,
      });

      // Create call instance
      const callId = generateCallId(config.meetingId);
      this.call = this.client.call('default', callId);

      // Setup event listeners before joining
      this.setupEventListeners();

      // Set initial audio/video state
      const audioEnabled = config.audio !== false; // Default true
      const videoEnabled = config.video !== false; // Default true

      if (audioEnabled) {
        await this.call.microphone.enable();
      } else {
        await this.call.microphone.disable();
      }

      if (videoEnabled) {
        await this.call.camera.enable();
      } else {
        await this.call.camera.disable();
      }

      console.log('[StreamVideoService] Initialized successfully', {
        callId,
        userId: config.userId,
        audio: audioEnabled,
        video: videoEnabled,
      });
    } catch (error) {
      const errorMessage = handleStreamError(error);
      console.error(
        '[StreamVideoService] Initialization failed:',
        errorMessage,
        error
      );
      this.events.onError?.(
        error instanceof Error ? error : new Error(errorMessage)
      );
      throw error;
    }
  }

  /**
   * Join the video call
   */
  async joinCall(): Promise<void> {
    if (!this.call) {
      throw new Error('Call not initialized. Call initialize() first.');
    }

    try {
      this.connectionState = 'connecting';
      this.events.onConnectionStateChange?.('connecting');

      // Join the call (create it if it doesn't exist)
      await this.call.join({ create: true });

      this.connectionState = 'connected';
      this.events.onConnectionStateChange?.('connected');

      console.log('[StreamVideoService] Joined call successfully');
    } catch (error) {
      this.connectionState = 'failed';
      this.events.onConnectionStateChange?.('failed');

      const errorMessage = handleStreamError(error);
      console.error('[StreamVideoService] Join failed:', errorMessage, error);
      this.events.onError?.(
        error instanceof Error ? error : new Error(errorMessage)
      );
      throw error;
    }
  }

  /**
   * Leave the video call
   */
  async leaveCall(): Promise<void> {
    if (!this.call) return;

    try {
      await this.call.leave();

      this.connectionState = 'disconnected';
      this.events.onConnectionStateChange?.('disconnected');

      console.log('[StreamVideoService] Left call successfully');
    } catch (error) {
      console.error('[StreamVideoService] Leave failed:', error);
      // Don't throw on leave - we want to cleanup anyway
    }
  }

  /**
   * Toggle audio (mute/unmute)
   */
  async toggleAudio(): Promise<boolean> {
    if (!this.call) throw new Error('Call not initialized');

    try {
      await this.call.microphone.toggle();
      const isMuted = !this.call.microphone.state.status === 'enabled';

      console.log(
        '[StreamVideoService] Audio toggled:',
        isMuted ? 'muted' : 'unmuted'
      );
      return isMuted;
    } catch (error) {
      console.error('[StreamVideoService] Toggle audio failed:', error);
      throw error;
    }
  }

  /**
   * Toggle video (on/off)
   */
  async toggleVideo(): Promise<boolean> {
    if (!this.call) throw new Error('Call not initialized');

    try {
      await this.call.camera.toggle();
      const isVideoOff = this.call.camera.state.status !== 'enabled';

      console.log(
        '[StreamVideoService] Video toggled:',
        isVideoOff ? 'off' : 'on'
      );
      return isVideoOff;
    } catch (error) {
      console.error('[StreamVideoService] Toggle video failed:', error);
      throw error;
    }
  }

  /**
   * Set audio state explicitly
   */
  async setAudio(enabled: boolean): Promise<void> {
    if (!this.call) throw new Error('Call not initialized');

    try {
      if (enabled) {
        await this.call.microphone.enable();
      } else {
        await this.call.microphone.disable();
      }

      console.log(
        '[StreamVideoService] Audio set to:',
        enabled ? 'enabled' : 'disabled'
      );
    } catch (error) {
      console.error('[StreamVideoService] Set audio failed:', error);
      throw error;
    }
  }

  /**
   * Set video state explicitly
   */
  async setVideo(enabled: boolean): Promise<void> {
    if (!this.call) throw new Error('Call not initialized');

    try {
      if (enabled) {
        await this.call.camera.enable();
      } else {
        await this.call.camera.disable();
      }

      console.log(
        '[StreamVideoService] Video set to:',
        enabled ? 'enabled' : 'disabled'
      );
    } catch (error) {
      console.error('[StreamVideoService] Set video failed:', error);
      throw error;
    }
  }

  /**
   * Get all participants
   */
  getParticipants(): VideoParticipant[] {
    return Array.from(this.participants.values());
  }

  /**
   * Get a specific participant
   */
  getParticipant(participantId: string): VideoParticipant | undefined {
    return this.participants.get(participantId);
  }

  /**
   * Start recording
   */
  async startRecording(): Promise<string> {
    if (!this.call) throw new Error('Call not initialized');

    try {
      await this.call.startRecording();

      const recordingId = `recording_${Date.now()}`;
      this.recordingState = {
        isRecording: true,
        startTime: new Date(),
        duration: 0,
        recordingId,
      };

      this.events.onRecordingStateChange?.(this.recordingState);

      console.log('[StreamVideoService] Recording started:', recordingId);
      return recordingId;
    } catch (error) {
      console.error('[StreamVideoService] Start recording failed:', error);
      throw error;
    }
  }

  /**
   * Stop recording
   */
  async stopRecording(): Promise<void> {
    if (!this.call) throw new Error('Call not initialized');

    try {
      await this.call.stopRecording();

      this.recordingState = { isRecording: false };
      this.events.onRecordingStateChange?.(this.recordingState);

      console.log('[StreamVideoService] Recording stopped');
    } catch (error) {
      console.error('[StreamVideoService] Stop recording failed:', error);
      throw error;
    }
  }

  /**
   * Get recording state
   */
  getRecordingState(): RecordingState {
    return { ...this.recordingState };
  }

  /**
   * Start screen sharing
   */
  async startScreenShare(): Promise<MediaStream> {
    if (!this.call) throw new Error('Call not initialized');

    try {
      await this.call.screenShare.enable();

      // Get the screen share stream
      const screenShareStream = this.call.screenShare.state.mediaStream;
      if (!screenShareStream) {
        throw new Error('Screen share stream not available');
      }

      console.log('[StreamVideoService] Screen share started');
      return screenShareStream;
    } catch (error) {
      console.error('[StreamVideoService] Start screen share failed:', error);
      throw error;
    }
  }

  /**
   * Stop screen sharing
   */
  async stopScreenShare(): Promise<void> {
    if (!this.call) throw new Error('Call not initialized');

    try {
      await this.call.screenShare.disable();
      console.log('[StreamVideoService] Screen share stopped');
    } catch (error) {
      console.error('[StreamVideoService] Stop screen share failed:', error);
      throw error;
    }
  }

  /**
   * Get connection state
   */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Get local participant
   */
  getLocalParticipant(): VideoParticipant | undefined {
    return this.localParticipant || undefined;
  }

  /**
   * Cleanup and destroy
   */
  destroy(): void {
    console.log('[StreamVideoService] Destroying service');

    // Leave call if still in one
    this.call?.leave().catch(error => {
      console.warn(
        '[StreamVideoService] Error leaving call during destroy:',
        error
      );
    });

    // Clear state
    this.client = null;
    this.call = null;
    this.participants.clear();
    this.localParticipant = null;
    this.connectionState = 'disconnected';
    this.recordingState = { isRecording: false };
  }

  /**
   * Get provider name
   */
  getProviderName(): string {
    return 'stream';
  }

  /**
   * Setup event listeners for Stream SDK
   */
  private setupEventListeners(): void {
    if (!this.call) return;

    // Subscribe to participant changes
    this.call.state.participants$.subscribe(participants => {
      this.handleParticipantsUpdate(participants);
    });

    // Subscribe to connection state changes
    this.call.state.callingState$.subscribe(state => {
      const mappedState = this.mapCallingState(state);
      if (mappedState !== this.connectionState) {
        this.connectionState = mappedState;
        this.events.onConnectionStateChange?.(mappedState);
      }
    });

    // Subscribe to recording state changes
    this.call.state.recording$.subscribe(isRecording => {
      if (isRecording !== this.recordingState.isRecording) {
        if (isRecording) {
          this.recordingState = {
            isRecording: true,
            startTime: new Date(),
            duration: 0,
            recordingId: `recording_${Date.now()}`,
          };
        } else {
          this.recordingState = { isRecording: false };
        }
        this.events.onRecordingStateChange?.(this.recordingState);
      }
    });

    console.log('[StreamVideoService] Event listeners setup complete');
  }

  /**
   * Handle participant updates from Stream
   */
  private handleParticipantsUpdate(
    streamParticipants: StreamVideoParticipant[]
  ): void {
    const currentIds = new Set(streamParticipants.map(p => p.userId));

    // Process each participant
    streamParticipants.forEach(streamParticipant => {
      const participant = this.mapStreamParticipant(streamParticipant);
      const existing = this.participants.get(participant.id);

      // Update participant map
      this.participants.set(participant.id, participant);

      // Update local participant reference
      if (participant.isLocal) {
        this.localParticipant = participant;
      }

      // Trigger events
      if (!existing) {
        // New participant joined
        this.events.onParticipantJoined?.(participant);
        console.log('[StreamVideoService] Participant joined:', participant.id);
      } else {
        // Participant updated
        const streamChanged = existing.stream !== participant.stream;
        const stateChanged =
          existing.isMuted !== participant.isMuted ||
          existing.isVideoOff !== participant.isVideoOff;

        if (streamChanged && participant.stream) {
          this.events.onStreamUpdate?.(participant.id, participant.stream);
        }

        if (stateChanged || streamChanged) {
          this.events.onParticipantUpdate?.(participant);
        }

        // Check for speaking state changes
        if (existing.isSpeaking !== participant.isSpeaking) {
          this.events.onSpeakingChange?.(
            participant.id,
            participant.isSpeaking || false
          );
        }
      }
    });

    // Check for participants who left
    this.participants.forEach((participant, id) => {
      if (!currentIds.has(id)) {
        this.participants.delete(id);
        this.events.onParticipantLeft?.(id);
        console.log('[StreamVideoService] Participant left:', id);
      }
    });
  }

  /**
   * Map Stream participant to our VideoParticipant interface
   */
  private mapStreamParticipant(
    streamParticipant: StreamVideoParticipant
  ): VideoParticipant {
    const publishedTracks = streamParticipant.publishedTracks || [];

    return {
      id: streamParticipant.userId,
      name: streamParticipant.name || streamParticipant.userId,
      stream:
        streamParticipant.videoStream || streamParticipant.audioStream || null,
      isLocal: streamParticipant.isLocalParticipant,
      isMuted: !publishedTracks.includes('audio'),
      isVideoOff: !publishedTracks.includes('video'),
      connectionQuality: mapConnectionQuality(
        streamParticipant.connectionQuality
      ),
      isSpeaking: streamParticipant.isSpeaking,
      screenShareStream: streamParticipant.screenShareStream || null,
    };
  }

  /**
   * Map Stream calling state to our ConnectionState
   */
  private mapCallingState(state: string): ConnectionState {
    const normalizedState = state.toLowerCase();

    if (normalizedState.includes('join')) return 'connected';
    if (normalizedState.includes('reconnect')) return 'reconnecting';
    if (normalizedState === 'idle') return 'disconnected';

    return mapConnectionState(state);
  }
}
