/**
 * SelfView Component
 *
 * Draggable, resizable self-view component for showing local participant's video.
 * Position and size preferences are persisted to localStorage.
 * In immersive mode, minimizes to tiny corner (48x32px).
 */

'use client';

import React, { useCallback, useRef, useEffect, useState } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import {
  Maximize2,
  Minimize2,
  X,
  Eye,
  EyeOff,
  GripVertical,
} from 'lucide-react';
import { useLayoutConfig } from '@/hooks/useLayoutConfig';
import { StreamVideoTile } from './StreamVideoTile';
import type { StreamVideoParticipant } from '@stream-io/video-react-sdk';

/**
 * Size dimensions for self-view
 */
const SIZE_DIMENSIONS = {
  small: { width: 150, height: 100 },
  medium: { width: 240, height: 160 },
  large: { width: 320, height: 180 },
  tiny: { width: 48, height: 32 }, // Immersive mode
  twoPerson: { width: 200, height: 150 }, // 2-person mode (forceVisible)
} as const;

/**
 * SelfView Props
 */
export interface SelfViewProps {
  localParticipant: StreamVideoParticipant | null;
  immersiveMode?: boolean;
  /**
   * Force self-view to be visible regardless of user config
   * Used in TwoPersonView where self-view is required
   */
  forceVisible?: boolean;
  className?: string;
}

/**
 * SelfView Component
 *
 * Renders a draggable self-view window showing the local participant's video.
 * Supports three sizes: small, medium, large.
 * Automatically minimizes to tiny corner in immersive mode.
 *
 * @param localParticipant - Local participant from Stream SDK
 * @param immersiveMode - Whether immersive mode is active
 * @param className - Additional CSS classes
 */
