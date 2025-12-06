/**
 * StreamVideoCallManager Component
 * Video call manager using Stream SDK (SFU architecture)
 *
 * This component replaces the mesh WebRTC implementation with Stream's SFU.
 * Benefits:
 * - Scales to 100+ participants (vs 2-4 with mesh)
 * - Built-in recording & transcription
 * - Automatic quality adaptation
 * - No offer collision errors
 * - 1x upload bandwidth (vs N-1 with mesh)
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ParticipantGrid, type Participant } from './ParticipantGrid';
import { MeetingLoadingSkeleton } from './MeetingLoadingSkeleton';
import { VideoServiceFactory } from '@/services/video';
import type {
  VideoServiceInterface,
  VideoParticipant,
  ConnectionState,
} from '@/services/video';
import { useMediaStream } from '@/hooks/useMediaStream';
import { useParticipantState } from '@/hooks/meeting/useParticipantState';
import { usePushToTalk } from '@/hooks/meeting/usePushToTalk';
import { useAudioControls } from '@/hooks/meeting/useAudioControls';
import {
  subscribeToMeetingEvents,
  unsubscribeChannel,
} from '@/lib/supabase/realtime';
import { cn } from '@/lib/utils';
import type { NormalizedParticipantData } from '../../../../../packages/shared/types/realtime';

export interface StreamVideoCallManagerProps {
  meetingId: string;
  userId: string;
  userName: string;
  onStateChange?: (state: VideoCallState) => void;
  onError?: (error: Error) => void;
  onParticipantJoin?: (participantId: string) => void;
  onParticipantLeave?: (participantId: string) => void;
  onToggleAudio?: () => void;
  onToggleVideo?: () => void;
  onMeetingEnded?: (data: { endedByHost: boolean; endedAt: string }) => void;
  className?: string;
}

export interface VideoCallState {
  connectionState: ConnectionState;
  participants: Participant[];
  error: Error | null;
  toggleAudio?: () => void;
  toggleVideo?: () => void;
  isAudioMuted?: boolean;
  isVideoOff?: boolean;
  localStream?: MediaStream | null;
  isPushToTalkMode?: boolean;
  isPushToTalkActive?: boolean;
  togglePushToTalkMode?: () => void;
  audioLevel?: number;
}

/**
 * StreamVideoCallManager Component
 */
