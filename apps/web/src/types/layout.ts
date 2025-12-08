/**
 * Layout Mode Types
 * Defines the different video layout modes available in the meeting room
 */

export type LayoutMode = 'auto' | 'tiled' | 'spotlight' | 'sidebar';

/**
 * Layout Configuration
 * Runtime configuration for the current meeting layout
 */
export interface LayoutConfig {
  /** Current layout mode */
  mode: LayoutMode;

  /** Maximum number of video tiles to display (1-25) */
  maxTilesVisible: number;

  /** Hide participants who have their camera off */
  hideNoVideo: boolean;

  /** User ID of the participant currently in spotlight (for spotlight mode) */
  spotlightParticipantId?: string | null;
}

/**
 * Layout Preferences
 * User preferences saved to localStorage
 */
export interface LayoutPreferences {
  /** Preferred layout mode (default: 'auto') */
  preferredMode: LayoutMode;

  /** Preferred max tiles visible (default: 25) */
  maxTilesVisible: number;

  /** Preferred hide no-video setting (default: false) */
  hideNoVideo: boolean;
}

/**
 * Default layout configuration
 */
export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  mode: 'auto',
  maxTilesVisible: 25,
  hideNoVideo: false,
  spotlightParticipantId: null,
};

/**
 * Default layout preferences
 */
export const DEFAULT_LAYOUT_PREFERENCES: LayoutPreferences = {
  preferredMode: 'auto',
  maxTilesVisible: 25,
  hideNoVideo: false,
};

/**
 * localStorage key for layout preferences
 */
export const LAYOUT_PREFERENCES_STORAGE_KEY = 'meetsolis_layout_preferences';
