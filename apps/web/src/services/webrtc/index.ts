/**
 * WebRTC Service Module
 * Exports WebRTC service, signaling service, and configuration
 */

export { WebRTCService } from './WebRTCService';
export { SignalingService } from './SignalingService';
export type {
  SignalingCallbacks,
  SignalingEventType,
} from './SignalingService';
export {
  DEFAULT_RTC_CONFIG,
  CONNECTION_QUALITY_THRESHOLDS,
  RECONNECTION_CONFIG,
  PERFORMANCE_CONFIG,
} from './config';
export type { RTCConfig } from './config';
