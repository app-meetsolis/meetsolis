/**
 * VideoCallManager Component
 * Main container for managing WebRTC video call with signaling and state management
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ParticipantGrid, type Participant } from './ParticipantGrid';
import { MeetingLoadingSkeleton } from './MeetingLoadingSkeleton';
import { WebRTCService } from '@/services/webrtc/WebRTCService';
import { SignalingService } from '@/services/webrtc/SignalingService';
import { useMediaStream } from '@/hooks/useMediaStream';
import { useParticipantState } from '@/hooks/meeting/useParticipantState';
import { usePushToTalk } from '@/hooks/meeting/usePushToTalk';
import { useAudioControls } from '@/hooks/meeting/useAudioControls';
import {
  subscribeToMeetingEvents,
  unsubscribeChannel,
} from '@/lib/supabase/realtime';
import { cn } from '@/lib/utils';
import type {
  ConnectionQuality,
  ConnectionState,
} from '../../../../../packages/shared/types/webrtc';
import type { NormalizedParticipantData } from '../../../../../packages/shared/types/realtime';

export interface VideoCallManagerProps {
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
 * VideoCallManager Component
 */
export function VideoCallManager({
  meetingId,
  userId,
  userName,
  onStateChange,
  onError,
  onParticipantJoin,
  onParticipantLeave,
  onToggleAudio,
  onToggleVideo,
  onMeetingEnded,
  className = '',
}: VideoCallManagerProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>('connecting');
  const [error, setError] = useState<Error | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(
    new Map()
  );
  // Store meeting UUID (meetingId prop is meeting_code, need UUID for realtime)
  const [meetingUuid, setMeetingUuid] = useState<string | null>(null);

  const webrtcServiceRef = useRef<WebRTCService | null>(null);
  const signalingServiceRef = useRef<SignalingService | null>(null);
  const isInitializedRef = useRef(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const participantNamesRef = useRef<Map<string, string>>(new Map());
  const participantsChannelRef = useRef<any>(null);
  // Cache for mapping user_id (UUID) to clerk_id for fast realtime lookups
  const userIdToClerkIdRef = useRef<Map<string, string>>(new Map());
  // Sequential join queue to prevent race conditions
  const participantJoinQueueRef = useRef<Array<{ id: string; name: string }>>(
    []
  );
  const isProcessingJoinRef = useRef(false);
  // Track processed participants to prevent duplicate presence events
  const processedParticipantsRef = useRef<Set<string>>(new Set());

  // Get local media stream
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

  // Audio controls for speaking detection and audio level monitoring
  const { isSpeaking, audioLevel } = useAudioControls({
    stream: localStream,
    enableNoiseSupression: true,
    playAudioFeedback: false, // We don't need beep feedback (handled separately)
  });

  // Hook for updating participant state in database
  const { updateMyState } = useParticipantState({ meetingId });

  // Ref to store PTT toggle function (will be set after PTT hook initializes)
  const togglePushToTalkModeRef = useRef<(() => void) | null>(null);
  const isPushToTalkModeRef = useRef(false);

  /**
   * Toggle audio with database sync
   * Auto-disables PTT mode if enabled
   */
  const toggleAudio = useCallback(() => {
    // If PTT mode is enabled, disable it first (deferred to avoid state conflict)
    if (isPushToTalkModeRef.current && togglePushToTalkModeRef.current) {
      // Use setTimeout to defer PTT toggle to next event loop tick
      // This avoids state conflicts when toggling audio and PTT simultaneously
      setTimeout(() => {
        if (togglePushToTalkModeRef.current) {
          togglePushToTalkModeRef.current();
        }
      }, 0);
    }

    toggleAudioLocal();
    const newMutedState = isAudioEnabled; // Will be opposite after toggle
    updateMyState({ is_muted: newMutedState });
  }, [toggleAudioLocal, isAudioEnabled, updateMyState]);

  // Create stable callback references using useRef to avoid hook re-initialization
  const isAudioEnabledRef = useRef(isAudioEnabled);
  const toggleAudioLocalRef = useRef(toggleAudioLocal);
  const updateMyStateRef = useRef(updateMyState);

  // Update refs when values change
  isAudioEnabledRef.current = isAudioEnabled;
  toggleAudioLocalRef.current = toggleAudioLocal;
  updateMyStateRef.current = updateMyState;

  // Create stable callbacks that won't change reference
  const stablePushStart = useCallback(() => {
    // Only unmute if currently muted
    if (!isAudioEnabledRef.current) {
      toggleAudioLocalRef.current();
    }
  }, []); // Empty deps - never changes

  const stablePushEnd = useCallback(() => {
    // Re-mute when Space is released (only if audio is on)
    if (isAudioEnabledRef.current) {
      toggleAudioLocalRef.current();
    }
  }, []); // Empty deps - never changes

  const stableToggleMode = useCallback((enabled: boolean) => {
    // When enabling PTT mode, ensure user is muted
    if (enabled && isAudioEnabledRef.current) {
      toggleAudioLocalRef.current();
      updateMyStateRef.current({ is_muted: true });
    }
  }, []); // Empty deps - never changes

  // Push-to-Talk hook integration (hook manages its own state)
  const { isPushToTalkMode, isPushToTalkActive, togglePushToTalkMode } =
    usePushToTalk({
      enabled: false, // Start disabled
      onPushStart: stablePushStart,
      onPushEnd: stablePushEnd,
      onToggleMode: stableToggleMode,
    });

  // Update PTT refs so toggleAudio can access them
  isPushToTalkModeRef.current = isPushToTalkMode;
  togglePushToTalkModeRef.current = togglePushToTalkMode;

  /**
   * Toggle video with database sync
   */
  const toggleVideo = useCallback(() => {
    toggleVideoLocal();
    const newVideoOffState = isVideoEnabled; // Will be opposite after toggle
    updateMyState({ is_video_off: newVideoOffState });
  }, [toggleVideoLocal, isVideoEnabled, updateMyState]);

  /**
   * Update video call state and notify parent
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
      onStateChange,
      toggleAudio,
      toggleVideo,
      isAudioEnabled,
      isVideoEnabled,
      localStream,
      isPushToTalkMode,
      isPushToTalkActive,
      togglePushToTalkMode,
      audioLevel,
    ]
  );

  // Notify parent when state changes (audio, video, PTT, or audio level)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (connectionState === 'connected' && onStateChange) {
      updateState({}); // Trigger state update with current values
    }
    // Intentionally excluding updateState, toggleAudio, toggleVideo, togglePushToTalkMode
    // from deps to avoid infinite loop - updateState already has all current values
  }, [
    connectionState,
    isAudioEnabled,
    isVideoEnabled,
    isPushToTalkMode,
    isPushToTalkActive,
    audioLevel,
    onStateChange,
  ]);

  /**
   * Handle errors
   */
  const handleError = useCallback(
    (err: Error) => {
      console.error('VideoCallManager error:', err);
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
   * Initialize WebRTC and signaling services
   */
  const initializeServices = useCallback(async () => {
    console.log('[VideoCallManager] initializeServices called:', {
      isInitialized: isInitializedRef.current,
      hasLocalStream: !!localStream,
      localStreamId: localStream?.id,
    });

    if (isInitializedRef.current || !localStream) {
      console.log('[VideoCallManager] Skipping initialization:', {
        reason: isInitializedRef.current
          ? 'already initialized'
          : 'no local stream',
      });
      return;
    }

    // Set initialized flag immediately to prevent race conditions
    isInitializedRef.current = true;
    console.log('[VideoCallManager] Starting initialization...');

    try {
      setConnectionState('connecting');

      // Join the meeting and create participant record in database
      try {
        console.log('[VideoCallManager] Joining meeting:', meetingId);
        console.log(
          '[VideoCallManager] Join URL:',
          `/api/meetings/${meetingId}/join`
        );

        const joinResponse = await fetch(`/api/meetings/${meetingId}/join`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role: 'participant', // Default role, host will be set separately
          }),
        });

        console.log(
          '[VideoCallManager] Join response status:',
          joinResponse.status
        );

        if (!joinResponse.ok) {
          const errorText = await joinResponse.text();
          console.error('[VideoCallManager] Join error response:', errorText);

          let errorMessage = 'Failed to join meeting';
          try {
            const errorData = JSON.parse(errorText);
            errorMessage =
              errorData.error?.message || errorData.error || errorMessage;
          } catch (e) {
            errorMessage = errorText || errorMessage;
          }

          throw new Error(errorMessage);
        }

        const joinData = await joinResponse.json();
        console.log(
          '[VideoCallManager] Successfully joined meeting:',
          joinData
        );

        // Store meeting UUID for realtime subscription (meetingId prop is meeting_code)
        if (joinData.meeting_id) {
          setMeetingUuid(joinData.meeting_id);
        }

        // Cache the user_id → clerk_id mapping for fast realtime lookups
        if (joinData.user_id) {
          userIdToClerkIdRef.current.set(joinData.user_id, userId);
        }
      } catch (joinError) {
        console.error('[VideoCallManager] Failed to join meeting:', joinError);
        console.error('[VideoCallManager] Error details:', {
          message: (joinError as Error).message,
          stack: (joinError as Error).stack,
        });
        isInitializedRef.current = false; // Reset flag to allow retry
        handleError(
          new Error(`Failed to join meeting: ${(joinError as Error).message}`)
        );
        return;
      }

      // Initialize WebRTC service
      const webrtcService = new WebRTCService();
      webrtcServiceRef.current = webrtcService;

      // Set local user ID for Perfect Negotiation
      webrtcService.setLocalUserId(userId);

      // Set the local stream from useMediaStream hook
      console.log('[VideoCallManager] Setting local stream:', {
        hasStream: !!localStream,
        streamId: localStream?.id,
        audioTracks: localStream?.getAudioTracks().length,
        videoTracks: localStream?.getVideoTracks().length,
      });
      webrtcService.setLocalStream(localStream);

      // Verify stream was set correctly
      const verifyStream = webrtcService.getLocalStream();
      console.log('[VideoCallManager] Verified local stream in service:', {
        hasStream: !!verifyStream,
        streamId: verifyStream?.id,
      });

      // Register stream callback BEFORE accepting any offers
      webrtcService.onStream((userId, stream) => {
        console.log(
          `[VideoCallManager] Remote stream received from ${userId}`,
          {
            streamId: stream.id,
            audioTracks: stream.getAudioTracks().length,
            videoTracks: stream.getVideoTracks().length,
          }
        );

        // Update remoteStreams Map (for cleanup tracking)
        setRemoteStreams(prev => {
          const newStreams = new Map(prev);
          newStreams.set(userId, stream);
          console.log(
            `[VideoCallManager] Updated remote streams. Total: ${newStreams.size}`
          );
          return newStreams;
        });

        // ✅ CRITICAL FIX: Update participant's stream in participants array
        setParticipants(prev => {
          const updated = prev.map(p =>
            p.id === userId ? { ...p, stream } : p
          );

          const participant = prev.find(p => p.id === userId);
          if (participant) {
            console.log(
              `[VideoCallManager] Updated stream for participant: ${userId}`
            );
          } else {
            console.warn(
              `[VideoCallManager] Participant ${userId} not found in array - will be added by polling`
            );
          }

          return updated;
        });
      });

      console.log('[VideoCallManager] onStream callback registered');

      // Initialize signaling service
      const signalingService = new SignalingService();
      signalingServiceRef.current = signalingService;

      // Connect to signaling channel
      await signalingService.connect(meetingId, userId, userName, {
        onOffer: async (sdp, fromUserId) => {
          console.log('[VideoCallManager] Received offer from:', fromUserId);

          // Use ref to avoid stale closure
          if (!webrtcServiceRef.current || !signalingServiceRef.current) {
            console.warn(
              '[VideoCallManager] Services not initialized, cannot handle offer'
            );
            return;
          }

          // CRITICAL: Verify local stream exists before accepting peer connection
          const currentStream = webrtcServiceRef.current.getLocalStream();
          console.log(
            '[VideoCallManager] Local stream state before accepting offer:',
            {
              hasStream: !!currentStream,
              streamId: currentStream?.id,
              audioTracks: currentStream?.getAudioTracks().length ?? 0,
              videoTracks: currentStream?.getVideoTracks().length ?? 0,
            }
          );

          if (!currentStream) {
            console.error(
              '[VideoCallManager] Cannot accept offer: local stream is null!'
            );
            console.error(
              '[VideoCallManager] Stream was set during initialization but is now missing'
            );
            console.error(
              '[VideoCallManager] Possible cause: cleanup() was called or React StrictMode effect'
            );
            console.error(
              '[VideoCallManager] Need to re-initialize or set stream again'
            );
            return;
          }

          // Handle incoming offer and create answer
          console.log(
            '[VideoCallManager] Processing offer, creating answer...'
          );
          await webrtcServiceRef.current.handleOffer(
            sdp,
            fromUserId,
            async signal => {
              console.log(
                '[VideoCallManager] SimplePeer emitted signal (answer):',
                {
                  to: fromUserId,
                  signalType: signal.type || 'answer',
                }
              );
              await signalingServiceRef.current?.sendAnswer(
                signal as RTCSessionDescriptionInit
              );
              console.log('[VideoCallManager] Answer sent to:', fromUserId);
            }
          );
        },
        onAnswer: async (sdp, fromUserId) => {
          console.log('[VideoCallManager] Received answer from:', fromUserId);
          // Use ref to avoid stale closure
          if (!webrtcServiceRef.current) {
            console.warn(
              '[VideoCallManager] Service not initialized, cannot handle answer'
            );
            return;
          }

          console.log('[VideoCallManager] Processing answer from:', fromUserId);
          await webrtcServiceRef.current.handleAnswer(sdp, fromUserId);
          console.log('[VideoCallManager] Answer processed successfully');
        },
        onIceCandidate: async (candidate, fromUserId) => {
          console.log(
            '[VideoCallManager] Received ICE candidate from:',
            fromUserId
          );
          // Use ref to avoid stale closure
          if (!webrtcServiceRef.current) {
            console.warn(
              '[VideoCallManager] Service not initialized, cannot handle ICE candidate'
            );
            return;
          }

          await webrtcServiceRef.current.handleIceCandidate(
            candidate,
            fromUserId
          );
          console.log('[VideoCallManager] ICE candidate processed');
        },
        onParticipantJoined: async (participantId, participantName) => {
          console.log(
            '[VideoCallManager] Participant joined event received:',
            participantId
          );

          // Check if we've already processed this participant
          if (processedParticipantsRef.current.has(participantId)) {
            console.log(
              '[VideoCallManager] Participant already processed, ignoring duplicate event:',
              participantId
            );
            return;
          }

          // Mark as processed immediately to prevent duplicates
          processedParticipantsRef.current.add(participantId);

          // Queue the join event
          participantJoinQueueRef.current.push({
            id: participantId,
            name: participantName,
          });

          // If already processing, let that process handle it
          if (isProcessingJoinRef.current) {
            console.log(
              '[VideoCallManager] Join already in progress, queued:',
              participantId
            );
            return;
          }

          // Process queue sequentially
          isProcessingJoinRef.current = true;

          // ✅ FIX: Process all queued participants in parallel (not sequentially)
          // This allows the 3rd participant to create 2 peer connections simultaneously
          const connectionsToCreate = [...participantJoinQueueRef.current];
          participantJoinQueueRef.current = []; // Clear queue immediately

          console.log(
            `[VideoCallManager] Creating ${connectionsToCreate.length} peer connections in parallel`
          );

          // Create all peer connections in parallel (no await!)
          connectionsToCreate.forEach(participant => {
            const { id, name } = participant;

            console.log('[VideoCallManager] Processing join from queue:', {
              id: id.substring(0, 12),
              name,
              totalConnections: connectionsToCreate.length,
            });

            // Store participant name
            participantNamesRef.current.set(id, name);

            if (id !== userId) {
              // Check if peer already exists
              const existingConnection =
                webrtcServiceRef.current?.getConnectionState(id);
              if (existingConnection) {
                console.log(
                  '[VideoCallManager] Skipping - peer already exists:',
                  id.substring(0, 12),
                  'State:',
                  existingConnection
                );
                return; // Skip this participant (use return in forEach, not continue)
              }

              // Deterministic initiator selection (use localeCompare for consistent string comparison)
              const shouldInitiate = userId.localeCompare(id) < 0;

              console.log('[VideoCallManager] Processing join decision:', {
                participantId: id.substring(0, 12),
                shouldInitiate,
              });

              if (shouldInitiate) {
                // Use ref to avoid stale closure
                if (!webrtcServiceRef.current || !signalingServiceRef.current) {
                  console.warn('[VideoCallManager] Services not initialized');
                  return;
                }

                // Verify local stream exists
                const currentStream = webrtcServiceRef.current.getLocalStream();
                if (!currentStream) {
                  console.error(
                    '[VideoCallManager] Cannot create peer - no local stream'
                  );
                  return;
                }

                console.log(
                  '[VideoCallManager] Initiating connection for:',
                  id.substring(0, 12)
                );

                // ✅ Don't await - let all connections start simultaneously
                webrtcServiceRef.current
                  .createPeerConnection(id, async signal => {
                    console.log(
                      '[VideoCallManager] Sending offer to:',
                      id.substring(0, 12)
                    );
                    try {
                      await signalingServiceRef.current?.sendOffer(
                        signal as RTCSessionDescriptionInit
                      );
                      console.log(
                        '[VideoCallManager] Offer sent to:',
                        id.substring(0, 12)
                      );
                    } catch (error) {
                      console.error(
                        `[VideoCallManager] Failed to send offer to ${id.substring(0, 12)}:`,
                        error
                      );
                    }
                  })
                  .then(() => {
                    console.log(
                      `[VideoCallManager] Peer connection established for ${id.substring(0, 12)}`
                    );
                  })
                  .catch(error => {
                    console.error(
                      `[VideoCallManager] Failed to create peer for ${id.substring(0, 12)}:`,
                      error
                    );
                  });
              } else {
                console.log(
                  '[VideoCallManager] Waiting for offer from:',
                  id.substring(0, 12)
                );
              }

              if (onParticipantJoin) {
                onParticipantJoin(id);
              }
            }
          });

          isProcessingJoinRef.current = false;
          console.log('[VideoCallManager] Join queue processing complete');
        },
        onParticipantLeft: participantId => {
          console.log('[VideoCallManager] Participant left:', participantId);

          // Remove participant name from ref
          participantNamesRef.current.delete(participantId);

          // Remove from processed set so they can rejoin
          processedParticipantsRef.current.delete(participantId);

          // Remove participant
          setParticipants(prev => prev.filter(p => p.id !== participantId));
          setRemoteStreams(prev => {
            const newStreams = new Map(prev);
            newStreams.delete(participantId);
            return newStreams;
          });

          // Use ref to avoid stale closure
          if (webrtcServiceRef.current) {
            webrtcServiceRef.current.removePeerConnection(participantId);
          }

          if (onParticipantLeave) {
            onParticipantLeave(participantId);
          }
        },
      });

      // Add local participant
      setParticipants([
        {
          id: userId,
          name: userName,
          stream: localStream,
          isLocal: true,
          isMuted: !isAudioEnabled,
          isVideoOff: !isVideoEnabled,
          connectionQuality: 'excellent',
          isSpeaking: false, // Will be updated by useAudioControls
        },
      ]);

      // Set up polling interval for remote streams AFTER WebRTC service is initialized
      console.log(
        '[VideoCallManager] Setting up remote stream polling interval'
      );
      pollingIntervalRef.current = setInterval(() => {
        if (webrtcServiceRef.current) {
          const state = webrtcServiceRef.current.getState();
          console.log('[VideoCallManager] Polling for remote streams:', {
            remoteStreamCount: state.remoteStreams.size,
            remoteStreamIds: Array.from(state.remoteStreams.keys()),
          });

          // ✅ REMOVED: setRemoteStreams() - onStream callback handles this synchronously

          // Update participants with remote streams (backup mechanism)
          state.remoteStreams.forEach((stream, participantId) => {
            console.log(
              '[VideoCallManager] Processing remote stream for participant:',
              participantId
            );
            setParticipants(prev => {
              const exists = prev.find(p => p.id === participantId);
              console.log(
                '[VideoCallManager] Participant exists?',
                exists ? 'yes' : 'no',
                'Current participant count:',
                prev.length
              );

              if (!exists) {
                // Get participant name from ref (stored when they joined)
                const participantName =
                  participantNamesRef.current.get(participantId) ||
                  `User ${participantId.slice(0, 8)}`;

                console.log(
                  '[VideoCallManager] Adding NEW remote participant:',
                  {
                    id: participantId,
                    name: participantName,
                    streamId: stream.id,
                    audioTracks: stream.getAudioTracks().length,
                    videoTracks: stream.getVideoTracks().length,
                  }
                );

                // Add new remote participant
                // Initial state will be updated via Supabase real-time subscription
                return [
                  ...prev,
                  {
                    id: participantId,
                    name: participantName,
                    stream,
                    isLocal: false,
                    isMuted: false, // Will be updated by real-time subscription
                    isVideoOff: false, // Will be updated by real-time subscription
                    connectionQuality: 'good',
                  },
                ];
              } else {
                // ✅ BACKUP FIX: Update existing participant if stream changed
                return prev.map(p =>
                  p.id === participantId && p.stream !== stream
                    ? { ...p, stream }
                    : p
                );
              }
            });
          });

          // Update connection quality (per-participant)
          setParticipants(prev =>
            prev.map(p => {
              if (p.isLocal) {
                return { ...p, connectionQuality: 'excellent' };
              }
              const quality =
                webrtcServiceRef.current?.getConnectionQuality(p.id) || 'good';
              return { ...p, connectionQuality: quality };
            })
          );
        }
      }, 1000); // Check every second

      setConnectionState('connected');
      console.log(
        '[VideoCallManager] Initialization complete! Ready for peer connections.'
      );

      updateState({
        connectionState: 'connected',
        participants: [
          {
            id: userId,
            name: userName,
            stream: localStream,
            isLocal: true,
            isMuted: !isAudioEnabled,
            isVideoOff: !isVideoEnabled,
            connectionQuality: 'excellent',
            isSpeaking: false, // Will be updated by useAudioControls
          },
        ],
      });
    } catch (err) {
      // Reset initialized flag on error to allow retry
      isInitializedRef.current = false;
      handleError(err as Error);
    }
  }, [
    localStream,
    meetingId,
    userId,
    userName,
    isAudioEnabled,
    isVideoEnabled,
    handleError,
    updateState,
    onParticipantJoin,
    onParticipantLeave,
  ]);

  /**
   * Update local participant state when audio/video toggles or speaking status changes
   */
  useEffect(() => {
    setParticipants(prev =>
      prev.map(p =>
        p.isLocal
          ? {
              ...p,
              isMuted: !isAudioEnabled,
              isVideoOff: !isVideoEnabled,
              isSpeaking,
            }
          : p
      )
    );
  }, [isAudioEnabled, isVideoEnabled, isSpeaking]);

  /**
   * Initialize on mount
   */
  useEffect(() => {
    if (localStream && !isInitializedRef.current) {
      initializeServices();
    }
  }, [localStream, initializeServices]);

  /**
   * Handle stream error
   */
  useEffect(() => {
    if (streamError) {
      handleError(streamError);
    }
  }, [streamError, handleError]);

  /**
   * UNIFIED SUBSCRIPTION: Subscribe to all meeting realtime events
   *
   * This single subscription handles:
   * 1. Participant state changes (mic/video toggle) - dual-event pattern (broadcast + postgres_changes)
   * 2. Meeting ended events (organizer leaves or last participant leaves)
   *
   * CRITICAL FIX: Using a single channel prevents duplicate subscriptions that cause race conditions
   * and interference with WebRTC signaling.
   */
  useEffect(() => {
    // Wait for meeting UUID to be available before subscribing
    if (!meetingUuid) {
      return;
    }

    console.log('[VideoCallManager] Setting up unified meeting subscription');

    const channel = subscribeToMeetingEvents(meetingUuid, {
      // Callback for participant state updates
      onParticipantUpdate: async (
        normalizedData: NormalizedParticipantData | null
      ) => {
        // Null check - skip if normalization failed
        if (!normalizedData) {
          console.warn(
            '[VideoCallManager] Received null normalized data, skipping'
          );
          return;
        }

        console.log('[VideoCallManager] Processing participant state update:', {
          source: normalizedData.eventSource,
          user_id: normalizedData.user_id.substring(0, 8) + '...',
          is_muted: normalizedData.is_muted,
          is_video_off: normalizedData.is_video_off,
        });

        // Try to get clerk_id from cache first (fast lookup)
        let clerk_id = userIdToClerkIdRef.current.get(normalizedData.user_id);

        // If not in cache, fetch from API and cache it (fallback)
        if (!clerk_id) {
          try {
            const response = await fetch(
              `/api/users/${normalizedData.user_id}/clerk-id`
            );
            if (!response.ok) {
              console.error(
                '[VideoCallManager] Failed to fetch clerk_id for user:',
                normalizedData.user_id
              );
              return;
            }

            const data = await response.json();
            clerk_id = data.clerk_id;

            // Cache it for future updates (only if clerk_id is defined)
            if (clerk_id) {
              userIdToClerkIdRef.current.set(normalizedData.user_id, clerk_id);
            }
          } catch (error) {
            console.error('[VideoCallManager] Error fetching clerk_id:', error);
            return;
          }
        }

        // Update participant state in local participants array
        setParticipants(prev =>
          prev.map(p => {
            if (p.id === clerk_id) {
              console.log('[VideoCallManager] Applying state update:', {
                clerk_id: clerk_id.substring(0, 8) + '...',
                old_muted: p.isMuted,
                new_muted: normalizedData.is_muted,
                old_video_off: p.isVideoOff,
                new_video_off: normalizedData.is_video_off,
              });

              return {
                ...p,
                isMuted: normalizedData.is_muted,
                isVideoOff: normalizedData.is_video_off,
              };
            }
            return p;
          })
        );
      },

      // Callback for meeting ended events
      onMeetingEnded: onMeetingEnded
        ? async data => {
            if (!data) {
              return;
            }

            console.log('[VideoCallManager] Meeting ended, cleaning up...', {
              endedByHost: data.ended_by_host,
              endedAt: data.ended_at,
            });

            // Cleanup WebRTC connections
            if (webrtcServiceRef.current) {
              console.log('[VideoCallManager] Cleaning up WebRTC service');
              webrtcServiceRef.current.cleanup();
            }

            // Cleanup signaling service
            if (signalingServiceRef.current) {
              console.log('[VideoCallManager] Disconnecting signaling service');
              signalingServiceRef.current.disconnect();
            }

            // Clear polling interval
            if (pollingIntervalRef.current) {
              console.log('[VideoCallManager] Clearing polling interval');
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }

            // Notify parent component
            onMeetingEnded({
              endedByHost: data.ended_by_host,
              endedAt: data.ended_at,
            });
          }
        : undefined,
    });

    participantsChannelRef.current = channel;

    return () => {
      if (participantsChannelRef.current) {
        unsubscribeChannel(participantsChannelRef.current);
        participantsChannelRef.current = null;
      }
    };
  }, [meetingUuid, onMeetingEnded]); // Re-subscribe when meeting UUID or callback changes

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      console.log('[VideoCallManager] Component unmounting, cleaning up...');

      // Clear polling interval
      if (pollingIntervalRef.current) {
        console.log('[VideoCallManager] Clearing polling interval');
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }

      // Cleanup WebRTC service
      if (webrtcServiceRef.current) {
        webrtcServiceRef.current.cleanup();
      }

      // Disconnect signaling service
      if (signalingServiceRef.current) {
        signalingServiceRef.current.disconnect();
      }

      isInitializedRef.current = false;
    };
  }, []);

  /**
   * Handle participant click
   */
  const handleParticipantClick = useCallback((participantId: string) => {
    console.log('Participant clicked:', participantId);
    // Could be used for spotlight view or other interactions
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

  // Show connecting state with skeleton UI
  if (connectionState === 'connecting') {
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

      {/* Connection state indicator (for screen readers) */}
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
