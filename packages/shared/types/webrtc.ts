/**
 * WebRTC Type Definitions
 * Shared types for WebRTC functionality across the application
 */

export type ConnectionState =
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'failed'
  | 'closed';

export type ConnectionQuality = 'excellent' | 'good' | 'poor';

export interface WebRTCState {
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  peerConnections: Map<string, RTCPeerConnection>;
  isAudioMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  connectionQuality: ConnectionQuality;
  connectionState: ConnectionState;
}

export interface PeerConnectionInfo {
  userId: string;
  connection: RTCPeerConnection;
  stream: MediaStream | null;
  connectionState: ConnectionState;
  connectionQuality: ConnectionQuality;
  lastStatsUpdate: number;
}

export interface ConnectionStats {
  rtt: number; // Round-trip time in ms
  packetLoss: number; // Packet loss percentage
  jitter: number; // Jitter in ms
  availableBandwidth: number; // kbps
  timestamp: number;
}

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'join' | 'leave';
  from: string;
  to?: string;
  payload: any;
  timestamp: number;
}

export interface ICECandidateMessage {
  candidate: RTCIceCandidateInit;
  userId: string;
}

export interface SDPMessage {
  sdp: RTCSessionDescriptionInit;
  userId: string;
  timestamp: number;
}

/**
 * WebRTC Error types for better error handling
 */
export class WebRTCError extends Error {
  constructor(
    message: string,
    public code: WebRTCErrorCode,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'WebRTCError';
  }
}

export enum WebRTCErrorCode {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  DEVICE_NOT_FOUND = 'DEVICE_NOT_FOUND',
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  SIGNALING_ERROR = 'SIGNALING_ERROR',
  ICE_GATHERING_TIMEOUT = 'ICE_GATHERING_TIMEOUT',
  PEER_CONNECTION_FAILED = 'PEER_CONNECTION_FAILED',
  STREAM_ERROR = 'STREAM_ERROR',
}
