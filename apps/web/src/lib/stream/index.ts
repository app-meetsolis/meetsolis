/**
 * Stream SDK - Export Module
 *
 * Centralized exports for Stream SDK utilities and client initialization
 */

// Client initialization
export {
  getStreamServerClient,
  createStreamVideoClient,
  generateStreamUserToken,
  upsertStreamUser,
} from './client';

// Utilities
export {
  mapConnectionQuality,
  mapConnectionState,
  formatRecordingDuration,
  isTrackPublished,
  generateCallId,
  validateStreamConfig,
  handleStreamError,
} from './utils';