export function StreamVideoCallManager({
  meetingId,
  userId,
  userName,
  onStateChange,
  onError,
  onParticipantJoin,
  onParticipantLeave,
  onMeetingEnded,
  className = '',
}: StreamVideoCallManagerProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>('disconnected');
  const [error, setError] = useState<Error | null>(null);
  const [meetingUuid, setMeetingUuid] = useState<string | null>(null);

  const videoServiceRef = useRef<VideoServiceInterface | null>(null);
  const isInitializedRef = useRef(false);
  const userIdToClerkIdRef = useRef<Map<string, string>>(new Map());

  // Get local media stream  (we'll use Stream's built-in media handling instead)
  const {
    stream: localStream,
    isAudioEnabled,
    isVideoEnabled,
    toggleAudio: toggleAudioLocal,
    toggleVideo: toggleVideoLocal,
    error: streamError,
  } = useMediaStream({
    videoQuality: 'hd',
    audioQuality: 'standard',
    autoMuteOnJoin: true,
    noiseSuppression: true,
  });

  // Audio controls for speaking detection
  const { isSpeaking, audioLevel } = useAudioControls({
    stream: localStream,
    enableNoiseSupression: true,
    playAudioFeedback: false,
  });

  // Hook for updating participant state in database
  const { updateMyState } = useParticipantState({ meetingId });

  // PTT refs
  const togglePushToTalkModeRef = useRef<(() => void) | null>(null);
  const isPushToTalkModeRef = useRef(false);

  /**
   * Toggle audio with Stream SDK
   */
  const toggleAudio = useCallback(async () => {
    // Disable PTT mode if enabled
    if (isPushToTalkModeRef.current && togglePushToTalkModeRef.current) {
      setTimeout(() => {
        if (togglePushToTalkModeRef.current) {
          togglePushToTalkModeRef.current();
        }
      }, 0);
    }

    if (videoServiceRef.current) {
      try {
        const isMuted = await videoServiceRef.current.toggleAudio();
        updateMyState({ is_muted: isMuted });
      } catch (err) {
        console.error('[StreamVideoCallManager] Toggle audio failed:', err);
      }
    }
  }, [updateMyState]);

  /**
   * Toggle video with Stream SDK
   */
  const toggleVideo = useCallback(async () => {
    if (videoServiceRef.current) {
      try {
        const isVideoOff = await videoServiceRef.current.toggleVideo();
        updateMyState({ is_video_off: isVideoOff });
      } catch (err) {
        console.error('[StreamVideoCallManager] Toggle video failed:', err);
      }
    }
  }, [updateMyState]);

  // Stable PTT callbacks
  const isAudioEnabledRef = useRef(isAudioEnabled);
  isAudioEnabledRef.current = isAudioEnabled;

  const stablePushStart = useCallback(() => {
    if (!isAudioEnabledRef.current && videoServiceRef.current) {
      videoServiceRef.current.setAudio(true);
    }
  }, []);

  const stablePushEnd = useCallback(() => {
    if (isAudioEnabledRef.current && videoServiceRef.current) {
      videoServiceRef.current.setAudio(false);
    }
  }, []);

  const stableToggleMode = useCallback((enabled: boolean) => {
    if (enabled && isAudioEnabledRef.current && videoServiceRef.current) {
      videoServiceRef.current.setAudio(false);
    }
  }, []);

  // Push-to-Talk hook
  const { isPushToTalkMode, isPushToTalkActive, togglePushToTalkMode } =
    usePushToTalk({
      enabled: false,
      onPushStart: stablePushStart,
      onPushEnd: stablePushEnd,
      onToggleMode: stableToggleMode,
    });

  isPushToTalkModeRef.current = isPushToTalkMode;
  togglePushToTalkModeRef.current = togglePushToTalkMode;

  /**
   * Update video call state
   */
  const updateState = useCallback(
    (newState: Partial<VideoCallState>) => {
      const state: VideoCallState = {
        connectionState,
        participants,
        error,
        toggleAudio,
        toggleVideo,
        isAudioMuted: !isAudioEnabled,
        isVideoOff: !isVideoEnabled,
        localStream,
        isPushToTalkMode,
        isPushToTalkActive,
        togglePushToTalkMode,
        audioLevel,
        ...newState,
      };

      if (onStateChange) {
        onStateChange(state);
      }
    },
    [
      connectionState,
      participants,
      error,
      toggleAudio,
      toggleVideo,
      isAudioEnabled,
      isVideoEnabled,
      localStream,
      isPushToTalkMode,
      isPushToTalkActive,
      togglePushToTalkMode,
      audioLevel,
      onStateChange,
    ]
  );

  /**
   * Handle errors
   */
  const handleError = useCallback(
    (err: Error) => {
      console.error('[StreamVideoCallManager] Error:', err);
      setError(err);
      setConnectionState('failed');

      if (onError) {
        onError(err);
      }

      updateState({ error: err, connectionState: 'failed' });
    },
    [onError, updateState]
  );

  /**
   * Map VideoParticipant to Participant (for ParticipantGrid)
   */
  const mapToParticipant = useCallback(
    (vp: VideoParticipant): Participant => ({
      id: vp.id,
      name: vp.name,
      stream: vp.stream,
      isLocal: vp.isLocal,
      isMuted: vp.isMuted,
      isVideoOff: vp.isVideoOff,
      connectionQuality: vp.connectionQuality,
      isSpeaking: vp.isSpeaking,
    }),
    []
  );

  /**
   * Initialize Stream Video Service
   */
  const initializeServices = useCallback(async () => {
    console.log('[StreamVideoCallManager] Initializing Stream SDK...');

    if (isInitializedRef.current) {
      console.log('[StreamVideoCallManager] Already initialized');
      return;
    }

    isInitializedRef.current = true;

    try {
      setConnectionState('connecting');

      // 1. Join meeting (create participant record)
      console.log('[StreamVideoCallManager] Joining meeting:', meetingId);
      const joinResponse = await fetch(`/api/meetings/${meetingId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'participant' }),
      });

      if (!joinResponse.ok) {
        const errorText = await joinResponse.text();
        throw new Error(`Failed to join meeting: ${errorText}`);
      }

      const joinData = await joinResponse.json();
      console.log('[StreamVideoCallManager] Joined meeting:', joinData);

      // Store meeting UUID for realtime
      if (joinData.meeting_id) {
        setMeetingUuid(joinData.meeting_id);
      }

      // Cache user ID mapping
      if (joinData.user_id) {
        userIdToClerkIdRef.current.set(joinData.user_id, userId);
      }

      // 2. Get Stream token
      console.log('[StreamVideoCallManager] Requesting Stream token...');
      const tokenResponse = await fetch(
        `/api/meetings/${meetingId}/stream-token`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(`Failed to get Stream token: ${errorText}`);
      }

      const tokenData = await tokenResponse.json();
      console.log('[StreamVideoCallManager] Stream token received');

      // 3. Initialize Stream video service
      const videoService = VideoServiceFactory.create();
      videoServiceRef.current = videoService;

      // Setup event handlers
      videoService.on({
        onParticipantJoined: participant => {
          console.log(
            '[StreamVideoCallManager] Participant joined:',
            participant.id
          );
          setParticipants(prev => {
            if (prev.find(p => p.id === participant.id)) return prev;
            return [...prev, mapToParticipant(participant)];
          });
          onParticipantJoin?.(participant.id);
        },
        onParticipantLeft: participantId => {
          console.log(
            '[StreamVideoCallManager] Participant left:',
            participantId
          );
          setParticipants(prev => prev.filter(p => p.id !== participantId));
          onParticipantLeave?.(participantId);
        },
        onParticipantUpdate: participant => {
          console.log(
            '[StreamVideoCallManager] Participant updated:',
            participant.id
          );
          setParticipants(prev =>
            prev.map(p =>
              p.id === participant.id ? mapToParticipant(participant) : p
            )
          );
        },
        onConnectionStateChange: state => {
          console.log('[StreamVideoCallManager] Connection state:', state);
          setConnectionState(state);
        },
        onError: err => {
          console.error('[StreamVideoCallManager] Stream error:', err);
          handleError(err);
        },
      });

      // 4. Initialize and join call
      await videoService.initialize({
        meetingId,
        userId,
        userName,
        token: tokenData.token,
        audio: !isAudioEnabled, // Start muted (autoMuteOnJoin: true)
        video: isVideoEnabled,
      });

      console.log('[StreamVideoCallManager] Joining call...');
      await videoService.joinCall();

      setConnectionState('connected');
      console.log('[StreamVideoCallManager] Successfully connected!');

      // Add local participant to UI
      const localParticipant = videoService.getLocalParticipant();
      if (localParticipant) {
        setParticipants([mapToParticipant(localParticipant)]);
      }

      updateState({ connectionState: 'connected' });
    } catch (err) {
      console.error('[StreamVideoCallManager] Initialization failed:', err);
      isInitializedRef.current = false;
      handleError(err as Error);
    }
  }, [
    meetingId,
    userId,
    userName,
    isAudioEnabled,
    isVideoEnabled,
    handleError,
    updateState,
    mapToParticipant,
    onParticipantJoin,
    onParticipantLeave,
  ]);

  /**
   * Update local participant when speaking status changes
   */
  useEffect(() => {
    setParticipants(prev =>
      prev.map(p => (p.isLocal ? { ...p, isSpeaking } : p))
    );
  }, [isSpeaking]);

  /**
   * Initialize on mount
   */
  useEffect(() => {
    if (!isInitializedRef.current) {
      initializeServices();
    }
  }, [initializeServices]);

  /**
   * Handle stream error
   */
  useEffect(() => {
    if (streamError) {
      handleError(streamError);
    }
  }, [streamError, handleError]);

  /**
   * Notify parent when state changes
   */
  useEffect(() => {
    if (connectionState === 'connected' && onStateChange) {
      updateState({});
    }
  }, [
    connectionState,
    isAudioEnabled,
    isVideoEnabled,
    isPushToTalkMode,
    isPushToTalkActive,
    audioLevel,
    onStateChange,
    updateState,
  ]);

  /**
   * Subscribe to meeting realtime events
   */
  useEffect(() => {
    if (!meetingUuid) return;

    console.log('[StreamVideoCallManager] Setting up realtime subscription');

    const channel = subscribeToMeetingEvents(meetingUuid, {
      onParticipantUpdate: async (
        normalizedData: NormalizedParticipantData | null
      ) => {
        if (!normalizedData) return;

        // Get clerk_id from cache
        let clerk_id = userIdToClerkIdRef.current.get(normalizedData.user_id);

        if (!clerk_id) {
          try {
            const response = await fetch(
              `/api/users/${normalizedData.user_id}/clerk-id`
            );
            if (response.ok) {
              const data = await response.json();
              clerk_id = data.clerk_id;
              if (clerk_id) {
                userIdToClerkIdRef.current.set(
                  normalizedData.user_id,
                  clerk_id
                );
              }
            }
          } catch (error) {
            console.error(
              '[StreamVideoCallManager] Error fetching clerk_id:',
              error
            );
            return;
          }
        }

        // Update participant state
        setParticipants(prev =>
          prev.map(p =>
            p.id === clerk_id
              ? {
                  ...p,
                  isMuted: normalizedData.is_muted,
                  isVideoOff: normalizedData.is_video_off,
                }
              : p
          )
        );
      },
      onMeetingEnded: onMeetingEnded
        ? async data => {
            if (!data) return;

            console.log(
              '[StreamVideoCallManager] Meeting ended, cleaning up...'
            );

            // Leave call
            if (videoServiceRef.current) {
              await videoServiceRef.current.leaveCall();
              videoServiceRef.current.destroy();
            }

            onMeetingEnded({
              endedByHost: data.ended_by_host,
              endedAt: data.ended_at,
            });
          }
        : undefined,
    });

    return () => {
      if (channel) {
        unsubscribeChannel(channel);
      }
    };
  }, [meetingUuid, onMeetingEnded]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      console.log('[StreamVideoCallManager] Unmounting, cleaning up...');
      if (videoServiceRef.current) {
        videoServiceRef.current.leaveCall().catch(console.error);
        videoServiceRef.current.destroy();
      }
      isInitializedRef.current = false;
    };
  }, []);

  /**
   * Handle participant click
   */
  const handleParticipantClick = useCallback((participantId: string) => {
    console.log('[StreamVideoCallManager] Participant clicked:', participantId);
  }, []);

  // Show error state
  if (error) {
    return (
      <div
        className={cn(
          'flex items-center justify-center h-full bg-gray-900 rounded-lg p-6',
          className
        )}
        role="alert"
        aria-live="assertive"
      >
        <div className="text-center text-white max-w-md">
          <div className="mb-4">
            <svg
              className="w-16 h-16 mx-auto text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Connection Error</h3>
          <p className="text-gray-400 mb-4">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Show connecting state
  if (connectionState === 'connecting' || connectionState === 'disconnected') {
    return <MeetingLoadingSkeleton className={className} />;
  }

  return (
    <div
      className={cn('w-full h-full bg-gray-950', className)}
      role="main"
      aria-label="Video call"
    >
      <ParticipantGrid
        participants={participants}
        onParticipantClick={handleParticipantClick}
      />

      {/* Connection state indicator */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {connectionState === 'connected' && 'Connected to video call'}
        {connectionState === 'reconnecting' && 'Reconnecting to video call...'}
        {connectionState === 'failed' && 'Connection failed'}
      </div>
    </div>
  );
}
