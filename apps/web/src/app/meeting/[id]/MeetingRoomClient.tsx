/**
 * Meeting Room Client Component
 * Client-side meeting room with video call manager
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { VideoCallManager } from '@/components/meeting';
import type { VideoCallState } from '@/components/meeting';

interface MeetingRoomClientProps {
  meetingId: string;
  userId: string;
}

export function MeetingRoomClient({
  meetingId,
  userId,
}: MeetingRoomClientProps) {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [callState, setCallState] = useState<VideoCallState | null>(null);

  const userName = user?.fullName || user?.username || 'Unknown User';

  // Wait for Clerk to load user data before initializing video call
  if (!isLoaded) {
    return (
      <div className="h-screen w-full bg-gray-950 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4" />
          <h3 className="text-xl font-semibold">Loading user data...</h3>
        </div>
      </div>
    );
  }

  /**
   * Handle video call state changes
   */
  const handleStateChange = (state: VideoCallState) => {
    setCallState(state);
  };

  /**
   * Handle errors
   */
  const handleError = (error: Error) => {
    console.error('Meeting error:', error);
  };

  /**
   * Handle participant join
   */
  const handleParticipantJoin = (participantId: string) => {
    console.log('Participant joined:', participantId);
  };

  /**
   * Handle participant leave
   */
  const handleParticipantLeave = (participantId: string) => {
    console.log('Participant left:', participantId);
  };

  /**
   * Leave meeting
   */
  const handleLeaveMeeting = () => {
    router.push('/dashboard');
  };

  return (
    <div className="h-screen w-full bg-gray-950 flex flex-col">
      {/* Meeting header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-lg font-semibold">Meeting Room</h1>
            <p className="text-gray-400 text-sm">
              Meeting ID: {meetingId.slice(0, 8)}
            </p>
          </div>

          <button
            onClick={handleLeaveMeeting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label="Leave meeting"
          >
            Leave Meeting
          </button>
        </div>
      </div>

      {/* Video call area */}
      <div className="flex-1 overflow-hidden">
        <VideoCallManager
          meetingId={meetingId}
          userId={userId}
          userName={userName}
          onStateChange={handleStateChange}
          onError={handleError}
          onParticipantJoin={handleParticipantJoin}
          onParticipantLeave={handleParticipantLeave}
        />
      </div>

      {/* Connection status indicator */}
      {callState && (
        <div className="absolute top-20 right-6 z-50">
          {callState.connectionState === 'reconnecting' && (
            <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              <span className="text-sm font-medium">Reconnecting...</span>
            </div>
          )}

          {callState.connectionState === 'failed' && (
            <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
              <span className="text-sm font-medium">Connection Failed</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
