import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Settings,
  MoreVertical,
  Radio,
} from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface ControlBarProps {
  isAudioMuted: boolean;
  isVideoOff: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  isPushToTalkMode?: boolean;
  isPushToTalkActive?: boolean;
  onTogglePushToTalkMode?: () => void;
  audioLevel?: number;
  onOpenSettings?: () => void;
  onOpenMore?: () => void;
  className?: string;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  isAudioMuted,
  isVideoOff,
  onToggleAudio,
  onToggleVideo,
  isPushToTalkMode = false,
  isPushToTalkActive = false,
  onTogglePushToTalkMode,
  audioLevel = 0,
  onOpenSettings,
  onOpenMore,
  className,
}) => {
  // Local state for immediate UI feedback (syncs with prop)
  const [localPTTMode, setLocalPTTMode] = useState(isPushToTalkMode);

  // Sync local state with prop
  useEffect(() => {
    setLocalPTTMode(isPushToTalkMode);
  }, [isPushToTalkMode]);

  // Handler for audio toggle (used by both button and keyboard)
  const handleToggleAudio = () => {
    onToggleAudio();
    toast(isAudioMuted ? 'Microphone unmuted' : 'Microphone muted', {
      duration: 2000,
    });
  };

  // Handler for video toggle (used by both button and keyboard)
  const handleToggleVideo = () => {
    onToggleVideo();
    toast(isVideoOff ? 'Video turned on' : 'Video turned off', {
      duration: 2000,
    });
  };

  // Handler for push-to-talk toggle
  const handleTogglePushToTalk = () => {
    if (onTogglePushToTalkMode) {
      // Update local state immediately for instant UI feedback
      const newMode = !localPTTMode;
      setLocalPTTMode(newMode);

      // Call parent callback
      onTogglePushToTalkMode();

      // Show toast with NEW state (not old state)
      toast(
        newMode
          ? 'Push-to-talk enabled - Hold Space to speak'
          : 'Push-to-talk disabled',
        { duration: 2000 }
      );
    }
  };

  // Keyboard shortcuts: M for mute, V for video, P for push-to-talk
  useHotkeys(
    'm',
    e => {
      e.preventDefault();
      handleToggleAudio();
    },
    { enableOnFormTags: false }
  );

  useHotkeys(
    'v',
    e => {
      e.preventDefault();
      handleToggleVideo();
    },
    { enableOnFormTags: false }
  );

  useHotkeys(
    'p',
    e => {
      e.preventDefault();
      handleTogglePushToTalk();
    },
    { enableOnFormTags: false }
  );

  return (
    <TooltipProvider>
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm',
          'border-t border-gray-800',
          'py-4 px-6',
          'flex items-center justify-center gap-4',
          'z-50',
          className
        )}
        role="toolbar"
        aria-label="Meeting controls"
      >
        {/* ARIA live region for screen reader announcements */}
        <div
          role="status"
          aria-live="polite"
          className="sr-only"
          aria-atomic="true"
        >
          {isAudioMuted ? 'Microphone muted' : 'Microphone unmuted'}
          {'. '}
          {isVideoOff ? 'Video off' : 'Video on'}
        </div>

        {/* Settings button */}
        {onOpenSettings && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenSettings}
                className={cn(
                  'h-12 w-12 rounded-full',
                  'bg-gray-700 hover:bg-gray-600',
                  'text-white',
                  'transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900'
                )}
                aria-label="Open device settings"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Device settings</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Push-to-Talk button - Always visible */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleTogglePushToTalk}
              disabled={!onTogglePushToTalkMode}
              className={cn(
                'h-12 w-12 rounded-full',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900',
                localPTTMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-white',
                isPushToTalkActive && 'ring-4 ring-green-500 animate-pulse',
                !onTogglePushToTalkMode && 'opacity-50 cursor-not-allowed'
              )}
              aria-label={`Push-to-talk mode ${localPTTMode ? 'enabled' : 'disabled'} (P)`}
              aria-pressed={localPTTMode}
            >
              <Radio className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{localPTTMode ? 'Disable' : 'Enable'} push-to-talk (P)</p>
            {localPTTMode && (
              <p className="text-xs text-gray-400 mt-1">Hold Space to speak</p>
            )}
          </TooltipContent>
        </Tooltip>

        {/* Mute/Unmute button with audio level meter */}
        <div className="relative flex flex-col items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleAudio}
                className={cn(
                  'h-14 w-14 rounded-full',
                  'transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900',
                  isAudioMuted
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                )}
                aria-label={
                  isAudioMuted ? 'Unmute microphone (M)' : 'Mute microphone (M)'
                }
                aria-pressed={isAudioMuted}
              >
                {isAudioMuted ? (
                  <MicOff className="h-6 w-6" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{isAudioMuted ? 'Unmute (M)' : 'Mute (M)'}</p>
            </TooltipContent>
          </Tooltip>

          {/* Audio level meter - only visible when unmuted */}
          {!isAudioMuted && audioLevel > 0 && (
            <div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-800 rounded-full overflow-hidden"
              role="meter"
              aria-label="Audio level"
              aria-valuenow={Math.round(audioLevel)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full bg-green-500 transition-all duration-100 ease-out"
                style={{ width: `${Math.min(audioLevel, 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* Video on/off button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleVideo}
              className={cn(
                'h-14 w-14 rounded-full',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900',
                isVideoOff
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              )}
              aria-label={
                isVideoOff ? 'Turn on video (V)' : 'Turn off video (V)'
              }
              aria-pressed={isVideoOff}
            >
              {isVideoOff ? (
                <VideoOff className="h-6 w-6" />
              ) : (
                <Video className="h-6 w-6" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{isVideoOff ? 'Turn on video (V)' : 'Turn off video (V)'}</p>
          </TooltipContent>
        </Tooltip>

        {/* More options button */}
        {onOpenMore && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenMore}
                className={cn(
                  'h-12 w-12 rounded-full',
                  'bg-gray-700 hover:bg-gray-600',
                  'text-white',
                  'transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900'
                )}
                aria-label="More options"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>More options</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};
