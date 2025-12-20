/**
 * StreamControlBar Component
 * Control bar using Stream SDK hooks for audio/video controls
 */

'use client';

import React, { useCallback } from 'react';
import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Settings,
  LayoutGrid,
  Users,
  UserPlus,
  Maximize2,
  Grid2x2,
  Presentation,
  MessageSquare,
  Hand,
  Sliders,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StreamControlBarProps {
  onLeaveMeeting?: () => void;
  onOpenSettings?: () => void;
  onToggleParticipantPanel?: () => void;
  onToggleWaitingRoom?: () => void;
  onToggleViewMode?: () => void;
  onToggleImmersiveMode?: () => void;
  onToggleChat?: () => void;
  onToggleHandRaise?: () => void;
  onToggleMeetingSettings?: () => void;
  isHost?: boolean;
  isParticipantPanelOpen?: boolean;
  isWaitingRoomOpen?: boolean;
  isChatOpen?: boolean;
  isHandRaised?: boolean;
  isMeetingSettingsOpen?: boolean;
  currentViewMode?: 'speaker' | 'gallery';
  isImmersiveMode?: boolean;
  showControls?: boolean;
  waitingRoomCount?: number;
  chatUnreadCount?: number;
  className?: string;
}

/**
 * StreamControlBar Component
 * Uses Stream SDK hooks for media controls
 */
