/**
 * WebRTC Configuration
 * Handles STUN/TURN server configuration for NAT traversal
 */

export interface RTCConfig {
  iceServers: RTCIceServer[];
  iceCandidatePoolSize: number;
}

/**
 * STUN/TURN servers for NAT traversal
 * - STUN: Discovers public IP (works for simple NAT)
 * - TURN: Relays traffic when direct connection fails (required for restrictive NAT/firewalls)
 *
 * Using free public TURN servers from Open Relay Project
 * Production: Replace with Twilio TURN, Metered.ca, or self-hosted coturn
 */
export const DEFAULT_RTC_CONFIG: RTCConfig = {
  iceServers: [
    // STUN servers - for IP discovery
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },

    // TURN servers - for traffic relay when direct connection fails
    // Open Relay Project (free public TURN servers)
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
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
