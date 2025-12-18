/**
 * useImmersiveMode Hook
 *
 * Manages immersive (fullscreen) mode for meetings.
 * Features:
 * - Toggle fullscreen using browser Fullscreen API
 * - Show controls on mouse movement with auto-hide after 2s
 * - Keyboard shortcut: F key to toggle
 * - ESC key automatically exits fullscreen (browser default)
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

/**
 * useImmersiveMode return type
 */
export interface UseImmersiveModeReturn {
  isImmersive: boolean;
  toggleImmersive: () => void;
  enterImmersive: () => void;
  exitImmersive: () => void;
  showControls: boolean;
  handleMouseMove: () => void;
}

/**
 * useImmersiveMode Hook
 *
 * Provides fullscreen control with auto-hiding controls.
 *
 * @param enabled - Whether to enable the hook (default: true)
 * @returns Immersive mode state and controls
 *
 * @example
 * ```typescript
 * const { isImmersive, toggleImmersive, showControls, handleMouseMove } = useImmersiveMode();
 *
 * return (
 *   <div onMouseMove={handleMouseMove}>
 *     {isImmersive && showControls && <Controls />}
 *     <button onClick={toggleImmersive}>Toggle Fullscreen</button>
 *   </div>
 * );
 * ```
 */
export function useImmersiveMode(
  enabled: boolean = true
): UseImmersiveModeReturn {
  const [isImmersive, setIsImmersive] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Enter fullscreen mode
   */
  const enterImmersive = useCallback(async () => {
    if (!enabled) return;

    // Don't try to enter if already in fullscreen
    if (document.fullscreenElement) {
      console.log('[useImmersiveMode] Already in fullscreen, skipping');
      return;
    }

    const element = document.documentElement;

    try {
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if ((element as any).webkitRequestFullscreen) {
        // Safari
        await (element as any).webkitRequestFullscreen();
      } else if ((element as any).mozRequestFullScreen) {
        // Firefox
        await (element as any).mozRequestFullScreen();
      } else if ((element as any).msRequestFullscreen) {
        // IE/Edge
        await (element as any).msRequestFullscreen();
      }

      console.log('[useImmersiveMode] Entered fullscreen');
    } catch (error) {
      // Silently ignore "user gesture required" errors - they're expected when
      // fullscreen is triggered outside of direct user interaction
      if (error instanceof Error && error.message.includes('user gesture')) {
        console.log(
          '[useImmersiveMode] Fullscreen requires user gesture, ignoring'
        );
        return;
      }
      console.error('[useImmersiveMode] Failed to enter fullscreen:', error);
    }
  }, [enabled]);

  /**
   * Exit fullscreen mode
   */
  const exitImmersive = useCallback(async () => {
    // Don't try to exit if not in fullscreen
    if (!document.fullscreenElement) {
      console.log('[useImmersiveMode] Not in fullscreen, skipping exit');
      return;
    }

    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        // Safari
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        // Firefox
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        // IE/Edge
        await (document as any).msExitFullscreen();
      }

      console.log('[useImmersiveMode] Exited fullscreen');
    } catch (error) {
      console.error('[useImmersiveMode] Failed to exit fullscreen:', error);
    }
  }, []);

  /**
   * Toggle fullscreen mode
   */
  const toggleImmersive = useCallback(async () => {
    if (!enabled) return;

    if (isImmersive) {
      await exitImmersive();
    } else {
      await enterImmersive();
    }
  }, [isImmersive, enterImmersive, exitImmersive, enabled]);

  /**
   * Handle mouse movement - show controls and set auto-hide timer
   */
  const handleMouseMove = useCallback(() => {
    if (!isImmersive) return;

    // Show controls immediately
    setShowControls(true);

    // Clear existing timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    // Set new timeout to hide controls after 2 seconds
    hideTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 2000);
  }, [isImmersive]);

  /**
   * Listen for fullscreen changes (to sync state)
   */
  useEffect(() => {
    if (!enabled) return;

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      console.log(
        '[useImmersiveMode] Fullscreen state changed:',
        isCurrentlyFullscreen
      );
      setIsImmersive(isCurrentlyFullscreen);

      // Show controls when entering fullscreen
      if (isCurrentlyFullscreen) {
        setShowControls(true);
        // Auto-hide after 2 seconds
        hideTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 2000);
      } else {
        // Always show controls when not in fullscreen
        setShowControls(true);
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
      }
    };

    // Listen to fullscreen change events (all browser variants)
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener(
        'webkitfullscreenchange',
        handleFullscreenChange
      );
      document.removeEventListener(
        'mozfullscreenchange',
        handleFullscreenChange
      );
      document.removeEventListener(
        'MSFullscreenChange',
        handleFullscreenChange
      );

      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [enabled]);

  /**
   * Keyboard shortcut: F key to toggle fullscreen
   */
  useHotkeys(
    'f',
    event => {
      event.preventDefault();
      toggleImmersive();
    },
    {
      enabled,
      enableOnFormTags: false, // Don't trigger when typing in forms
    },
    [toggleImmersive, enabled]
  );

  /**
   * Keyboard shortcut: ESC key to exit fullscreen
   * Note: Browser handles ESC natively for fullscreen, but we add explicit handler for consistency
   */
  useHotkeys(
    'escape',
    event => {
      if (isImmersive) {
        event.preventDefault();
        exitImmersive();
      }
    },
    {
      enabled: enabled && isImmersive,
    },
    [isImmersive, exitImmersive, enabled]
  );

  return {
    isImmersive,
    toggleImmersive,
    enterImmersive,
    exitImmersive,
    showControls,
    handleMouseMove,
  };
}
