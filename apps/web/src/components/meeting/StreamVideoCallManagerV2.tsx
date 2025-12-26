/**
 * StreamVideoCallManagerV2 Component
 * Simplified video call manager using Stream SDK's native React hooks
 *
 * This version uses Stream's built-in hooks and components for proper integration.
 */

'use client';

import React, { useEffect, useCallback, useState } from 'react';
import {
  useCallStateHooks,
  useCall,
  CallingState,
} from '@stream-io/video-react-sdk';
import type { StreamVideoParticipant } from '@stream-io/video-react-sdk';
import { createClient } from '@supabase/supabase-js';
import { config } from '@/lib/config/env';
import { SpeakerView } from './SpeakerView';
import { GalleryView } from './GalleryView';
import { TwoPersonView } from './TwoPersonView';
import { StreamControlBar } from './StreamControlBar';
import { SelfView } from './SelfView';
import { ParticipantPanel } from './ParticipantPanel';
import { WaitingRoomPanel } from './WaitingRoomPanel';
import { ChatWindow } from './ChatWindow';
import { MeetingSettingsPanel } from './MeetingSettingsPanel';
import { cn } from '@/lib/utils';
import { useViewMode } from '@/hooks/meeting/useViewMode';
import { useLayoutConfig } from '@/hooks/useLayoutConfig';
import { useImmersiveMode } from '@/hooks/meeting/useImmersiveMode';
import { useChat } from '@/hooks/meeting/useChat';
import { useMeetingSettings } from '@/hooks/meeting/useMeetingSettings';
import { toast } from 'sonner';
import type { Participant } from '@meetsolis/shared';
import { hasScreenShare } from '@stream-io/video-client';

export interface StreamVideoCallManagerV2Props {
  meetingId?: string;
  userId?: string;
  className?: string;
  onParticipantClick?: (participantId: string) => void;
  onLeaveMeeting?: () => void;
  onOpenSettings?: () => void;
  onParticipantCountChange?: (count: number) => void;
}

/**
 * StreamVideoCallManagerV2 Component
 * Uses Stream SDK hooks for participant management
 */
