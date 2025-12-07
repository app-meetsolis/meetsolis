/**
 * useLayoutConfig Hook
 * Manages layout configuration with localStorage persistence
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  LayoutConfig,
  LayoutMode,
  LayoutPreferences,
} from '@/types/layout';
import {
  DEFAULT_LAYOUT_CONFIG,
  DEFAULT_LAYOUT_PREFERENCES,
  LAYOUT_PREFERENCES_STORAGE_KEY,
} from '@/types/layout';

/**
 * Load layout preferences from localStorage
 */
function loadPreferences(): LayoutPreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_LAYOUT_PREFERENCES;
  }

  try {
    const stored = localStorage.getItem(LAYOUT_PREFERENCES_STORAGE_KEY);
    if (!stored) {
      return DEFAULT_LAYOUT_PREFERENCES;
    }

    const parsed = JSON.parse(stored);
    return {
      preferredMode:
        parsed.preferredMode || DEFAULT_LAYOUT_PREFERENCES.preferredMode,
      maxTilesVisible:
        parsed.maxTilesVisible || DEFAULT_LAYOUT_PREFERENCES.maxTilesVisible,
      hideNoVideo: parsed.hideNoVideo ?? DEFAULT_LAYOUT_PREFERENCES.hideNoVideo,
    };
  } catch (error) {
    console.error('[useLayoutConfig] Failed to load preferences:', error);
    return DEFAULT_LAYOUT_PREFERENCES;
  }
}

/**
 * Save layout preferences to localStorage
 */
function savePreferences(preferences: LayoutPreferences): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(
      LAYOUT_PREFERENCES_STORAGE_KEY,
      JSON.stringify(preferences)
    );
  } catch (error) {
    console.error('[useLayoutConfig] Failed to save preferences:', error);
  }
}

/**
 * useLayoutConfig Hook
 * Provides layout configuration state and setters with localStorage persistence
 */
export function useLayoutConfig() {
  // Initialize state from localStorage preferences
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>(() => {
    const prefs = loadPreferences();
    return {
      ...DEFAULT_LAYOUT_CONFIG,
      mode: prefs.preferredMode,
      maxTilesVisible: prefs.maxTilesVisible,
      hideNoVideo: prefs.hideNoVideo,
    };
  });

  /**
   * Set layout mode and persist to localStorage
   */
  const setLayoutMode = useCallback((mode: LayoutMode) => {
    setLayoutConfig(prev => {
      const updated = { ...prev, mode };

      // Save to localStorage
      savePreferences({
        preferredMode: mode,
        maxTilesVisible: prev.maxTilesVisible,
        hideNoVideo: prev.hideNoVideo,
      });

      return updated;
    });
  }, []);

  /**
   * Set max tiles visible and persist to localStorage
   */
  const setMaxTiles = useCallback((count: number) => {
    const clamped = Math.max(1, Math.min(25, count)); // Clamp between 1-25

    setLayoutConfig(prev => {
      const updated = { ...prev, maxTilesVisible: clamped };

      // Save to localStorage
      savePreferences({
        preferredMode: prev.mode,
        maxTilesVisible: clamped,
        hideNoVideo: prev.hideNoVideo,
      });

      return updated;
    });
  }, []);

  /**
   * Set hide no-video setting and persist to localStorage
   */
  const setHideNoVideo = useCallback((hide: boolean) => {
    setLayoutConfig(prev => {
      const updated = { ...prev, hideNoVideo: hide };

      // Save to localStorage
      savePreferences({
        preferredMode: prev.mode,
        maxTilesVisible: prev.maxTilesVisible,
        hideNoVideo: hide,
      });

      return updated;
    });
  }, []);

  /**
   * Set spotlight participant (not persisted - session-only)
   */
  const setSpotlightParticipant = useCallback(
    (participantId?: string | null) => {
      setLayoutConfig(prev => ({
        ...prev,
        spotlightParticipantId: participantId,
      }));
    },
    []
  );

  return {
    layoutConfig,
    setLayoutMode,
    setMaxTiles,
    setHideNoVideo,
    setSpotlightParticipant,
  };
}
