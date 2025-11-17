/**
 * WebRTC Configuration
 * Handles STUN/TURN server configuration for NAT traversal
 */

export interface RTCConfig {
  iceServers: RTCIceServer[];
  iceCandidatePoolSize: number;
}

/**
 * Free STUN servers for development (Google's public STUN servers)
 * Production: Use Twilio TURN or self-hosted coturn for NAT traversal
 */
export const DEFAULT_RTC_CONFIG: RTCConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
  iceCandidatePoolSize: 10,
};

/**
 * Connection quality thresholds based on RTT and packet loss
 */
export const CONNECTION_QUALITY_THRESHOLDS = {
  excellent: {
    rtt: 100, // ms
    packetLoss: 1, // %
  },
  good: {
    rtt: 300, // ms
    packetLoss: 5, // %
  },
  // anything above "good" thresholds is considered "poor"
} as const;

/**
 * Reconnection strategy with exponential backoff
 */
export const RECONNECTION_CONFIG = {
  maxAttempts: 5,
  delays: [0, 1000, 2000, 4000, 8000], // ms - attempt 1 through 5
} as const;

/**
 * Performance requirements
 */
export const PERFORMANCE_CONFIG = {
  connectionEstablishmentTimeout: 3000, // ms
  latencyTarget: 500, // ms
  minVideoQuality: 720, // p
  preferredVideoQuality: 1080, // p
  healthCheckInterval: 10000, // ms (ping/pong every 10s)
  iceGatheringTimeout: 5000, // ms
} as const;
