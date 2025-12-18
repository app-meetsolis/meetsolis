/**
 * useViewMode Hook
 * Auto-detects optimal view mode based on participant count with manual override
 *
 * Auto-detection logic:
 * - 1 participant → gallery (single tile centered)
 * - 2 participants → speaker (conversational layout)
 * - 3+ participants → gallery (equal grid layout)
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import type { LayoutMode } from '@/types/layout';
import { useLayoutConfig } from '@/hooks/useLayoutConfig';

export interface UseViewModeOptions {
  /**
   * Array of participants in the current meeting
   * Used to auto-detect the optimal view mode
   */
  participantCount: number;

  /**
   * Whether to respect user's manual mode selection
   * If false, always use auto-detection (default: true)
   */
  allowManualOverride?: boolean;
}

export interface UseViewModeReturn {
  /**
   * Current active view mode
   * Either auto-detected or manually set
   */
  viewMode: 'speaker' | 'gallery';

  /**
   * Set view mode manually (overrides auto-detection)
   */
  setViewMode: (mode: 'speaker' | 'gallery') => void;

  /**
   * Auto-detected mode based on participant count
   * Always computed regardless of manual override
   */
  autoDetectedMode: 'speaker' | 'gallery';

  /**
   * Whether the current view mode is manually overridden
   */
  isManualOverride: boolean;

  /**
   * Reset to auto-detection (clear manual override)
   */
  resetToAuto: () => void;
}

/**
 * useViewMode Hook
 *
 * @param options - Configuration options
 * @returns View mode state and controls
 *
 * @example
 * ```typescript
 * const participants = useParticipants();
 * const { viewMode, setViewMode, autoDetectedMode } = useViewMode({
 *   participantCount: participants.length,
 * });
 *
 * // Render view based on mode
 * {viewMode === 'speaker' ? <SpeakerView /> : <GalleryView />}
 * ```
 */
export function useViewMode(options: UseViewModeOptions): UseViewModeReturn {
  const { participantCount, allowManualOverride = true } = options;
  const { layoutConfig, setLayoutMode } = useLayoutConfig();

  // Track manual override state (session-only)
  const [manualMode, setManualMode] = useState<'speaker' | 'gallery' | null>(
    null
  );

  /**
   * Auto-detect view mode based on participant count
   * 1 participant → gallery (single large tile)
   * 2 participants → speaker (conversational)
   * 3+ participants → gallery (grid layout)
   */
  const autoDetectedMode = useMemo<'speaker' | 'gallery'>(() => {
    if (participantCount === 1) {
      return 'gallery';
    }
    if (participantCount === 2) {
      return 'speaker';
    }
    return 'gallery'; // 3+ participants
  }, [participantCount]);

  /**
   * Determine active view mode
   * Priority: manual override > auto-detection
   */
  const viewMode = useMemo<'speaker' | 'gallery'>(() => {
    // If manual override exists and is allowed, use it
    if (allowManualOverride && manualMode) {
      console.log('[useViewMode] Using manual override:', manualMode);
      return manualMode;
    }

    // Otherwise, use auto-detection
    console.log(
      '[useViewMode] Using auto-detected mode:',
      autoDetectedMode,
      'for',
      participantCount,
      'participants'
    );
    return autoDetectedMode;
  }, [allowManualOverride, manualMode, autoDetectedMode, participantCount]);

  /**
   * Set view mode manually
   * Creates a manual override that persists until reset
   */
  const setViewMode = (mode: 'speaker' | 'gallery') => {
    setManualMode(mode);
    // Also update layout config for consistency
    setLayoutMode(mode);
  };

  /**
   * Reset to auto-detection
   * Clears manual override
   */
  const resetToAuto = () => {
    setManualMode(null);
    setLayoutMode('auto');
  };

  /**
   * Sync layout config with view mode changes
   * Update layout config when view mode changes from auto-detection
   */
  useEffect(() => {
    // Only sync if not manually overridden
    if (!manualMode && layoutConfig.mode !== autoDetectedMode) {
      setLayoutMode(autoDetectedMode);
    }
  }, [autoDetectedMode, manualMode, layoutConfig.mode, setLayoutMode]);

  return {
    viewMode,
    setViewMode,
    autoDetectedMode,
    isManualOverride: manualMode !== null,
    resetToAuto,
  };
}