export function StreamControlBar({
  onLeaveMeeting,
  onOpenSettings,
  onToggleParticipantPanel,
  onToggleWaitingRoom,
  onToggleViewMode,
  onToggleImmersiveMode,
  onToggleChat,
  onToggleHandRaise,
  onToggleMeetingSettings,
  isHost = false,
  isParticipantPanelOpen = false,
  isWaitingRoomOpen = false,
  isChatOpen = false,
  isHandRaised = false,
  isMeetingSettingsOpen = false,
  currentViewMode = 'gallery',
  isImmersiveMode = false,
  showControls = true,
  waitingRoomCount = 0,
  chatUnreadCount = 0,
  className = '',
}: StreamControlBarProps) {
  const call = useCall();
  const { useMicrophoneState, useCameraState } = useCallStateHooks();

  const { microphone, isMute: isAudioMuted } = useMicrophoneState();
  const { camera, isMute: isVideoOff } = useCameraState();

  /**
   * Toggle microphone
   */
  const toggleAudio = useCallback(async () => {
    if (!call) return;

    try {
      await call.microphone.toggle();
      console.log('[StreamControlBar] Audio toggled:', !isAudioMuted);
    } catch (error) {
      console.error('[StreamControlBar] Toggle audio failed:', error);
    }
  }, [call, isAudioMuted]);

  /**
   * Toggle camera
   */
  const toggleVideo = useCallback(async () => {
    if (!call) return;

    try {
      await call.camera.toggle();
      console.log('[StreamControlBar] Video toggled:', !isVideoOff);
    } catch (error) {
      console.error('[StreamControlBar] Toggle video failed:', error);
    }
  }, [call, isVideoOff]);

  /**
   * Leave meeting
   */
  const handleLeaveMeeting = useCallback(() => {
    console.log('[StreamControlBar] Leave meeting clicked');
    onLeaveMeeting?.();
  }, [onLeaveMeeting]);

  /**
   * Open settings
   */
  const handleOpenSettings = useCallback(() => {
    console.log('[StreamControlBar] Settings clicked');
    onOpenSettings?.();
  }, [onOpenSettings]);

  // Don't render in immersive mode if controls are hidden
  if (isImmersiveMode && !showControls) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-40 transition-opacity duration-200',
        isImmersiveMode && 'opacity-90',
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-4">
          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={cn(
              'flex items-center justify-center w-12 h-12 rounded-full transition-all focus:ring-2 focus:ring-offset-2',
              isAudioMuted
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                : 'bg-gray-700 hover:bg-gray-600 focus:ring-gray-500'
            )}
            aria-label={isAudioMuted ? 'Unmute microphone' : 'Mute microphone'}
            title={isAudioMuted ? 'Unmute' : 'Mute'}
          >
            {isAudioMuted ? (
              <MicOff className="w-5 h-5 text-white" />
            ) : (
              <Mic className="w-5 h-5 text-white" />
            )}
          </button>

          {/* Video Toggle */}
          <button
            onClick={toggleVideo}
            className={cn(
              'flex items-center justify-center w-12 h-12 rounded-full transition-all focus:ring-2 focus:ring-offset-2',
              isVideoOff
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                : 'bg-gray-700 hover:bg-gray-600 focus:ring-gray-500'
            )}
            aria-label={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
            title={isVideoOff ? 'Start Video' : 'Stop Video'}
          >
            {isVideoOff ? (
              <VideoOff className="w-5 h-5 text-white" />
            ) : (
              <Video className="w-5 h-5 text-white" />
            )}
          </button>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-700 mx-2" />

          {/* Toggle View Mode (Speaker/Gallery) */}
          {onToggleViewMode && (
            <button
              onClick={onToggleViewMode}
              className={cn(
                'flex items-center justify-center w-12 h-12 rounded-full transition-all focus:ring-2 focus:ring-offset-2',
                'bg-gray-700 hover:bg-gray-600 focus:ring-gray-500'
              )}
              aria-label={`Switch to ${currentViewMode === 'speaker' ? 'gallery' : 'speaker'} view`}
              title={
                currentViewMode === 'speaker' ? 'Gallery View' : 'Speaker View'
              }
            >
              {currentViewMode === 'speaker' ? (
                <Grid2x2 className="w-5 h-5 text-white" />
              ) : (
                <Presentation className="w-5 h-5 text-white" />
              )}
            </button>
          )}

          {/* Toggle Participant Panel */}
          {onToggleParticipantPanel && (
            <button
              onClick={onToggleParticipantPanel}
              className={cn(
                'relative flex items-center justify-center w-12 h-12 rounded-full transition-all focus:ring-2 focus:ring-offset-2',
                isParticipantPanelOpen
                  ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                  : 'bg-gray-700 hover:bg-gray-600 focus:ring-gray-500'
              )}
              aria-label={
                isParticipantPanelOpen
                  ? 'Close participants'
                  : 'Show participants'
              }
              title="Participants"
            >
              <Users className="w-5 h-5 text-white" />
            </button>
          )}

          {/* Toggle Chat */}
          {onToggleChat && (
            <button
              onClick={onToggleChat}
              className={cn(
                'relative flex items-center justify-center w-12 h-12 rounded-full transition-all focus:ring-2 focus:ring-offset-2',
                isChatOpen
                  ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                  : 'bg-gray-700 hover:bg-gray-600 focus:ring-gray-500'
              )}
              aria-label={isChatOpen ? 'Close chat' : 'Open chat'}
              title="Chat"
            >
              <MessageSquare className="w-5 h-5 text-white" />
              {/* Unread message count badge */}
              {chatUnreadCount > 0 && !isChatOpen && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-blue-500 text-white text-xs font-bold rounded-full border-2 border-gray-900">
                  {chatUnreadCount}
                </span>
              )}
            </button>
          )}

          {/* Hand Raise */}
          {onToggleHandRaise && (
            <button
              onClick={onToggleHandRaise}
              className={cn(
                'flex items-center justify-center w-12 h-12 rounded-full transition-all focus:ring-2 focus:ring-offset-2',
                isHandRaised
                  ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
                  : 'bg-gray-700 hover:bg-gray-600 focus:ring-gray-500'
              )}
              aria-label={isHandRaised ? 'Lower hand' : 'Raise hand'}
              title={isHandRaised ? 'Lower Hand' : 'Raise Hand'}
            >
              <Hand className="w-5 h-5 text-white" />
            </button>
          )}

          {/* Toggle Waiting Room (host/co-host only) */}
          {onToggleWaitingRoom && (
            <button
              onClick={onToggleWaitingRoom}
              className={cn(
                'relative flex items-center justify-center w-12 h-12 rounded-full transition-all focus:ring-2 focus:ring-offset-2',
                isWaitingRoomOpen
                  ? 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'
                  : 'bg-gray-700 hover:bg-gray-600 focus:ring-gray-500'
              )}
              aria-label={
                isWaitingRoomOpen ? 'Close waiting room' : 'Show waiting room'
              }
              title="Waiting Room"
            >
              <UserPlus className="w-5 h-5 text-white" />
              {/* Waiting room count badge */}
              {waitingRoomCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full border-2 border-gray-900 animate-pulse">
                  {waitingRoomCount}
                </span>
              )}
            </button>
          )}

          {/* Toggle Immersive Mode */}
          {onToggleImmersiveMode && (
            <button
              onClick={onToggleImmersiveMode}
              className={cn(
                'flex items-center justify-center w-12 h-12 rounded-full transition-all focus:ring-2 focus:ring-offset-2',
                isImmersiveMode
                  ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'
                  : 'bg-gray-700 hover:bg-gray-600 focus:ring-gray-500'
              )}
              aria-label={
                isImmersiveMode ? 'Exit immersive mode' : 'Enter immersive mode'
              }
              title="Immersive Mode (F)"
            >
              <Maximize2 className="w-5 h-5 text-white" />
            </button>
          )}

          {/* Settings */}
          {onOpenSettings && (
            <button
              onClick={handleOpenSettings}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 transition-all focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              aria-label="Open settings"
              title="Settings"
            >
              <Settings className="w-5 h-5 text-white" />
            </button>
          )}

          {/* Meeting Settings (Host Only) */}
          {isHost && onToggleMeetingSettings && (
            <button
              onClick={onToggleMeetingSettings}
              className={cn(
                'flex items-center justify-center w-12 h-12 rounded-full transition-all focus:ring-2 focus:ring-offset-2',
                isMeetingSettingsOpen
                  ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                  : 'bg-gray-700 hover:bg-gray-600 focus:ring-gray-500'
              )}
              aria-label={
                isMeetingSettingsOpen
                  ? 'Close meeting settings'
                  : 'Open meeting settings'
              }
              title="Meeting Settings (Host)"
            >
              <Sliders className="w-5 h-5 text-white" />
            </button>
          )}

          {/* Divider */}
          <div className="h-8 w-px bg-gray-700 mx-2" />

          {/* Leave Meeting */}
          <button
            onClick={handleLeaveMeeting}
            className="flex items-center justify-center px-6 h-12 rounded-full bg-red-600 hover:bg-red-700 transition-all focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label="Leave meeting"
            title="Leave Meeting"
          >
            <PhoneOff className="w-5 h-5 text-white mr-2" />
            <span className="text-white font-medium">Leave</span>
          </button>
        </div>
      </div>
    </div>
  );
}
