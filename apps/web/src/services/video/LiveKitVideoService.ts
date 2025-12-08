/**
 * LiveKit Video Service - Stub Implementation
 *
 * This is a placeholder implementation for future migration to LiveKit
 * or other video providers. It implements the VideoServiceInterface
 * but throws "not implemented" errors for all methods.
 *
 * When migrating away from Stream:
 * 1. Install LiveKit SDK: npm install @livekit/components-react livekit-client
 * 2. Implement all methods following the same pattern as StreamVideoService
 * 3. Update .env: NEXT_PUBLIC_VIDEO_PROVIDER=livekit
 * 4. Estimated implementation time: 1-2 days
 *
 * LiveKit Docs: https://docs.livekit.io/
 */

import {
  VideoServiceInterface,
  VideoParticipant,
  CallConfig,
  RecordingState,
  ConnectionState,
} from './VideoServiceInterface';

export class LiveKitVideoService extends VideoServiceInterface {
  async initialize(config: CallConfig): Promise<void> {
    throw new Error(
      'LiveKit service not implemented. To use LiveKit, implement this service following the StreamVideoService pattern.'
    );
  }

  async joinCall(): Promise<void> {
    throw new Error('LiveKit service not implemented');
  }

  async leaveCall(): Promise<void> {
    throw new Error('LiveKit service not implemented');
  }

  async toggleAudio(): Promise<boolean> {
    throw new Error('LiveKit service not implemented');
  }

  async toggleVideo(): Promise<boolean> {
    throw new Error('LiveKit service not implemented');
  }

  async setAudio(enabled: boolean): Promise<void> {
    throw new Error('LiveKit service not implemented');
  }

  async setVideo(enabled: boolean): Promise<void> {
    throw new Error('LiveKit service not implemented');
  }

  getParticipants(): VideoParticipant[] {
    throw new Error('LiveKit service not implemented');
  }

  getParticipant(participantId: string): VideoParticipant | undefined {
    throw new Error('LiveKit service not implemented');
  }

  async startRecording(): Promise<string> {
    throw new Error('LiveKit service not implemented');
  }

  async stopRecording(): Promise<void> {
    throw new Error('LiveKit service not implemented');
  }

  getRecordingState(): RecordingState {
    throw new Error('LiveKit service not implemented');
  }

  async startScreenShare(): Promise<MediaStream> {
    throw new Error('LiveKit service not implemented');
  }

  async stopScreenShare(): Promise<void> {
    throw new Error('LiveKit service not implemented');
  }

  getConnectionState(): ConnectionState {
    throw new Error('LiveKit service not implemented');
  }

  getLocalParticipant(): VideoParticipant | undefined {
    throw new Error('LiveKit service not implemented');
  }

  destroy(): void {
    // No-op for stub
  }

  getProviderName(): string {
    return 'livekit';
  }
}
