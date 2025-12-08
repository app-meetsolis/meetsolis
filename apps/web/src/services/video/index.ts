/**
 * Video Services - Export Module
 *
 * Centralized exports for video service implementations and utilities
 */

// Core abstractions
export {
  VideoServiceInterface,
  type VideoParticipant,
  type CallConfig,
  type RecordingState,
  type ConnectionState,
  type VideoServiceEvents,
  isVideoServiceInitialized,
} from './VideoServiceInterface';

// Provider implementations
export { StreamVideoService } from './StreamVideoService';
export { LiveKitVideoService } from './LiveKitVideoService';

// Factory
export { VideoServiceFactory, type VideoProvider } from './VideoServiceFactory';
