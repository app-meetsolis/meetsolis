/**
 * Meeting Room Client Component
 * Client-side meeting room with video call manager
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useHotkeys } from 'react-hotkeys-hook';
import { toast } from 'sonner';
import { StreamVideoWrapper } from '@/components/meeting';
import { KeyboardShortcutsHelp } from '@/components/meeting/KeyboardShortcutsHelp';
import { LeaveMeetingDialog } from '@/components/meeting/LeaveMeetingDialog';

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
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);

  // Construct full name from Clerk user object
  const userName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName || user?.username || 'Unknown User';

  /**
   * Fetch meeting data to determine if user is organizer
   */
  useEffect(() => {
    async function fetchMeetingData() {
      try {
        const res = await fetch(`/api/meetings/${meetingId}`);
        if (!res.ok) {
          console.error('Failed to fetch meeting data:', res.status);
          return;
        }

        const data = await res.json();

        // Check if current user is the organizer
        setIsOrganizer(data.meeting?.host_id === userId);

        // Get active participant count (leave_time IS NULL)
        const activeParticipants =
          data.participants?.filter((p: any) => p.leave_time === null) || [];
        setParticipantCount(activeParticipants.length);
      } catch (error) {
        console.error('Error fetching meeting data:', error);
      }
    }

    if (meetingId && userId) {
      fetchMeetingData();
    }
  }, [meetingId, userId]);

  /**
   * Handle errors
   */
  const handleError = useCallback((error: Error) => {
    console.error('Meeting error:', error);
    toast.error('Connection Error', {
      description: error.message,
      duration: 5000,
    });
  }, []);

  /**
   * Handle meeting ended
   * Called when organizer leaves or last participant leaves
   */
  const handleMeetingEnded = useCallback(
    (data: { endedByHost: boolean; endedAt: string }) => {
      console.log('[MeetingRoomClient] Meeting ended:', data);

      // Show toast notification
      toast.info('Meeting ended', {
        description: data.endedByHost
          ? 'The meeting organizer has left and ended the meeting.'
          : 'The meeting has ended.',
        duration: 5000,
      });

      // Redirect after 2 second delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    },
    [router]
  );

  /**
   * Open leave confirmation dialog
   */
  const handleLeaveMeeting = useCallback(() => {
    setIsLeaveDialogOpen(true);
  }, []);

  /**
   * Confirm leave meeting - calls API and redirects
   */
  const handleConfirmLeave = useCallback(async () => {
    setIsLeaving(true);

    try {
      const res = await fetch(`/api/meetings/${meetingId}/leave`, {
        method: 'POST',
      });

      const data = await res.json();

      if (data.success) {
        console.log('[MeetingRoomClient] Successfully left meeting:', data);

        // Show success toast
        toast.success('Left meeting', {
          description: data.meeting_ended
            ? 'Meeting has been ended'
            : 'You have left the meeting',
          duration: 3000,
        });

        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        console.error('[MeetingRoomClient] Failed to leave meeting:', data);

        toast.error('Failed to leave meeting', {
          description: data.error || 'Please try again',
          duration: 5000,
        });

        setIsLeaving(false);
        setIsLeaveDialogOpen(false);
      }
    } catch (error) {
      console.error('[MeetingRoomClient] Error leaving meeting:', error);

      toast.error('Failed to leave meeting', {
        description: 'An error occurred. Please try again.',
        duration: 5000,
      });

      setIsLeaving(false);
      setIsLeaveDialogOpen(false);
    }
  }, [meetingId, router]);

  // Register keyboard shortcut for help modal (? or Shift+/)
  useHotkeys(
    'shift+/',
    e => {
      e.preventDefault();
      setIsShortcutsOpen(true);
    },
    { enableOnFormTags: false }
  );

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
        </div>
      </div>

      {/* Video call area - with bottom padding for control bar */}
      <div className="flex-1 overflow-hidden pb-20">
        <StreamVideoWrapper
          meetingId={meetingId}
          userId={userId}
          userName={userName}
          onError={handleError}
          onLeaveMeeting={handleLeaveMeeting}
        />
      </div>

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp
        open={isShortcutsOpen}
        onOpenChange={setIsShortcutsOpen}
      />

      {/* Leave Meeting Confirmation Dialog */}
      <LeaveMeetingDialog
        open={isLeaveDialogOpen}
        onOpenChange={setIsLeaveDialogOpen}
        onConfirm={handleConfirmLeave}
        isOrganizer={isOrganizer}
        participantCount={participantCount}
        isLoading={isLeaving}
      />
    </div>
  );
}
