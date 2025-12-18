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
  SelfViewConfig,
} from '@/types/layout';
import {
  DEFAULT_LAYOUT_CONFIG,
  DEFAULT_LAYOUT_PREFERENCES,
  DEFAULT_SELF_VIEW_CONFIG,
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
    console.log(
      '[useLayoutConfig] Loading preferences from localStorage:',
      stored
    );

    if (!stored) {
      console.log('[useLayoutConfig] No stored preferences, using defaults');
      return DEFAULT_LAYOUT_PREFERENCES;
    }

    const parsed = JSON.parse(stored);
    console.log('[useLayoutConfig] Parsed preferences:', parsed);
    // Validate and clamp maxTilesVisible to prevent pagination issues with small meetings
    const maxTiles =
      parsed.maxTilesVisible || DEFAULT_LAYOUT_PREFERENCES.maxTilesVisible;
    const validMaxTiles = Math.max(9, Math.min(25, maxTiles)); // Minimum 3x3 grid

    return {
      preferredMode:
        parsed.preferredMode || DEFAULT_LAYOUT_PREFERENCES.preferredMode,
      maxTilesVisible: validMaxTiles,
      hideNoVideo: parsed.hideNoVideo ?? DEFAULT_LAYOUT_PREFERENCES.hideNoVideo,
      selfView: parsed.selfView || undefined,
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
      selfView: prefs.selfView, // Load persisted self-view config
      pinnedParticipantId: null, // Session-only
      speakerParticipantId: null, // Session-only
      immersiveMode: false, // Session-only
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
        selfView: prev.selfView,
      });

      return updated;
    });
  }, []);

  /**
   * Set max tiles visible and persist to localStorage
   */
  const setMaxTiles = useCallback((count: number) => {
    const clamped = Math.max(9, Math.min(25, count)); // Clamp between 9-25 (minimum 3x3 grid)

    setLayoutConfig(prev => {
      const updated = { ...prev, maxTilesVisible: clamped };

      // Save to localStorage
      savePreferences({
        preferredMode: prev.mode,
        maxTilesVisible: clamped,
        hideNoVideo: prev.hideNoVideo,
        selfView: prev.selfView,
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
        selfView: prev.selfView,
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

  /**
   * Set pinned participant (local only, not synced - session-only)
   */
  const setPinnedParticipant = useCallback((participantId: string | null) => {
    setLayoutConfig(prev => ({
      ...prev,
      pinnedParticipantId: participantId,
    }));
  }, []);

  /**
   * Set speaker participant for speaker view (session-only)
   */
  const setSpeakerParticipant = useCallback((participantId: string | null) => {
    setLayoutConfig(prev => ({
      ...prev,
      speakerParticipantId: participantId,
    }));
  }, []);

  /**
   * Toggle immersive mode (fullscreen - session-only)
   */
  const setImmersiveMode = useCallback((enabled: boolean) => {
    setLayoutConfig(prev => ({
      ...prev,
      immersiveMode: enabled,
    }));
  }, []);

  /**
   * Update self-view configuration (persisted to localStorage)
   */
  const setSelfViewConfig = useCallback((config: Partial<SelfViewConfig>) => {
    setLayoutConfig(prev => {
      const updatedSelfView = prev.selfView
        ? { ...prev.selfView, ...config }
        : { ...DEFAULT_SELF_VIEW_CONFIG, ...config };

      const updated = { ...prev, selfView: updatedSelfView };

      // Save to localStorage
      savePreferences({
        preferredMode: prev.mode,
        maxTilesVisible: prev.maxTilesVisible,
        hideNoVideo: prev.hideNoVideo,
        selfView: updatedSelfView,
      });

      return updated;
    });
  }, []);

  return {
    layoutConfig,
    setLayoutMode,
    setMaxTiles,
    setHideNoVideo,
    setSpotlightParticipant,
    setPinnedParticipant,
    setSpeakerParticipant,
    setImmersiveMode,
    setSelfViewConfig,
  };
}
