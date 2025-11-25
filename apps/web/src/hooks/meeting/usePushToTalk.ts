import { useState, useEffect, useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

export interface PushToTalkOptions {
  enabled: boolean;
  onPushStart?: () => void;
  onPushEnd?: () => void;
  onToggleMode?: (enabled: boolean) => void;
}

export interface PushToTalkReturn {
  isPushToTalkMode: boolean;
  isPushToTalkActive: boolean;
  togglePushToTalkMode: () => void;
  setPushToTalkMode: (enabled: boolean) => void;
}

/**
 * Hook for managing push-to-talk functionality
 * Handles Space bar press/release for temporary audio unmute
 */
export const usePushToTalk = ({
  enabled,
  onPushStart,
  onPushEnd,
  onToggleMode,
}: PushToTalkOptions): PushToTalkReturn => {
  const [isPushToTalkMode, setIsPushToTalkMode] = useState(enabled);
  const [isPushToTalkActive, setIsPushToTalkActive] = useState(false);

  // Update mode when prop changes
  useEffect(() => {
    setIsPushToTalkMode(enabled);
  }, [enabled]);

  // Toggle push-to-talk mode
  const togglePushToTalkMode = useCallback(() => {
    const newMode = !isPushToTalkMode;
    setIsPushToTalkMode(newMode);
    onToggleMode?.(newMode);
  }, [isPushToTalkMode, onToggleMode]);

  // Set push-to-talk mode directly
  const setPushToTalkMode = useCallback(
    (enabled: boolean) => {
      setIsPushToTalkMode(enabled);
      onToggleMode?.(enabled);
    },
    [onToggleMode]
  );

  // Handle Space key press (start push-to-talk)
  useHotkeys(
    'space',
    e => {
      if (!isPushToTalkMode) return;

      // Don't activate if user is typing in a form field
      const target = e.target as HTMLElement;
      const isFormElement =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true';

      if (isFormElement) return;

      e.preventDefault();
      setIsPushToTalkActive(true);
      onPushStart?.();
    },
    { keydown: true, enableOnFormTags: false },
    [isPushToTalkMode, onPushStart]
  );

  // Handle Space key release (end push-to-talk)
  useHotkeys(
    'space',
    e => {
      if (!isPushToTalkMode) return;

      // Don't deactivate if user is typing in a form field
      const target = e.target as HTMLElement;
      const isFormElement =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true';

      if (isFormElement) return;

      e.preventDefault();
      setIsPushToTalkActive(false);
      onPushEnd?.();
    },
    { keyup: true, enableOnFormTags: false },
    [isPushToTalkMode, onPushEnd]
  );

  // Cleanup: ensure push-to-talk is deactivated on unmount
  useEffect(() => {
    return () => {
      if (isPushToTalkActive) {
        setIsPushToTalkActive(false);
        onPushEnd?.();
      }
    };
  }, [isPushToTalkActive, onPushEnd]);

  return {
    isPushToTalkMode,
    isPushToTalkActive,
    togglePushToTalkMode,
    setPushToTalkMode,
  };
};