export function StreamVideoCallManagerV2({
  meetingId,
  userId,
  className = '',
  onParticipantClick,
  onLeaveMeeting,
  onOpenSettings,
  onParticipantCountChange,
}: StreamVideoCallManagerV2Props) {
  const call = useCall();
  const {
    useParticipants,
    useLocalParticipant,
    useCallCallingState,
    useMicrophoneState,
    useCameraState,
  } = useCallStateHooks();

  // Get participants from Stream hooks
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();
  const callingState = useCallCallingState();

  // Debug: Log localParticipant
  useEffect(() => {
    console.log(
      '[StreamVideoCallManagerV2] localParticipant:',
      localParticipant
    );
    console.log(
      '[StreamVideoCallManagerV2] participants count:',
      participants?.length || 0
    );
  }, [localParticipant, participants]);

  // Get local audio/video state for accurate icon display
  const { isMute: isLocalAudioMuted } = useMicrophoneState();
  const { isMute: isLocalVideoOff } = useCameraState();

  // Participant panel state
  const [isParticipantPanelOpen, setIsParticipantPanelOpen] = useState(false);
  const [participantRoles, setParticipantRoles] = useState<
    Map<string, 'host' | 'co-host' | 'participant'>
  >(new Map());
  const [currentUserRole, setCurrentUserRole] = useState<
    'host' | 'co-host' | 'participant'
  >('participant');
  // Map Clerk IDs to participant database IDs for API calls
  const [clerkIdToParticipantId, setClerkIdToParticipantId] = useState<
    Map<string, string>
  >(new Map());

  // Waiting room state
  const [isWaitingRoomPanelOpen, setIsWaitingRoomPanelOpen] = useState(false);
  const [waitingRoomCount, setWaitingRoomCount] = useState(0);

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);

  // Hand raise state
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [dbParticipants, setDbParticipants] = useState<Participant[]>([]);

  // Meeting settings state (host only)
  const [isMeetingSettingsOpen, setIsMeetingSettingsOpen] = useState(false);
  const [meetingData, setMeetingData] = useState<any>(null); // Store full meeting object

  // Real-time meeting settings (with toast notifications)
  const { settings: meetingSettings, isLoading: settingsLoading } =
    useMeetingSettings({
      meetingId: meetingId || '',
      enabled: !!meetingId,
    });

  // Layout configuration
  const {
    layoutConfig,
    setPinnedParticipant,
    setImmersiveMode,
    setSpotlightParticipant,
  } = useLayoutConfig();

  // Auto-detect view mode based on participant count
  const { viewMode, setViewMode } = useViewMode({
    participantCount: participants.length,
    allowManualOverride: true,
  });

  // Immersive mode
  const { isImmersive, toggleImmersive, showControls } = useImmersiveMode();

  // Chat hook
  const {
    messages,
    sendMessage,
    editMessage,
    deleteMessage,
    isConnected: isChatConnected,
  } = useChat({
    meetingId: meetingId || '',
    currentUserId: userId || '',
    enabled: !!meetingId && !!userId,
  });

  // Sync immersive mode with layout config
  useEffect(() => {
    setImmersiveMode(isImmersive);
  }, [isImmersive, setImmersiveMode]);

  /**
   * Log participant updates and notify parent of count changes
   */
  useEffect(() => {
    console.log('[StreamVideoCallManagerV2] Participants updated:', {
      count: participants.length,
      participants: participants.map(p => ({
        userId: p.userId,
        name: p.name,
        isLocal: p.isLocalParticipant,
        publishedTracks: p.publishedTracks,
        isSpeaking: p.isSpeaking,
      })),
    });

    // Notify parent component of participant count changes
    if (onParticipantCountChange) {
      onParticipantCountChange(participants.length);
    }
  }, [participants, onParticipantCountChange]);

  /**
   * Monitor screen sharing and show toast notifications
   */
  useEffect(() => {
    const screenSharingParticipant = participants.find(p => hasScreenShare(p));

    if (screenSharingParticipant) {
      const sharerName = screenSharingParticipant.isLocalParticipant
        ? 'You are'
        : `${screenSharingParticipant.name || 'Someone'} is`;

      toast.info(`${sharerName} sharing screen`, {
        duration: 3000,
        icon: '🖥️',
      });
    }
  }, [participants]);

  /**
   * Log calling state changes
   */
  useEffect(() => {
    console.log('[StreamVideoCallManagerV2] Calling state:', callingState);
  }, [callingState]);

  /**
   * Fetch participant roles from meeting API
   * Extracted as useCallback so it can be called from multiple places
   */
  const fetchParticipantRoles = useCallback(async () => {
    if (!meetingId || !userId) return;

    try {
      const res = await fetch(`/api/meetings/${meetingId}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        console.error(
          '[StreamVideoCallManagerV2] Failed to fetch meeting data'
        );
        return;
      }

      const data = await res.json();
      const meeting = data.meeting;
      const dbParticipantsData = data.participants || [];

      // Store meeting data for screen share permission check
      setMeetingData(meeting);

      // Store participants for chat
      setDbParticipants(dbParticipantsData);

      // Build roles map using clerk_id (to match Stream SDK user IDs)
      const rolesMap = new Map<string, 'host' | 'co-host' | 'participant'>();
      // Build mapping from clerk_id to participant database ID
      const clerkToParticipantMap = new Map<string, string>();

      // First, mark host by clerk_id
      // We need to find the host's clerk_id from participants
      const hostParticipant = dbParticipantsData.find(
        (p: any) => p.user_id === meeting?.host_id
      );
      if (hostParticipant?.clerk_id) {
        rolesMap.set(hostParticipant.clerk_id, 'host');
      }

      // Get roles from participants table using clerk_id
      // IMPORTANT: Don't overwrite host role
      dbParticipantsData.forEach((p: any) => {
        if (p.clerk_id && p.role) {
          // Build clerk_id → participant_id mapping
          if (p.id) {
            clerkToParticipantMap.set(p.clerk_id, p.id);
          }
          // If user is already marked as host, keep them as host
          if (rolesMap.get(p.clerk_id) !== 'host') {
            rolesMap.set(p.clerk_id, p.role);
          }
        }
      });

      setParticipantRoles(rolesMap);
      setClerkIdToParticipantId(clerkToParticipantMap);

      // Set current user role using userId (which is clerk_id)
      let userRole: 'host' | 'co-host' | 'participant' = 'participant';
      if (userId) {
        userRole = rolesMap.get(userId) || 'participant';
        setCurrentUserRole(userRole);
      }

      console.log('[StreamVideoCallManagerV2] Participant roles loaded:', {
        rolesMap: Array.from(rolesMap.entries()),
        currentUserRole: userRole,
        userId,
      });
    } catch (error) {
      console.error(
        '[StreamVideoCallManagerV2] Error fetching participant roles:',
        error
      );
    }
  }, [meetingId, userId]);

  /**
   * Call fetchParticipantRoles on mount and when participants change
   */
  useEffect(() => {
    fetchParticipantRoles();
  }, [fetchParticipantRoles, participants.length]);

  /**
   * Fetch waiting room participant count (only for hosts/co-hosts)
   */
  const fetchWaitingRoomCount = useCallback(async () => {
    if (!meetingId) return;
    if (currentUserRole !== 'host' && currentUserRole !== 'co-host') {
      setWaitingRoomCount(0);
      return;
    }

    try {
      const res = await fetch(`/api/meetings/${meetingId}/waiting-room`, {
        credentials: 'include',
      });
      if (!res.ok) {
        console.error(
          '[StreamVideoCallManagerV2] Failed to fetch waiting room:',
          res.status
        );
        return;
      }

      const data = await res.json();
      const count = data.data?.length || 0;
      setWaitingRoomCount(count);
      console.log('[StreamVideoCallManagerV2] Waiting room count:', count);
    } catch (error) {
      console.error(
        '[StreamVideoCallManagerV2] Error fetching waiting room:',
        error
      );
    }
  }, [meetingId, currentUserRole]);

  /**
   * Poll for waiting room updates
   * Note: Realtime subscription is the primary mechanism, polling is a fallback
   */
  useEffect(() => {
    fetchWaitingRoomCount();

    // Poll every 10 seconds as fallback (realtime subscription is primary)
    const interval = setInterval(fetchWaitingRoomCount, 10000);
    return () => clearInterval(interval);
  }, [fetchWaitingRoomCount]);

  /**
   * Auto-open waiting room panel when participants join
   */
  useEffect(() => {
    if (waitingRoomCount > 0 && !isWaitingRoomPanelOpen) {
      setIsWaitingRoomPanelOpen(true);
    }
  }, [waitingRoomCount, isWaitingRoomPanelOpen]);

  /**
   * Subscribe to realtime updates for participant roles and meeting spotlight
   */
  useEffect(() => {
    if (!meetingId) return;

    // Use environment variables directly for client-side access
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error(
        '[StreamVideoCallManagerV2] Supabase credentials not found'
      );
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get meeting UUID for subscription
    async function subscribeToRealtime() {
      try {
        const res = await fetch(`/api/meetings/${meetingId}`, {
          credentials: 'include',
        });
        if (!res.ok) return;

        const data = await res.json();
        const meetingUUID = data.meeting?.id;

        if (!meetingUUID) return;

        // Subscribe to participant changes (role updates, join/leave)
        const participantsChannel = supabase
          .channel(`participants:${meetingUUID}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'participants',
              filter: `meeting_id=eq.${meetingUUID}`,
            },
            payload => {
              console.log(
                '[StreamVideoCallManagerV2] Participant changed:',
                payload
              );
              // Refetch participant roles when any participant changes
              fetchParticipantRoles();
            }
          )
          .subscribe();

        // Subscribe to meeting changes (spotlight updates)
        const meetingChannel = supabase
          .channel(`meeting:${meetingUUID}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'meetings',
              filter: `id=eq.${meetingUUID}`,
            },
            payload => {
              console.log(
                '[StreamVideoCallManagerV2] Meeting updated:',
                payload
              );
              // Update spotlight if changed
              const newSpotlight = (payload.new as any)
                ?.spotlight_participant_id;
              if (newSpotlight !== undefined) {
                // Refetch to get updated spotlight participant clerk_id
                fetchParticipantRoles();
              }
            }
          )
          .subscribe();

        // Subscribe to waiting room changes (realtime notification when participants join/leave waiting room)
        const waitingRoomChannel = supabase
          .channel(`waiting_room:${meetingUUID}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'waiting_room_participants',
              filter: `meeting_id=eq.${meetingUUID}`,
            },
            payload => {
              console.log(
                '[StreamVideoCallManagerV2] Waiting room changed:',
                payload
              );

              // Show toast notification when new participant joins waiting room
              if (payload.eventType === 'INSERT' && payload.new) {
                const participantName =
                  (payload.new as any).display_name || 'Someone';
                toast.info(`${participantName} wants to join`, {
                  description: 'New participant in waiting room',
                  duration: 5000,
                });
              }

              // Refetch waiting room count
              if (currentUserRole === 'host' || currentUserRole === 'co-host') {
                fetchWaitingRoomCount();
              }
            }
          )
          .subscribe();

        // Cleanup on unmount
        return () => {
          participantsChannel.unsubscribe();
          meetingChannel.unsubscribe();
          waitingRoomChannel.unsubscribe();
        };
      } catch (error) {
        console.error(
          '[StreamVideoCallManagerV2] Realtime subscription error:',
          error
        );
      }
    }

    const cleanup = subscribeToRealtime();
    return () => {
      cleanup.then(fn => fn?.());
    };
  }, [meetingId]);

  /**
   * Handle participant click - pin/unpin participant
   */
  const handleParticipantClick = useCallback(
    (participantId: string) => {
      console.log(
        '[StreamVideoCallManagerV2] Participant clicked:',
        participantId
      );

      // Toggle pin: if already pinned, unpin; otherwise pin
      if (layoutConfig.pinnedParticipantId === participantId) {
        setPinnedParticipant(null);
      } else {
        setPinnedParticipant(participantId);
      }

      onParticipantClick?.(participantId);
    },
    [onParticipantClick, layoutConfig.pinnedParticipantId, setPinnedParticipant]
  );

  /**
   * Toggle view mode between speaker and gallery
   */
  const handleToggleViewMode = useCallback(() => {
    setViewMode(viewMode === 'speaker' ? 'gallery' : 'speaker');
  }, [viewMode, setViewMode]);

  /**
   * Toggle participant panel
   */
  const handleToggleParticipantPanel = useCallback(() => {
    setIsParticipantPanelOpen(prev => !prev);
  }, []);

  /**
   * Handle spotlight participant (global, synced)
   */
  const handleSpotlight = useCallback(
    async (clerkUserId: string) => {
      if (!meetingId) return;

      try {
        // Convert Clerk ID to participant database ID
        const participantDbId = clerkIdToParticipantId.get(clerkUserId);
        if (!participantDbId) {
          console.error(
            '[StreamVideoCallManagerV2] Participant ID not found for Clerk ID:',
            clerkUserId
          );
          return;
        }

        // If spotlighting same user, clear spotlight
        const isClearing = layoutConfig.spotlightParticipantId === clerkUserId;

        const res = await fetch(`/api/meetings/${meetingId}/spotlight`, {
          method: 'PUT', // API expects PUT
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            spotlight_participant_id: isClearing ? null : participantDbId, // Use correct param name
          }),
        });

        if (!res.ok) {
          const error = await res.json();
          console.error(
            '[StreamVideoCallManagerV2] Failed to spotlight participant:',
            error
          );
          return;
        }

        const data = await res.json();
        console.log('[StreamVideoCallManagerV2] Spotlight updated:', data);

        // Update local state using Clerk ID
        setSpotlightParticipant(isClearing ? null : clerkUserId);
      } catch (error) {
        console.error(
          '[StreamVideoCallManagerV2] Error spotlighting participant:',
          error
        );
      }
    },
    [
      meetingId,
      layoutConfig.spotlightParticipantId,
      setSpotlightParticipant,
      clerkIdToParticipantId,
    ]
  );

  /**
   * Handle role change (promote/demote)
   */
  const handleChangeRole = useCallback(
    async (
      clerkUserId: string,
      newRole: 'host' | 'co-host' | 'participant'
    ) => {
      if (!meetingId) return;

      try {
        // Convert Clerk ID to participant database ID
        const participantDbId = clerkIdToParticipantId.get(clerkUserId);
        if (!participantDbId) {
          console.error(
            '[StreamVideoCallManagerV2] Participant ID not found for Clerk ID:',
            clerkUserId
          );
          return;
        }

        const res = await fetch(
          `/api/meetings/${meetingId}/participants/${participantDbId}/role`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: newRole }),
          }
        );

        if (!res.ok) {
          const error = await res.json();
          console.error(
            '[StreamVideoCallManagerV2] Failed to change participant role:',
            error
          );
          return;
        }

        const data = await res.json();
        console.log('[StreamVideoCallManagerV2] Role changed:', data);

        // Update local state using Clerk ID
        setParticipantRoles(prev => {
          const updated = new Map(prev);
          updated.set(clerkUserId, newRole);
          return updated;
        });
      } catch (error) {
        console.error(
          '[StreamVideoCallManagerV2] Error changing participant role:',
          error
        );
      }
    },
    [meetingId, clerkIdToParticipantId]
  );

  /**
   * Handle toggle chat
   */
  const handleToggleChat = useCallback(() => {
    setIsChatOpen(prev => !prev);
    if (!isChatOpen) {
      setChatUnreadCount(0); // Clear unread when opening
    }
  }, [isChatOpen]);

  /**
   * Handle toggle hand raise
   */
  const handleToggleHandRaise = useCallback(async () => {
    if (!meetingId || !userId) return;

    try {
      const newState = !isHandRaised;
      const res = await fetch(
        `/api/meetings/${meetingId}/participants/${userId}/hand-raise`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hand_raised: newState }),
        }
      );

      if (res.ok) {
        setIsHandRaised(newState);
        toast.success(newState ? 'Hand raised' : 'Hand lowered');
      }
    } catch (error) {
      console.error(
        '[StreamVideoCallManagerV2] Failed to toggle hand raise:',
        error
      );
    }
  }, [meetingId, userId, isHandRaised]);

  /**
   * Handle toggle meeting settings panel
   */
  const handleToggleMeetingSettings = useCallback(() => {
    setIsMeetingSettingsOpen(prev => !prev);
  }, []);

  /**
   * Handle update meeting settings
   * Note: Settings are automatically updated via useMeetingSettings hook's Realtime subscription
   */
  const handleUpdateMeetingSettings = useCallback(
    async (newSettings: {
      chat_enabled?: boolean;
      private_chat_enabled?: boolean;
      file_uploads_enabled?: boolean;
    }) => {
      if (!meetingId) return;

      try {
        const res = await fetch(`/api/meetings/${meetingId}/settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ settings: newSettings }),
        });

        if (res.ok) {
          // No need to manually update state - useMeetingSettings hook handles it via Realtime
          toast.success('Meeting settings updated');
        } else {
          throw new Error('Failed to update settings');
        }
      } catch (error) {
        console.error(
          '[StreamVideoCallManagerV2] Failed to update settings:',
          error
        );
        toast.error('Failed to update meeting settings');
        throw error;
      }
    },
    [meetingId]
  );

  /**
   * Handle remove participant
   */
  const handleRemoveParticipant = useCallback(
    async (clerkUserId: string) => {
      if (!meetingId) return;

      try {
        // Convert Clerk ID to participant database ID
        const participantDbId = clerkIdToParticipantId.get(clerkUserId);
        if (!participantDbId) {
          console.error(
            '[StreamVideoCallManagerV2] Participant ID not found for Clerk ID:',
            clerkUserId
          );
          return;
        }

        const res = await fetch(
          `/api/meetings/${meetingId}/participants/${participantDbId}/remove`,
          {
            method: 'DELETE', // API expects DELETE
          }
        );

        if (!res.ok) {
          const error = await res.json();
          console.error(
            '[StreamVideoCallManagerV2] Failed to remove participant:',
            error
          );
          return;
        }

        const data = await res.json();
        console.log('[StreamVideoCallManagerV2] Participant removed:', data);

        // Remove from roles map using Clerk ID
        setParticipantRoles(prev => {
          const updated = new Map(prev);
          updated.delete(clerkUserId);
          return updated;
        });
      } catch (error) {
        console.error(
          '[StreamVideoCallManagerV2] Error removing participant:',
          error
        );
      }
    },
    [meetingId, clerkIdToParticipantId]
  );

  // Show loading state
  if (!call || callingState !== CallingState.JOINED) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 rounded-lg">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
          <p>
            {callingState === CallingState.JOINING
              ? 'Joining call...'
              : 'Connecting...'}
          </p>
        </div>
      </div>
    );
  }

  /**
   * Render appropriate view based on mode
   */
  const renderView = () => {
    if (participants.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-white text-lg">No participants yet</p>
        </div>
      );
    }

    // Special case: Exactly 2 participants → TwoPersonView
    // Shows remote participant large + self-view small (no grid)
    if (participants.length === 2 && localParticipant) {
      const remoteParticipant = participants.find(
        p => p.userId !== localParticipant.userId
      );

      if (remoteParticipant) {
        return (
          <TwoPersonView
            localParticipant={localParticipant}
            remoteParticipant={remoteParticipant}
            dbParticipants={dbParticipants}
            immersiveMode={isImmersive}
            className="h-full"
          />
        );
      }
    }

    // Single participant or 3+ participants
    // For 3+ participants: use view mode toggle (speaker vs gallery)
    if (viewMode === 'speaker') {
      return (
        <SpeakerView
          participants={participants}
          dbParticipants={dbParticipants}
          spotlightId={layoutConfig.spotlightParticipantId}
          pinnedId={layoutConfig.pinnedParticipantId}
          onParticipantClick={handleParticipantClick}
          className="h-full"
        />
      );
    }

    // Default to gallery view (1 participant or 3+ in gallery mode)
    return (
      <GalleryView
        participants={participants}
        dbParticipants={dbParticipants}
        maxTilesVisible={layoutConfig.maxTilesVisible}
        hideNoVideo={layoutConfig.hideNoVideo}
        onParticipantClick={handleParticipantClick}
        className="h-full"
      />
    );
  };

  return (
    <>
      <div
        className={cn('w-full h-full bg-gray-950', className)}
        role="main"
        aria-label="Video call"
      >
        {renderView()}

        {/* Connection state indicator */}
        <div
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          Connected to video call
        </div>
      </div>

      {/* Self View - REMOVED from here */}
      {/* Now only rendered inside TwoPersonView component (2-person mode only) */}

      {/* Control Bar - inside Stream context */}
      <StreamControlBar
        onLeaveMeeting={onLeaveMeeting}
        onOpenSettings={onOpenSettings}
        onToggleParticipantPanel={handleToggleParticipantPanel}
        onToggleWaitingRoom={
          currentUserRole === 'host' || currentUserRole === 'co-host'
            ? () => setIsWaitingRoomPanelOpen(!isWaitingRoomPanelOpen)
            : undefined
        }
        // Only show view toggle button when 3+ participants
        onToggleViewMode={
          participants.length >= 3 ? handleToggleViewMode : undefined
        }
        onToggleImmersiveMode={toggleImmersive}
        onToggleChat={handleToggleChat}
        onToggleHandRaise={handleToggleHandRaise}
        onToggleMeetingSettings={
          currentUserRole === 'host' ? handleToggleMeetingSettings : undefined
        }
        isHost={currentUserRole === 'host'}
        isParticipantPanelOpen={isParticipantPanelOpen}
        isWaitingRoomOpen={isWaitingRoomPanelOpen}
        isChatOpen={isChatOpen}
        isHandRaised={isHandRaised}
        isMeetingSettingsOpen={isMeetingSettingsOpen}
        currentViewMode={viewMode}
        isImmersiveMode={isImmersive}
        showControls={showControls}
        waitingRoomCount={waitingRoomCount}
        chatUnreadCount={chatUnreadCount}
        userRole={currentUserRole === 'host' ? 'host' : 'participant'}
        allowParticipantScreenshare={
          meetingData?.allow_participant_screenshare || false
        }
      />

      {/* Participant Panel */}
      {userId && (
        <ParticipantPanel
          participants={participants}
          participantRoles={participantRoles}
          currentUserId={userId}
          currentUserRole={currentUserRole}
          spotlightId={layoutConfig.spotlightParticipantId}
          isOpen={isParticipantPanelOpen}
          onClose={handleToggleParticipantPanel}
          onSpotlight={handleSpotlight}
          onChangeRole={handleChangeRole}
          onRemove={handleRemoveParticipant}
        />
      )}

      {/* Waiting Room Panel - Shows when there are waiting participants */}
      {meetingId && waitingRoomCount > 0 && (
        <WaitingRoomPanel
          meetingId={meetingId}
          isOpen={isWaitingRoomPanelOpen}
          onClose={() => setIsWaitingRoomPanelOpen(false)}
          isHost={currentUserRole === 'host' || currentUserRole === 'co-host'}
        />
      )}

      {/* Chat Window */}
      {meetingId && userId && (
        <ChatWindow
          meetingId={meetingId}
          currentUserId={userId}
          isHost={currentUserRole === 'host'}
          participants={dbParticipants}
          messages={messages}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          onSendMessage={sendMessage}
          onEditMessage={editMessage}
          onDeleteMessage={deleteMessage}
          unreadCount={chatUnreadCount}
          meetingSettings={meetingSettings}
        />
      )}

      {/* Meeting Settings Panel (Host Only) */}
      {meetingId && currentUserRole === 'host' && (
        <MeetingSettingsPanel
          meetingId={meetingId}
          isOpen={isMeetingSettingsOpen}
          onClose={() => setIsMeetingSettingsOpen(false)}
          currentSettings={
            meetingSettings || {
              chat_enabled: true,
              private_chat_enabled: true,
              file_uploads_enabled: true,
            }
          }
          onUpdateSettings={handleUpdateMeetingSettings}
        />
      )}
    </>
  );
}
