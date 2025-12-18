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
import { X } from 'lucide-react';
import { StreamVideoWrapper } from '@/components/meeting';
import { KeyboardShortcutsHelp } from '@/components/meeting/KeyboardShortcutsHelp';
import { LeaveMeetingDialog } from '@/components/meeting/LeaveMeetingDialog';
import {
  subscribeToMeetingEvents,
  unsubscribeChannel,
} from '@/lib/supabase/realtime';
import type { MeetingEndedPayload } from '@meetsolis/shared/types/realtime';
import { useLayoutConfig } from '@/hooks/useLayoutConfig';
import { useImmersiveMode } from '@/hooks/meeting/useImmersiveMode';

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
  const [isLoadingHostStatus, setIsLoadingHostStatus] = useState(true);
  const [participantCount, setParticipantCount] = useState(0);
  const [meetingUUID, setMeetingUUID] = useState<string | null>(null);

  // Layout configuration for video grid
  const { layoutConfig, setImmersiveMode } = useLayoutConfig();

  // Immersive mode (fullscreen with auto-hiding controls)
  const { isImmersive, toggleImmersive, showControls, handleMouseMove } =
    useImmersiveMode();

  // Construct full name from Clerk user object
  const userName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName || user?.username || 'Unknown User';

  /**
   * Sync immersive mode state with layout config
   */
  useEffect(() => {
    setImmersiveMode(isImmersive);
  }, [isImmersive, setImmersiveMode]);

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
        // Use the server-provided flag (avoids timing issues with participants list)
        const isHost = data.is_current_user_host === true;
        setIsOrganizer(isHost);
        setIsLoadingHostStatus(false); // Host status determined
        console.log('[MeetingRoomClient] Host status:', {
          isHost,
          userId,
          is_current_user_host: data.is_current_user_host,
          meeting_host_id: data.meeting?.host_id,
          fullData: data,
        });

        // Get active participant count (leave_time IS NULL)
        const activeParticipants =
          data.participants?.filter((p: any) => p.leave_time === null) || [];
        setParticipantCount(activeParticipants.length);
      } catch (error) {
        console.error('Error fetching meeting data:', error);
        setIsLoadingHostStatus(false); // Stop loading even on error
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

      console.log('[MeetingRoomClient] Meeting ended event received:', {
        payload,
        isOrganizer,
        userId,
        shouldShowNotification: !isOrganizer, // Don't show to host who triggered it
      });

      // Don't show notification to the host who triggered the leave
      // (they already see a "Left meeting" toast from their own action)
      if (isOrganizer && payload.ended_by_host) {
        console.log(
          '[MeetingRoomClient] Skipping notification - user is the host who left'
        );
        return;
      }

      // Show toast notification to remaining participants
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
    [router, isOrganizer, userId]
  );

  /**
   * Handle participant count changes from Stream SDK
   */
  const handleParticipantCountChange = useCallback((count: number) => {
    console.log('[MeetingRoomClient] Participant count updated:', count);
    setParticipantCount(count);
  }, []);

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

      console.log('[MeetingRoomClient] Leave API response:', data);

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
      console.log('[MeetingRoomClient] No meetingUUID yet, waiting...');
      return;
    }

    console.log('[MeetingRoomClient] 🔌 Setting up subscription:', {
      meetingUUID,
      meetingCode: meetingId,
      userId,
      isOrganizer,
      channelName: `meeting:${meetingUUID}:participants`,
      timestamp: new Date().toISOString(),
    });

    // Subscribe to meeting events (meeting ended broadcast)
    const channel = subscribeToMeetingEvents(meetingUUID, {
      onMeetingEnded: payload => {
        console.log(
          '[MeetingRoomClient] 📩 onMeetingEnded callback triggered!',
          payload
        );
        handleMeetingEnded(payload);
      },
    });

    // Cleanup subscription on unmount
    return () => {
      console.log('[MeetingRoomClient] 🔌 Cleaning up subscription:', {
        meetingUUID,
        userId,
      });
      unsubscribeChannel(channel);
    };
  }, [meetingUUID, handleMeetingEnded, meetingId, userId, isOrganizer]);

  /**
   * Polling fallback: Check meeting status every 5 seconds
   * This ensures participants are redirected even if realtime fails
   */
  useEffect(() => {
    if (!meetingId) return;

    // Track if we've already triggered redirect to prevent multiple calls
    let hasTriggeredRedirect = false;

    const pollMeetingStatus = async () => {
      if (hasTriggeredRedirect) return;

      try {
        const res = await fetch(`/api/meetings/${meetingId}`);
        if (!res.ok) return;

        const data = await res.json();

        // If meeting ended, trigger the same handler
        if (data.meeting?.status === 'ended') {
          // Don't trigger for host who already left
          if (isOrganizer) {
            console.log(
              '[MeetingRoomClient] Polling: Skipping - user is organizer'
            );
            return;
          }

          console.log(
            '[MeetingRoomClient] 🎯 Polling detected meeting ended!',
            {
              meeting_id: data.meeting.id,
              status: data.meeting.status,
              actual_end: data.meeting.actual_end,
            }
          );

          hasTriggeredRedirect = true;
          handleMeetingEnded({
            meeting_id: data.meeting.id,
            ended_by_host: true,
            ended_at: data.meeting.actual_end || new Date().toISOString(),
            participant_count_before_leave: 0,
          });
        }
      } catch (error) {
        console.error('[MeetingRoomClient] Polling error:', error);
      }
    };

    // Poll every 5 seconds
    const interval = setInterval(pollMeetingStatus, 5000);

    // Initial poll after 2 seconds (in case we missed the broadcast)
    const initialTimeout = setTimeout(pollMeetingStatus, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, [meetingId, handleMeetingEnded, isOrganizer]);

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
    <div
      className="h-screen w-full bg-gray-950 relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Floating Meeting ID chip - top left (hidden in immersive mode) */}
      {!isImmersive && (
        <div className="absolute top-4 left-4 z-30 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-700/50">
          <p className="text-white text-xs font-medium">
            ID: {meetingId.slice(0, 8)}
          </p>
        </div>
      )}

      {/* Exit Immersive Mode Button (always visible in immersive mode) */}
      {isImmersive && (
        <button
          onClick={toggleImmersive}
          className="absolute top-4 right-4 z-50 p-2 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-lg border border-gray-700/50 transition-colors"
          title="Exit fullscreen (F or ESC)"
          aria-label="Exit fullscreen"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      )}

      {/* Video call area - full height with bottom padding for control bar (when not immersive) */}
      <div className={isImmersive ? 'h-full' : 'h-full pb-24'}>
        {isLoadingHostStatus ? (
          <div className="flex items-center justify-center h-full bg-gray-900">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
              <p>Loading meeting...</p>
            </div>
          </div>
        ) : (
          <StreamVideoWrapper
            meetingId={meetingId}
            userId={userId}
            userName={userName}
            layoutConfig={layoutConfig}
            isOrganizer={isOrganizer}
            onError={handleError}
            onLeaveMeeting={handleLeaveMeeting}
            onParticipantCountChange={handleParticipantCountChange}
          />
        )}
      </div>

      {/* Keyboard Shortcuts Help (disabled in immersive mode) */}
      {!isImmersive && (
        <KeyboardShortcutsHelp
          open={isShortcutsOpen}
          onOpenChange={setIsShortcutsOpen}
        />
      )}

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
