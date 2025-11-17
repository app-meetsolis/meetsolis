/**
 * VideoCallManager Component
 * Main container for managing WebRTC video call with signaling and state management
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ParticipantGrid, type Participant } from './ParticipantGrid';
import { WebRTCService } from '@/services/webrtc/WebRTCService';
import { SignalingService } from '@/services/webrtc/SignalingService';
import { useMediaStream } from '@/hooks/useMediaStream';
import { cn } from '@/lib/utils';
import type {
  ConnectionQuality,
  ConnectionState,
} from '../../../../../packages/shared/types/webrtc';

export interface VideoCallManagerProps {
  meetingId: string;
  userId: string;
  userName: string;
  onStateChange?: (state: VideoCallState) => void;
  onError?: (error: Error) => void;
  onParticipantJoin?: (participantId: string) => void;
  onParticipantLeave?: (participantId: string) => void;
  className?: string;
}

export interface VideoCallState {
  connectionState: ConnectionState;
  participants: Participant[];
  error: Error | null;
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
  className = '',
}: VideoCallManagerProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>('connecting');
  const [error, setError] = useState<Error | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(
    new Map()
  );

  const webrtcServiceRef = useRef<WebRTCService | null>(null);
  const signalingServiceRef = useRef<SignalingService | null>(null);
  const isInitializedRef = useRef(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const participantNamesRef = useRef<Map<string, string>>(new Map());

  // Get local media stream
  const {
    stream: localStream,
    isAudioEnabled,
    isVideoEnabled,
    error: streamError,
  } = useMediaStream({
    videoQuality: 'hd',
    audioQuality: 'standard',
  });

  /**
   * Update video call state and notify parent
   */
  const updateState = useCallback(
    (newState: Partial<VideoCallState>) => {
      const state: VideoCallState = {
        connectionState,
        participants,
        error,
        ...newState,
      };

      if (onStateChange) {
        onStateChange(state);
      }
    },
    [connectionState, participants, error, onStateChange]
  );

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

      // Initialize WebRTC service
      const webrtcService = new WebRTCService();
      webrtcServiceRef.current = webrtcService;

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
              await signalingServiceRef.current?.sendAnswer(signal);
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
            '[VideoCallManager] Participant joined:',
            participantId,
            'Name:',
            participantName
          );

          // Store participant name
          participantNamesRef.current.set(participantId, participantName);

          if (participantId !== userId) {
            // Deterministic initiator selection: only lower userId initiates
            // This prevents both users from trying to create offers simultaneously
            const shouldInitiate = userId < participantId;

            if (shouldInitiate) {
              console.log(
                '[VideoCallManager] Initiating connection to:',
                participantId
              );

              // Use ref to avoid stale closure
              if (!webrtcServiceRef.current || !signalingServiceRef.current) {
                console.warn(
                  '[VideoCallManager] Services not initialized, cannot create peer connection'
                );
                return;
              }

              // CRITICAL: Verify local stream exists before creating peer connection
              const currentStream = webrtcServiceRef.current.getLocalStream();
              console.log(
                '[VideoCallManager] Local stream state before peer connection:',
                {
                  hasStream: !!currentStream,
                  streamId: currentStream?.id,
                  audioTracks: currentStream?.getAudioTracks().length ?? 0,
                  videoTracks: currentStream?.getVideoTracks().length ?? 0,
                }
              );

              if (!currentStream) {
                console.error(
                  '[VideoCallManager] Cannot create peer connection: local stream is null!'
                );
                console.error(
                  '[VideoCallManager] This should not happen - stream was set during initialization'
                );
                console.error(
                  '[VideoCallManager] Possible causes: stream was cleared, initialization failed, or timing issue'
                );
                return;
              }

              // Create peer connection for new participant
              await webrtcServiceRef.current.createPeerConnection(
                participantId,
                async signal => {
                  console.log(
                    '[VideoCallManager] SimplePeer emitted signal (offer):',
                    {
                      to: participantId,
                      signalType: signal.type || 'offer',
                    }
                  );
                  await signalingServiceRef.current?.sendOffer(signal);
                  console.log(
                    '[VideoCallManager] Offer sent to:',
                    participantId
                  );
                }
              );
            } else {
              console.log(
                '[VideoCallManager] Waiting for offer from:',
                participantId
              );
            }

            if (onParticipantJoin) {
              onParticipantJoin(participantId);
            }
          }
        },
        onParticipantLeft: participantId => {
          console.log('[VideoCallManager] Participant left:', participantId);

          // Remove participant name from ref
          participantNamesRef.current.delete(participantId);

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

          // Update remote streams
          setRemoteStreams(new Map(state.remoteStreams));

          // Update participants with remote streams
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
                return [
                  ...prev,
                  {
                    id: participantId,
                    name: participantName,
                    stream,
                    isLocal: false,
                    isMuted: false,
                    isVideoOff: stream.getVideoTracks().length === 0,
                    connectionQuality: 'good',
                  },
                ];
              }
              return prev;
            });
          });

          // Update connection quality
          setParticipants(prev =>
            prev.map(p => ({
              ...p,
              connectionQuality: state.connectionQuality,
            }))
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
   * Update local participant state when audio/video toggles
   */
  useEffect(() => {
    setParticipants(prev =>
      prev.map(p =>
        p.isLocal
          ? {
              ...p,
              isMuted: !isAudioEnabled,
              isVideoOff: !isVideoEnabled,
            }
          : p
      )
    );
  }, [isAudioEnabled, isVideoEnabled]);

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

  // Show connecting state
  if (connectionState === 'connecting') {
    return (
      <div
        className={cn(
          'flex items-center justify-center h-full bg-gray-900 rounded-lg',
          className
        )}
        role="status"
        aria-live="polite"
      >
        <div className="text-center text-white">
          <div
            className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"
            aria-hidden="true"
          />
          <h3 className="text-xl font-semibold">Connecting to meeting...</h3>
        </div>
      </div>
    );
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