export function SelfView({
  localParticipant,
  immersiveMode = false,
  forceVisible = false,
  className = '',
}: SelfViewProps) {
  const { layoutConfig, setSelfViewConfig } = useLayoutConfig();
  const nodeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Key to force remount when position is reset (fixes off-screen positioning)
  const [positionKey, setPositionKey] = useState(0);

  // Track if we've already set the initial position (prevent re-running on re-renders)
  const hasSetInitialPosition = useRef(false);

  const selfViewConfig = layoutConfig.selfView || {
    visible: true,
    position: { x: 0, y: 0 },
    size: 'small',
  };

  /**
   * Get current dimensions based on mode and size
   */
  const getCurrentDimensions = useCallback(() => {
    if (immersiveMode) {
      return SIZE_DIMENSIONS.tiny;
    }
    // Use selfViewConfig.size for all modes (including forceVisible)
    return SIZE_DIMENSIONS[selfViewConfig.size];
  }, [immersiveMode, selfViewConfig.size]);

  const dimensions = getCurrentDimensions();

  /**
   * Initialize default position (bottom-right) on first mount
   * Also check if current position is within viewport bounds
   * When forceVisible is true, always use a safe position
   */
  useEffect(() => {
    // Only run once per component instance
    if (hasSetInitialPosition.current) {
      return;
    }

    // Calculate safe bottom-right position
    const defaultX = window.innerWidth - dimensions.width - 20;
    const defaultY = window.innerHeight - dimensions.height - 20;

    // If forceVisible, always use safe position and default to medium size
    if (forceVisible) {
      setSelfViewConfig({
        position: { x: defaultX, y: defaultY },
        size: 'medium', // Default to medium in 2-person mode
      });
      setPositionKey(k => k + 1);
      hasSetInitialPosition.current = true;
      return;
    }

    // Otherwise, check if current position is off-screen
    const isOffScreen =
      selfViewConfig.position.x > window.innerWidth - dimensions.width ||
      selfViewConfig.position.y > window.innerHeight - dimensions.height ||
      selfViewConfig.position.x < 0 ||
      selfViewConfig.position.y < 0;

    if (
      (selfViewConfig.position.x === 0 && selfViewConfig.position.y === 0) ||
      isOffScreen
    ) {
      setSelfViewConfig({
        position: { x: defaultX, y: defaultY },
      });
      setPositionKey(k => k + 1);
    }

    hasSetInitialPosition.current = true;
  }, [
    forceVisible,
    dimensions.width,
    dimensions.height,
    selfViewConfig.position,
    setSelfViewConfig,
  ]);

  /**
   * Handle viewport resize - maintain position relative to bottom-right corner
   * This ensures self-view stays in the same "corner position" after resize
   */
  useEffect(() => {
    // Store previous viewport size to detect resize direction
    let prevWidth = window.innerWidth;
    let prevHeight = window.innerHeight;
    let resizeTimeout: NodeJS.Timeout | null = null;

    const handleResize = () => {
      // Debounce to avoid lag
      if (resizeTimeout) clearTimeout(resizeTimeout);

      resizeTimeout = setTimeout(() => {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;

        // Calculate offset from bottom-right corner (using previous position)
        const currentX = selfViewConfig.position.x;
        const currentY = selfViewConfig.position.y;

        // Calculate what the offset from bottom-right WAS
        const offsetFromRight = prevWidth - currentX - dimensions.width;
        const offsetFromBottom = prevHeight - currentY - dimensions.height;

        // Apply same offset to new viewport size
        let newX = newWidth - dimensions.width - offsetFromRight;
        let newY = newHeight - dimensions.height - offsetFromBottom;

        // Clamp to valid bounds
        const maxX = newWidth - dimensions.width - 10;
        const maxY = newHeight - dimensions.height - 10;
        newX = Math.max(10, Math.min(newX, maxX));
        newY = Math.max(10, Math.min(newY, maxY));

        // Only update if position actually changed
        if (Math.abs(newX - currentX) > 1 || Math.abs(newY - currentY) > 1) {
          setSelfViewConfig({
            position: { x: newX, y: newY },
          });
        }

        // Update previous size for next resize
        prevWidth = newWidth;
        prevHeight = newHeight;
      }, 100); // 100ms debounce
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeout) clearTimeout(resizeTimeout);
    };
  }, [
    dimensions.width,
    dimensions.height,
    selfViewConfig.position,
    setSelfViewConfig,
  ]);

  /**
   * Handle drag stop
   */
  const handleDragStop = useCallback(
    (_e: DraggableEvent, data: DraggableData) => {
      setSelfViewConfig({
        position: { x: data.x, y: data.y },
      });
    },
    [setSelfViewConfig]
  );

  /**
   * Toggle visibility
   */
  const handleToggleVisibility = useCallback(() => {
    setSelfViewConfig({
      visible: !selfViewConfig.visible,
    });
  }, [selfViewConfig.visible, setSelfViewConfig]);

  /**
   * Cycle through sizes: small -> medium -> large -> small
   */
  const handleCycleSize = useCallback(() => {
    const sizes: Array<'small' | 'medium' | 'large'> = [
      'small',
      'medium',
      'large',
    ];
    const currentIndex = sizes.indexOf(selfViewConfig.size);
    const nextIndex = (currentIndex + 1) % sizes.length;
    const nextSize = sizes[nextIndex];

    setSelfViewConfig({
      size: nextSize,
    });
  }, [selfViewConfig.size, setSelfViewConfig]);

  /**
   * Get bounds to constrain dragging within viewport
   */
  const getBounds = useCallback(() => {
    if (!containerRef.current) {
      return {
        left: 0,
        top: 0,
        right: window.innerWidth - dimensions.width,
        bottom: window.innerHeight - dimensions.height,
      };
    }

    return {
      left: 0,
      top: 0,
      right: window.innerWidth - dimensions.width,
      bottom: window.innerHeight - dimensions.height,
    };
  }, [dimensions]);

  // Don't render if no local participant
  if (!localParticipant) {
    return null;
  }

  // Don't render if not visible (unless forceVisible is true)
  if (!forceVisible && !selfViewConfig.visible) {
    return null;
  }

  // Use selfViewConfig.position - it's managed by useEffects (initial setup + resize handler)
  // This allows dragging to work properly since position isn't recalculated every render

  // When forceVisible, render draggable self-view with resize (no hide button)
  if (forceVisible) {
    return (
      <div ref={containerRef} className={className}>
        <Draggable
          key={positionKey}
          nodeRef={nodeRef}
          position={selfViewConfig.position}
          onStop={handleDragStop}
          bounds={getBounds()}
          handle=".drag-handle"
          disabled={immersiveMode}
        >
          <div
            ref={nodeRef}
            className="fixed top-0 left-0 z-50 rounded-lg overflow-hidden shadow-2xl border-2 border-gray-600 hover:border-blue-500 transition-all duration-200 group bg-gray-800"
            style={{
              width: dimensions.width,
              height: dimensions.height,
            }}
          >
            <StreamVideoTile
              participant={localParticipant}
              className="h-full w-full"
            />

            {/* Controls Overlay - drag handle + resize (NO hide button for forceVisible) */}
            {!immersiveMode && (
              <div className="absolute top-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-b from-black/60 to-transparent">
                <div className="flex items-center justify-between p-2">
                  <div className="drag-handle flex-1 cursor-move flex items-center gap-1">
                    <GripVertical className="w-3 h-3 text-white/70" />
                    <span className="text-xs text-white font-medium">You</span>
                  </div>
                  <button
                    onClick={handleCycleSize}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                    title={`Change size (current: ${selfViewConfig.size})`}
                    aria-label="Change size"
                  >
                    {selfViewConfig.size === 'large' ? (
                      <Minimize2 className="w-3 h-3 text-white" />
                    ) : (
                      <Maximize2 className="w-3 h-3 text-white" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </Draggable>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className}>
      <Draggable
        key={positionKey} // Force remount when position is reset
        nodeRef={nodeRef}
        position={selfViewConfig.position}
        onStop={handleDragStop}
        bounds={getBounds()}
        handle=".drag-handle"
        disabled={immersiveMode} // Disable dragging in immersive mode
      >
        <div
          ref={nodeRef}
          className="fixed top-0 left-0 z-50 rounded-lg overflow-hidden shadow-2xl border-2 border-gray-600 hover:border-blue-500 transition-all duration-200 group bg-gray-800"
          style={{
            width: dimensions.width,
            height: dimensions.height,
          }}
        >
          {/* Video Tile */}
          <StreamVideoTile
            participant={localParticipant}
            className="h-full w-full"
          />

          {/* Controls Overlay (hidden in immersive mode) */}
          {!immersiveMode && (
            <div className="absolute top-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-b from-black/60 to-transparent">
              <div className="flex items-center justify-between p-2">
                {/* Drag Handle */}
                <div className="drag-handle flex-1 cursor-move flex items-center">
                  <span className="text-xs text-white font-medium">
                    Self View
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1">
                  {/* Toggle Size */}
                  <button
                    onClick={handleCycleSize}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                    title={`Change size (current: ${selfViewConfig.size})`}
                    aria-label="Change size"
                  >
                    {selfViewConfig.size === 'small' ? (
                      <Maximize2 className="w-3 h-3 text-white" />
                    ) : (
                      <Minimize2 className="w-3 h-3 text-white" />
                    )}
                  </button>

                  {/* Toggle Visibility */}
                  <button
                    onClick={handleToggleVisibility}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                    title="Hide self view"
                    aria-label="Hide self view"
                  >
                    <EyeOff className="w-3 h-3 text-white" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Immersive Mode: Simple close button */}
          {immersiveMode && (
            <button
              onClick={handleToggleVisibility}
              className="absolute top-1 right-1 p-0.5 bg-black/50 hover:bg-black/70 rounded transition-colors"
              title="Hide self view"
              aria-label="Hide self view"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          )}
        </div>
      </Draggable>

      {/* Toggle Button (when hidden) */}
      {!selfViewConfig.visible && (
        <button
          onClick={handleToggleVisibility}
          className="fixed bottom-4 right-4 z-40 p-3 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg transition-colors"
          title="Show self view"
          aria-label="Show self view"
        >
          <Eye className="w-5 h-5 text-white" />
        </button>
      )}
    </div>
  );
}
