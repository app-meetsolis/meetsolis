/**
 * WebRTC Service
 * Handles P2P video connections with DTLS/SRTP encryption
 */

import 'webrtc-adapter'; // Cross-browser compatibility layer
import SimplePeer from 'simple-peer';
import type {
  ConnectionState,
  ConnectionQuality,
  PeerConnectionInfo,
  ConnectionStats,
  WebRTCError,
  WebRTCErrorCode,
} from '@meetsolis/shared/types/webrtc';
import {
  DEFAULT_RTC_CONFIG,
  CONNECTION_QUALITY_THRESHOLDS,
  PERFORMANCE_CONFIG,
} from './config';
import debugLogger from '@/lib/debug-logger';

export class WebRTCService {
  private peerConnections: Map<string, SimplePeer.Instance> = new Map();
  private localStream: MediaStream | null = null;
  private remoteStreams: Map<string, MediaStream> = new Map();
  private connectionStates: Map<string, ConnectionState> = new Map();
  private connectionQualities: Map<string, ConnectionQuality> = new Map();
  private statsIntervals: Map<string, NodeJS.Timeout> = new Map();
  private signalBuffers: Map<string, SimplePeer.SignalData[]> = new Map();
  private localUserId: string | null = null; // Store local user ID for Perfect Negotiation

  // Event handlers
  private onStreamCallback?: (userId: string, stream: MediaStream) => void;
  private onConnectionStateCallback?: (
    userId: string,
    state: ConnectionState
  ) => void;
  private onConnectionQualityCallback?: (
    userId: string,
    quality: ConnectionQuality
  ) => void;
  private onErrorCallback?: (error: Error) => void;

  /**
   * Set local media stream from an existing stream
   */
  setLocalStream(stream: MediaStream): void {
    this.localStream = stream;
  }

  /**
   * Set local user ID for Perfect Negotiation
   */
  setLocalUserId(userId: string): void {
    this.localUserId = userId;
  }

  /**
   * Initialize local media stream
   */
  async initializeLocalStream(
    constraints: MediaStreamConstraints = {}
  ): Promise<MediaStream> {
    try {
      const defaultConstraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: {
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 60 },
        },
        ...constraints,
      };

