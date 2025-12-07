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
import {
  subscribeToMeetingEvents,
  unsubscribeChannel,
} from '@/lib/supabase/realtime';
import type { MeetingEndedPayload } from '@meetsolis/shared/types/realtime';
import { useLayoutConfig } from '@/hooks/useLayoutConfig';

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
  const [meetingUUID, setMeetingUUID] = useState<string | null>(null);

  // Layout configuration for video grid
  const { layoutConfig } = useLayoutConfig();

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

        // Store meeting UUID for real-time subscription
        if (data.meeting?.id) {
          setMeetingUUID(data.meeting.id);
        }

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
   * Called when organizer leaves or last participant leaves via real-time subscription
   */
  const handleMeetingEnded = useCallback(
    (payload: MeetingEndedPayload | null) => {
      if (!payload) {
        console.warn('[MeetingRoomClient] Invalid meeting ended payload');
        return;
      }

      console.log('[MeetingRoomClient] Meeting ended:', payload);

      // Show toast notification
      toast.info('Meeting ended', {
        description: payload.ended_by_host
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

  /**
   * Subscribe to meeting ended events
   * Listens for real-time broadcast when organizer or last participant leaves
   */
  useEffect(() => {
    // Only subscribe if we have the meeting UUID
    if (!meetingUUID) {
      return;
    }

    console.log('[MeetingRoomClient] Subscribing to meeting events:', {
      meetingUUID,
    });

    // Subscribe to meeting events (meeting ended broadcast)
    const channel = subscribeToMeetingEvents(meetingUUID, {
      onMeetingEnded: handleMeetingEnded,
    });

    // Cleanup subscription on unmount
    return () => {
      console.log('[MeetingRoomClient] Unsubscribing from meeting events');
      unsubscribeChannel(channel);
    };
  }, [meetingUUID, handleMeetingEnded]);

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
    <div className="h-screen w-full bg-gray-950 relative overflow-hidden">
      {/* Floating Meeting ID chip - top left */}
      <div className="absolute top-4 left-4 z-30 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-700/50">
        <p className="text-white text-xs font-medium">
          ID: {meetingId.slice(0, 8)}
        </p>
      </div>

      {/* Video call area - full height with bottom padding for control bar */}
      <div className="h-full pb-24">
        <StreamVideoWrapper
          meetingId={meetingId}
          userId={userId}
          userName={userName}
          layoutConfig={layoutConfig}
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
