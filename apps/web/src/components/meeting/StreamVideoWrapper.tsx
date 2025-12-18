/**
 * StreamVideoWrapper Component
 * Wraps StreamVideoProvider and StreamVideoCallManagerV2 with token fetching
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { StreamVideoProvider } from './StreamVideoProvider';
import { StreamVideoCallManagerV2 } from './StreamVideoCallManagerV2';
import { WaitingRoomView } from './WaitingRoomView';
import type { LayoutConfig } from '@/types/layout';

export interface StreamVideoWrapperProps {
  meetingId: string;
  userId: string;
  userName: string;
  layoutConfig: LayoutConfig;
  isOrganizer?: boolean;
  meetingOrganizerId?: string;
  onParticipantClick?: (participantId: string) => void;
  onError?: (error: Error) => void;
  onLeaveMeeting?: () => void;
  onOpenSettings?: () => void;
  onOpenLayoutSettings?: () => void;
  onSpotlightParticipantChange?: (
    participantId: string | null | undefined
  ) => void;
  onParticipantCountChange?: (count: number) => void;
  className?: string;
}

/**
 * StreamVideoWrapper Component
 * Handles token fetching and provides Stream SDK context
 */
export function StreamVideoWrapper({
  meetingId,
  userId,
  userName,
  isOrganizer = false,
  onParticipantClick,
  onError,
  onLeaveMeeting,
  onOpenSettings,
  onParticipantCountChange,
  className = '',
}: StreamVideoWrapperProps) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [waitingRoomData, setWaitingRoomData] = useState<{
    waiting_room_id: string;
    meeting_id: string;
    meeting_title: string;
    user_id: string;
  } | null>(null);

  /**
   * Fetch Stream token
   */
  const fetchToken = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('[StreamVideoWrapper] Fetching Stream token...');

      // 1. Join meeting first
      // Use 'host' role if user is the organizer, otherwise 'participant'
      const role = isOrganizer ? 'host' : 'participant';
      console.log('[StreamVideoWrapper] Joining meeting with role:', role, {
        isOrganizer,
        userId,
        isOrganizerType: typeof isOrganizer,
        isOrganizerValue: isOrganizer,
      });

      const joinResponse = await fetch(`/api/meetings/${meetingId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      if (!joinResponse.ok) {
        const errorText = await joinResponse.text();
        throw new Error(`Failed to join meeting: ${errorText}`);
      }

      const joinData = await joinResponse.json();
      console.log('[StreamVideoWrapper] Joined meeting:', joinData);

      // Check if participant needs to wait in waiting room
      if (joinData.waiting_room) {
        console.log('[StreamVideoWrapper] Participant in waiting room');
        setWaitingRoomData({
          waiting_room_id: joinData.waiting_room_id,
          meeting_id: joinData.meeting_id,
          meeting_title: joinData.meeting_title,
          user_id: joinData.user_id,
        });
        setIsLoading(false);
        return; // Don't fetch token, show waiting room instead
      }

      // 2. Get Stream token
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
      console.log('[StreamVideoWrapper] Stream token received');

      setToken(tokenData.token);
      setIsLoading(false);
    } catch (err) {
      console.error('[StreamVideoWrapper] Token fetch failed:', err);
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setIsLoading(false);
      onError?.(error);
    }
  }, [meetingId, userId, isOrganizer, onError]);

  /**
   * Fetch token on mount
   */
  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  /**
   * Show waiting room if participant needs to wait for admission
   */
  if (waitingRoomData) {
    return (
      <WaitingRoomView
        meetingId={waitingRoomData.meeting_id}
        meetingTitle={waitingRoomData.meeting_title}
        currentUserId={waitingRoomData.user_id}
        onAdmitted={() => {
          // When admitted, clear waiting room data and refetch token
          setWaitingRoomData(null);
          fetchToken();
        }}
      />
    );
  }

  /**
   * Show loading state
   */
  if (isLoading || !token) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 rounded-lg">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
          <p>Connecting to video call...</p>
        </div>
      </div>
    );
  }

  /**
   * Show error state
   */
  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 rounded-lg p-6">
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

  return (
    <StreamVideoProvider
      meetingId={meetingId}
      userId={userId}
      userName={userName}
      token={token}
      onError={onError}
    >
      <StreamVideoCallManagerV2
        meetingId={meetingId}
        userId={userId}
        className={className}
        onParticipantClick={onParticipantClick}
        onLeaveMeeting={onLeaveMeeting}
        onOpenSettings={onOpenSettings}
        onParticipantCountChange={onParticipantCountChange}
      />
    </StreamVideoProvider>
  );
}