      this.localStream =
        await navigator.mediaDevices.getUserMedia(defaultConstraints);
      return this.localStream;
    } catch (error) {
      const err = error as DOMException;
      if (err.name === 'NotAllowedError') {
        throw this.createError(
          'Camera/microphone permission denied',
          'PERMISSION_DENIED' as WebRTCErrorCode,
          err
        );
      } else if (err.name === 'NotFoundError') {
        throw this.createError(
          'No camera/microphone found',
          'DEVICE_NOT_FOUND' as WebRTCErrorCode,
          err
        );
      }
      throw this.createError(
        'Failed to initialize media stream',
        'STREAM_ERROR' as WebRTCErrorCode,
        err
      );
    }
  }

  /**
   * Create a peer connection (initiator)
   */
  async createPeerConnection(
    userId: string,
    signalCallback: (signal: SimplePeer.SignalData) => void
  ): Promise<void> {
    const msg = `🔵 INITIATING connection to ${userId}`;
    console.log(`[WebRTCService] ${msg}`);
    debugLogger.log('WebRTCService', msg, {
      userId,
      role: 'initiator',
      localUserId: this.localUserId,
    });

    if (!this.localStream) {
      throw this.createError(
        'Local stream not initialized',
        'STREAM_ERROR' as WebRTCErrorCode
      );
    }

    try {
      const peer = new SimplePeer({
        initiator: true,
        stream: this.localStream,
        config: DEFAULT_RTC_CONFIG,
        trickle: true, // Enable trickle ICE
      });

      this.setupPeerHandlers(peer, userId, signalCallback);
      this.peerConnections.set(userId, peer);

      // Drain only ICE candidate signals (not offers/answers)
      const buffered = this.signalBuffers.get(userId) || [];
      if (buffered.length > 0) {
        const iceCandidates = buffered.filter(sig => 'candidate' in sig);
        if (iceCandidates.length > 0) {
          console.log(
            `[WebRTCService] Draining ${iceCandidates.length} ICE candidates for ${userId}`
          );
          iceCandidates.forEach(signal => {
            try {
              peer.signal(signal);
            } catch (error) {
              console.error(
                `[WebRTCService] Error processing buffered ICE candidate:`,
                error
              );
            }
          });
        }
        this.signalBuffers.delete(userId);
      }

      this.updateConnectionState(userId, 'connecting');
    } catch (error) {
      throw this.createError(
        `Failed to create peer connection for user ${userId}`,
        'PEER_CONNECTION_FAILED' as WebRTCErrorCode,
        error as Error
      );
    }
  }

  /**
   * Accept a peer connection (non-initiator)
   */
  async acceptPeerConnection(
    userId: string,
    signal: SimplePeer.SignalData,
    signalCallback: (signal: SimplePeer.SignalData) => void
  ): Promise<void> {
    const msg = `🟢 ACCEPTING connection from ${userId}`;
    console.log(`[WebRTCService] ${msg}`);
    debugLogger.log('WebRTCService', msg, {
      userId,
      role: 'non-initiator',
      localUserId: this.localUserId,
    });

    if (!this.localStream) {
      throw this.createError(
        'Local stream not initialized',
        'STREAM_ERROR' as WebRTCErrorCode
      );
    }

    try {
      const peer = new SimplePeer({
        initiator: false,
        stream: this.localStream,
        config: DEFAULT_RTC_CONFIG,
        trickle: true,
      });

      this.setupPeerHandlers(peer, userId, signalCallback);
      this.peerConnections.set(userId, peer);

      // Process the initial offer first
      peer.signal(signal);

      // Then drain only ICE candidate signals (not offers/answers)
      const buffered = this.signalBuffers.get(userId) || [];
      if (buffered.length > 0) {
        const iceCandidates = buffered.filter(sig => 'candidate' in sig);
        if (iceCandidates.length > 0) {
          console.log(
            `[WebRTCService] Draining ${iceCandidates.length} ICE candidates for ${userId}`
          );
          iceCandidates.forEach(sig => {
            try {
              peer.signal(sig);
            } catch (error) {
              console.error(
                `[WebRTCService] Error processing buffered ICE candidate:`,
                error
              );
            }
          });
        }
        this.signalBuffers.delete(userId);
      }

      this.updateConnectionState(userId, 'connecting');
    } catch (error) {
      throw this.createError(
        `Failed to accept peer connection from user ${userId}`,
        'PEER_CONNECTION_FAILED' as WebRTCErrorCode,
        error as Error
      );
    }
  }

  /**
   * Handle incoming signal data
   */
  handleSignal(userId: string, signal: SimplePeer.SignalData): void {
    const peer = this.peerConnections.get(userId);

    if (!peer) {
      console.log(
        `[WebRTCService] Peer not ready for ${userId}, buffering signal`
      );

      // Buffer the signal
      if (!this.signalBuffers.has(userId)) {
        this.signalBuffers.set(userId, []);
      }
      this.signalBuffers.get(userId)!.push(signal);

      // Set timeout to drain buffer (in case peer is being created)
      setTimeout(() => {
        const laterPeer = this.peerConnections.get(userId);
        if (laterPeer) {
          const buffered = this.signalBuffers.get(userId) || [];
          // Only drain ICE candidates, not offers/answers
          const iceCandidates = buffered.filter(sig => 'candidate' in sig);
          if (iceCandidates.length > 0) {
            console.log(
              `[WebRTCService] Draining ${iceCandidates.length} buffered ICE candidates for ${userId}`
            );
            iceCandidates.forEach(sig => {
              try {
                laterPeer.signal(sig);
              } catch (error) {
                console.error(
                  `[WebRTCService] Error processing buffered ICE candidate:`,
                  error
                );
              }
            });
          }
          this.signalBuffers.delete(userId);
        }
      }, 100); // 100ms delay

      return;
    }

    try {
      peer.signal(signal);
    } catch (error) {
      this.handleError(
        this.createError(
          `Failed to process signal from user ${userId}`,
          'SIGNALING_ERROR' as WebRTCErrorCode,
          error as Error
        )
      );
    }
  }

  /**
   * Setup peer event handlers
   */
  private setupPeerHandlers(
    peer: SimplePeer.Instance,
    userId: string,
    signalCallback: (signal: SimplePeer.SignalData) => void
  ): void {
    // Signal event - send to remote peer via signaling server
    peer.on('signal', signal => {
      console.log(`[WebRTCService] SimplePeer 'signal' event for ${userId}:`, {
        type: signal.type || 'unknown',
        hasCandidate: !!(signal as any).candidate,
      });
      signalCallback(signal);
    });

    // Stream event - remote peer's media stream
    peer.on('stream', stream => {
      console.log(
        `[WebRTCService] SimplePeer 'stream' event - Received remote stream from ${userId}:`,
        {
          streamId: stream.id,
          audioTracks: stream.getAudioTracks().length,
          videoTracks: stream.getVideoTracks().length,
        }
      );
      this.remoteStreams.set(userId, stream);
      console.log(
        `[WebRTCService] Remote stream stored. Total remote streams:`,
        this.remoteStreams.size
      );

      if (this.onStreamCallback) {
        console.log(`[WebRTCService] Calling onStreamCallback for ${userId}`);
        this.onStreamCallback(userId, stream);
      } else {
        console.warn(`[WebRTCService] No onStreamCallback registered!`);
      }
    });

    // Connect event - peer connection established
    peer.on('connect', () => {
      console.log(
        `[WebRTCService] SimplePeer 'connect' event - P2P connection established with ${userId}`
      );
      this.updateConnectionState(userId, 'connected');
      this.startQualityMonitoring(userId, peer);
    });

    // Close event - peer connection closed
    peer.on('close', () => {
      console.log(
        `[WebRTCService] SimplePeer 'close' event - Connection closed with ${userId}`
      );
      this.updateConnectionState(userId, 'closed');
      this.cleanupUser(userId);
    });

    // Error event
    peer.on('error', err => {
      const msg = `🔴 SimplePeer ERROR for ${userId}: ${err.message || err}`;
      console.error(`[WebRTCService] ${msg}`, err);
      debugLogger.log(
        'WebRTCService',
        msg,
        {
          userId,
          errorMessage: err.message,
          errorCode: (err as any).code,
          errorName: err.name,
          stack: err.stack,
        },
        'error'
      );
      this.updateConnectionState(userId, 'failed');
      this.handleError(
        this.createError(
          `Peer connection error for user ${userId}`,
          'PEER_CONNECTION_FAILED' as WebRTCErrorCode,
          err
        )
      );
    });
  }

  /**
   * Start monitoring connection quality
   */
  private startQualityMonitoring(
    userId: string,
    peer: SimplePeer.Instance
  ): void {
    const interval = setInterval(async () => {
      try {
        const stats = await this.getConnectionStats(peer);
        const quality = this.calculateConnectionQuality(stats);

        const currentQuality = this.connectionQualities.get(userId);
        if (currentQuality !== quality) {
          this.connectionQualities.set(userId, quality);
          if (this.onConnectionQualityCallback) {
            this.onConnectionQualityCallback(userId, quality);
          }
        }
      } catch (error) {
        console.warn(`Failed to get stats for user ${userId}:`, error);
      }
    }, PERFORMANCE_CONFIG.healthCheckInterval);

    this.statsIntervals.set(userId, interval);
  }

  /**
   * Get connection statistics
   */
  private async getConnectionStats(
    peer: SimplePeer.Instance
  ): Promise<ConnectionStats> {
    // @ts-ignore - accessing internal _pc property of simple-peer
    const pc = peer._pc as RTCPeerConnection;
    const stats = await pc.getStats();

    let rtt = 0;
    let packetLoss = 0;
    let jitter = 0;
    let availableBandwidth = 0;

    stats.forEach(report => {
      if (report.type === 'candidate-pair' && report.state === 'succeeded') {
        rtt = report.currentRoundTripTime
          ? report.currentRoundTripTime * 1000
          : 0;
      }

      if (report.type === 'inbound-rtp' && report.kind === 'video') {
        const packetsLost = report.packetsLost || 0;
        const packetsReceived = report.packetsReceived || 1;
        packetLoss = (packetsLost / (packetsLost + packetsReceived)) * 100;
        jitter = report.jitter || 0;
      }

      if (report.type === 'candidate-pair') {
        availableBandwidth = report.availableOutgoingBitrate || 0;
      }
    });

    return {
      rtt,
      packetLoss,
      jitter,
      availableBandwidth: availableBandwidth / 1000, // Convert to kbps
      timestamp: Date.now(),
    };
  }

  /**
   * Calculate connection quality based on stats
   */
  private calculateConnectionQuality(
    stats: ConnectionStats
  ): ConnectionQuality {
    const { rtt, packetLoss } = stats;

    if (
      rtt < CONNECTION_QUALITY_THRESHOLDS.excellent.rtt &&
      packetLoss < CONNECTION_QUALITY_THRESHOLDS.excellent.packetLoss
    ) {
      return 'excellent';
    }

    if (
      rtt < CONNECTION_QUALITY_THRESHOLDS.good.rtt &&
      packetLoss < CONNECTION_QUALITY_THRESHOLDS.good.packetLoss
    ) {
      return 'good';
    }

    return 'poor';
  }

  /**
   * Toggle audio mute
   */
  toggleAudio(muted: boolean): void {
    if (!this.localStream) return;
    this.localStream.getAudioTracks().forEach(track => {
      track.enabled = !muted;
    });
  }

  /**
   * Toggle video
   */
  toggleVideo(off: boolean): void {
    if (!this.localStream) return;
    this.localStream.getVideoTracks().forEach(track => {
      track.enabled = !off;
    });
  }

  /**
   * Handle incoming offer from remote peer
   */
  async handleOffer(
    sdp: RTCSessionDescriptionInit,
    userId: string,
    signalCallback: (signal: SimplePeer.SignalData) => void
  ): Promise<void> {
    const existingPeer = this.peerConnections.get(userId);

    if (existingPeer) {
      const state = this.connectionStates.get(userId);

      // If already connected, this is a duplicate - ignore it completely
      if (state === 'connected') {
        const msg = `Peer ${userId} already connected, ignoring duplicate offer`;
        console.log(`[WebRTCService] ${msg}`);
        debugLogger.log('WebRTCService', msg, { userId, state });
        return;
      }

      // @ts-ignore - accessing internal _pc property
      const pc = existingPeer._pc as RTCPeerConnection;
      const signalingState = pc.signalingState;

      // If already in stable, this is a duplicate offer - ignore
      if (signalingState === 'stable') {
        const msg = `Peer ${userId} already in stable state, ignoring duplicate offer`;
        console.log(`[WebRTCService] ${msg}`);
        debugLogger.log(
          'WebRTCService',
          msg,
          { userId, signalingState },
          'warn'
        );
        return;
      }

      // ✅ PERFECT NEGOTIATION: Handle offer collision
      if (signalingState === 'have-local-offer') {
        const msg = `⚠️ OFFER COLLISION detected with ${userId}!`;
        console.log(`[WebRTCService] ${msg}`);
        debugLogger.log(
          'WebRTCService',
          msg,
          { userId, signalingState },
          'warn'
        );

        // Determine who is "polite" using deterministic comparison
        // The side with the lexicographically smaller ID is "polite"
        const isPolite = this.localUserId!.localeCompare(userId) < 0;

        const resolutionMsg = `Collision resolution: ${isPolite ? 'POLITE (rollback)' : 'IMPOLITE (ignore)'}`;
        console.log(`[WebRTCService] ${resolutionMsg}`);
        debugLogger.log('WebRTCService', resolutionMsg, {
          userId,
          isPolite,
          localUserId: this.localUserId,
        });

        if (isPolite) {
          // Polite side: ROLLBACK our offer, accept theirs
          const rollbackMsg = `Rolling back our offer for ${userId} (polite side)`;
          console.log(`[WebRTCService] ${rollbackMsg}`);
          debugLogger.log('WebRTCService', rollbackMsg, { userId });

          // Destroy the existing peer connection that sent the offer
          existingPeer.destroy();
          this.peerConnections.delete(userId);
          this.connectionStates.delete(userId);

          // Now fall through to acceptPeerConnection below
          // This will create a new non-initiator peer and accept their offer
        } else {
          // Impolite side: Ignore their offer, continue with ours
          const ignoreMsg = `Ignoring their offer for ${userId} (impolite side) - continuing with our offer`;
          console.log(`[WebRTCService] ${ignoreMsg}`);
          debugLogger.log('WebRTCService', ignoreMsg, { userId });
          return;
        }
      }

      // If in have-remote-offer, we might be cross-connecting - let it continue
      if (signalingState === 'have-remote-offer') {
        console.log(
          `[WebRTCService] Peer ${userId} in have-remote-offer, continuing with offer`
        );
        // Fall through to acceptPeerConnection
      }
    }

    // No existing peer OR peer in have-remote-offer state - create/continue connection
    await this.acceptPeerConnection(
      userId,
      sdp as SimplePeer.SignalData,
      signalCallback
    );
  }

  /**
   * Handle incoming answer from remote peer
   */
  async handleAnswer(
    sdp: RTCSessionDescriptionInit,
    userId: string
  ): Promise<void> {
    const peer = this.peerConnections.get(userId);

    if (!peer) {
      const msg = `No peer connection for ${userId}, buffering answer`;
      console.warn(`[WebRTCService] ${msg}`);
      debugLogger.log('WebRTCService', msg, { userId }, 'warn');
      this.handleSignal(userId, sdp as SimplePeer.SignalData);
      return;
    }

    // Check connection state - ignore duplicate answers
    const state = this.connectionStates.get(userId);
    if (state === 'connected') {
      const msg = `Peer ${userId} already connected, ignoring duplicate answer`;
      console.log(`[WebRTCService] ${msg}`);
      debugLogger.log('WebRTCService', msg, { userId, state }, 'warn');
      return;
    }

    // @ts-ignore - accessing internal _pc property
    const pc = peer._pc as RTCPeerConnection;
    const signalingState = pc.signalingState;

    // Only process answer if in correct state
    if (signalingState === 'have-local-offer') {
      const msg = `✅ Processing answer from ${userId}`;
      console.log(`[WebRTCService] ${msg} (state: ${signalingState})`);
      debugLogger.log('WebRTCService', msg, { userId, signalingState });
      this.handleSignal(userId, sdp as SimplePeer.SignalData);
    } else {
      const msg = `❌ Ignoring answer from ${userId} - WRONG STATE: ${signalingState}`;
      console.log(`[WebRTCService] ${msg} (expected: have-local-offer)`);
      debugLogger.log(
        'WebRTCService',
        msg,
        { userId, signalingState, expected: 'have-local-offer' },
        'error'
      );
    }
  }

  /**
   * Handle incoming ICE candidate from remote peer
   */
  async handleIceCandidate(
    candidate: RTCIceCandidateInit,
    userId: string
  ): Promise<void> {
    this.handleSignal(userId, { candidate } as SimplePeer.SignalData);
  }

  /**
   * Remove peer connection (alias for closePeerConnection)
   */
  removePeerConnection(userId: string): void {
    this.closePeerConnection(userId);
  }

  /**
   * Close peer connection
   */
  closePeerConnection(userId: string): void {
    const peer = this.peerConnections.get(userId);
    if (peer) {
      peer.destroy();
    }
    this.cleanupUser(userId);
  }

  /**
   * Cleanup resources for a user
   */
  private cleanupUser(userId: string): void {
    this.peerConnections.delete(userId);
    this.remoteStreams.delete(userId);
    this.connectionStates.delete(userId);
    this.connectionQualities.delete(userId);
    this.signalBuffers.delete(userId);

    const interval = this.statsIntervals.get(userId);
    if (interval) {
      clearInterval(interval);
      this.statsIntervals.delete(userId);
    }
  }

  /**
   * Cleanup all resources
   */
  destroy(): void {
    // Close all peer connections
    this.peerConnections.forEach(peer => peer.destroy());
    this.peerConnections.clear();

    // Stop all tracks in local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Clear remote streams
    this.remoteStreams.clear();

    // Clear all intervals
    this.statsIntervals.forEach(interval => clearInterval(interval));
    this.statsIntervals.clear();

    // Clear state maps
    this.connectionStates.clear();
    this.connectionQualities.clear();
  }

  /**
   * Update connection state
   */
  private updateConnectionState(userId: string, state: ConnectionState): void {
    this.connectionStates.set(userId, state);
    if (this.onConnectionStateCallback) {
      this.onConnectionStateCallback(userId, state);
    }
  }

  /**
   * Create a WebRTC error
   */
  private createError(
    message: string,
    code: WebRTCErrorCode,
    originalError?: Error
  ): Error {
    const error = new Error(message) as any;
    error.code = code;
    error.originalError = originalError;
    return error;
  }

  /**
   * Handle error
   */
  private handleError(error: Error): void {
    if (this.onErrorCallback) {
      this.onErrorCallback(error);
    }
  }

  // Event handler setters
  onStream(callback: (userId: string, stream: MediaStream) => void): void {
    this.onStreamCallback = callback;
  }

  onConnectionState(
    callback: (userId: string, state: ConnectionState) => void
  ): void {
    this.onConnectionStateCallback = callback;
  }

  onConnectionQuality(
    callback: (userId: string, quality: ConnectionQuality) => void
  ): void {
    this.onConnectionQualityCallback = callback;
  }

  onError(callback: (error: Error) => void): void {
    this.onErrorCallback = callback;
  }

  // Getters
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStream(userId: string): MediaStream | null {
    return this.remoteStreams.get(userId) || null;
  }

  getConnectionState(userId: string): ConnectionState | undefined {
    return this.connectionStates.get(userId);
  }

  getConnectionQuality(userId: string): ConnectionQuality | undefined {
    return this.connectionQualities.get(userId);
  }

  getAllRemoteStreams(): Map<string, MediaStream> {
    return new Map(this.remoteStreams);
  }

  /**
   * Get current WebRTC state
   */
  getState() {
    return {
      localStream: this.localStream,
      remoteStreams: new Map(this.remoteStreams),
      connectionQuality: this.getOverallConnectionQuality(),
      peerConnections: this.peerConnections,
    };
  }

  /**
   * Get overall connection quality (worst of all connections)
   */
  private getOverallConnectionQuality(): ConnectionQuality {
    if (this.connectionQualities.size === 0) return 'good';

    const qualities = Array.from(this.connectionQualities.values());
    if (qualities.some(q => q === 'poor')) return 'poor';
    if (qualities.some(q => q === 'good')) return 'good';
    return 'excellent';
  }

  /**
   * Cleanup/destroy (alias for backward compatibility)
   */
  public cleanup(): void {
    this.destroy();
  }
}
