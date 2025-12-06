/**
 * StreamControlBar Component
 * Control bar using Stream SDK hooks for audio/video controls
 */

'use client';

import React, { useCallback } from 'react';
import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StreamControlBarProps {
  onLeaveMeeting?: () => void;
  onOpenSettings?: () => void;
  className?: string;
}

/**
 * StreamControlBar Component
 * Uses Stream SDK hooks for media controls
 */
export function StreamControlBar({
  onLeaveMeeting,
  onOpenSettings,
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

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-40',
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
