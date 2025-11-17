/**
 * Signaling Service using Supabase Realtime
 * Handles SDP offer/answer and ICE candidate exchange for WebRTC
 */

import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';
import type {
  SignalingMessage,
  SDPMessage,
  ICECandidateMessage,
} from '@meetsolis/shared/types/webrtc';

export type SignalingEventType =
  | 'offer'
  | 'answer'
  | 'ice-candidate'
  | 'participant-joined'
  | 'participant-left';

export interface SignalingCallbacks {
  onOffer?: (sdp: RTCSessionDescriptionInit, from: string) => void;
  onAnswer?: (sdp: RTCSessionDescriptionInit, from: string) => void;
  onIceCandidate?: (candidate: RTCIceCandidateInit, from: string) => void;
  onParticipantJoined?: (userId: string, userName: string) => void;
  onParticipantLeft?: (userId: string) => void;
  onError?: (error: Error) => void;
}

export class SignalingService {
  private supabase: ReturnType<typeof createClient>;
  private channel: RealtimeChannel | null = null;
  private meetingId: string | null = null;
  private userId: string | null = null;
  private callbacks: SignalingCallbacks = {};

  constructor() {
    // Use NEXT_PUBLIC_ prefixed env vars for client-side access
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || config.supabase.url;
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || config.supabase.anonKey;

    if (!supabaseUrl) {
      throw new Error(
        'Supabase URL is not configured. Set NEXT_PUBLIC_SUPABASE_URL in your environment variables.'
      );
    }

    if (!supabaseAnonKey) {
      throw new Error(
        'Supabase Anon Key is not configured. Set NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.'
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  /**
   * Connect to signaling channel for a specific meeting
   */
  async connect(
    meetingId: string,
    userId: string,
    userName: string,
    callbacks: SignalingCallbacks
  ): Promise<void> {
    if (this.channel) {
      console.warn('Already connected to a signaling channel');
      return;
    }

    this.meetingId = meetingId;
    this.userId = userId;
    this.callbacks = callbacks;

    try {
      // Create meeting-specific channel with presence tracking
      this.channel = this.supabase.channel(`meeting:${meetingId}`, {
        config: {
          presence: {
            key: userId,
          },
          broadcast: {
            self: false, // Don't receive own messages
          },
        },
      });

      // Setup event handlers
      this.setupEventHandlers();

      // Subscribe to channel
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Signaling connection timeout'));
        }, 10000); // 10 second timeout

        this.channel!.subscribe((status, err) => {
          clearTimeout(timeout);

          if (status === 'SUBSCRIBED') {
            console.log('Connected to signaling channel:', meetingId);
            resolve();
          } else if (status === 'CHANNEL_ERROR') {
            reject(err || new Error('Channel subscription error'));
          } else if (status === 'TIMED_OUT') {
            reject(new Error('Channel subscription timed out'));
          }
        });
      });

      // Track presence with userId and userName
      console.log('[SignalingService] Tracking presence:', {
        userId,
        userName,
      });
      await this.channel.track({ userId, userName, timestamp: Date.now() });
    } catch (error) {
      console.error('Failed to connect to signaling channel:', error);
      this.cleanup();
      if (this.callbacks.onError) {
        this.callbacks.onError(error as Error);
      }
      throw error;
    }
  }

  /**
   * Setup event handlers for signaling messages
   */
  private setupEventHandlers(): void {
    if (!this.channel) return;

    // Handle WebRTC offer
    this.channel.on('broadcast', { event: 'offer' }, payload => {
      const data = payload.payload as SDPMessage;
      if (data.userId !== this.userId && this.callbacks.onOffer) {
        this.callbacks.onOffer(data.sdp, data.userId);
      }
    });

    // Handle WebRTC answer
    this.channel.on('broadcast', { event: 'answer' }, payload => {
      const data = payload.payload as SDPMessage;
      if (data.userId !== this.userId && this.callbacks.onAnswer) {
        this.callbacks.onAnswer(data.sdp, data.userId);
      }
    });

    // Handle ICE candidate
    this.channel.on('broadcast', { event: 'ice-candidate' }, payload => {
      const data = payload.payload as ICECandidateMessage;
      if (data.userId !== this.userId && this.callbacks.onIceCandidate) {
        this.callbacks.onIceCandidate(data.candidate, data.userId);
      }
    });

    // Handle participant joined
    this.channel.on('presence', { event: 'join' }, payload => {
      console.log(
        '[SignalingService] Participant joined - Full payload:',
        JSON.stringify(payload, null, 2)
      );

      const { key, newPresences } = payload;

      if (key !== this.userId && this.callbacks.onParticipantJoined) {
        // Extract userName from newPresences array
        // newPresences is an array of presence objects, find the one matching this key
        const presenceData = Array.isArray(newPresences)
          ? newPresences.find((p: any) => p.userId === key)
          : null;

        const userName = presenceData?.userName || `User ${key.slice(0, 8)}`;

        console.log('[SignalingService] Extracted presence data:', {
          userId: key,
          userName,
          presenceData,
        });

        this.callbacks.onParticipantJoined(key, userName);
      }
    });

    // Handle participant left
    this.channel.on(
      'presence',
      { event: 'leave' },
      ({ key, leftPresences }) => {
        console.log('Participant left:', key);
        if (key !== this.userId && this.callbacks.onParticipantLeft) {
          this.callbacks.onParticipantLeft(key);
        }
      }
    );
  }

  /**
   * Send WebRTC offer
   */
  async sendOffer(sdp: RTCSessionDescriptionInit): Promise<void> {
    if (!this.channel || !this.userId) {
      throw new Error('Not connected to signaling channel');
    }

    const message: SDPMessage = {
      sdp,
      userId: this.userId,
      timestamp: Date.now(),
    };

    await this.channel.send({
      type: 'broadcast',
      event: 'offer',
      payload: message,
    });
  }

  /**
   * Send WebRTC answer
   */
  async sendAnswer(sdp: RTCSessionDescriptionInit): Promise<void> {
    if (!this.channel || !this.userId) {
      throw new Error('Not connected to signaling channel');
    }

    const message: SDPMessage = {
      sdp,
      userId: this.userId,
      timestamp: Date.now(),
    };

    await this.channel.send({
      type: 'broadcast',
      event: 'answer',
      payload: message,
    });
  }

  /**
   * Send ICE candidate
   */
  async sendIceCandidate(candidate: RTCIceCandidate): Promise<void> {
    if (!this.channel || !this.userId) {
      throw new Error('Not connected to signaling channel');
    }

    const message: ICECandidateMessage = {
      candidate: candidate.toJSON(),
      userId: this.userId,
    };

    await this.channel.send({
      type: 'broadcast',
      event: 'ice-candidate',
      payload: message,
    });
  }

  /**
   * Get current participants in the channel
   */
  async getParticipants(): Promise<string[]> {
    if (!this.channel) {
      return [];
    }

    const presenceState = await this.channel.presenceState();
    return Object.keys(presenceState).filter(key => key !== this.userId);
  }

  /**
   * Disconnect from signaling channel
   */
  async disconnect(): Promise<void> {
    if (!this.channel) {
      return;
    }

    try {
      // Untrack presence
      await this.channel.untrack();

      // Unsubscribe from channel
      await this.channel.unsubscribe();

      // Remove channel
      this.supabase.removeChannel(this.channel);
    } catch (error) {
      console.error('Error disconnecting from signaling channel:', error);
    } finally {
      this.cleanup();
    }
  }

  /**
   * Cleanup internal state
   */
  private cleanup(): void {
    this.channel = null;
    this.meetingId = null;
    this.userId = null;
    this.callbacks = {};
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.channel !== null;
  }

  /**
   * Get current meeting ID
   */
  getMeetingId(): string | null {
    return this.meetingId;
  }

  /**
   * Get current user ID
   */
  getUserId(): string | null {
    return this.userId;
  }
}
