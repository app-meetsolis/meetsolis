/**
 * Layout Mode Types
 * Defines the different video layout modes available in the meeting room
 */

export type LayoutMode =
  | 'auto'
  | 'tiled'
  | 'spotlight'
  | 'sidebar'
  | 'speaker'
  | 'gallery';

/**
 * Self View Configuration
 * Controls the draggable self-view window
 */
export interface SelfViewConfig {
  /** Whether self-view is visible */
  visible: boolean;

  /** Position of self-view window (x, y coordinates) */
  position: { x: number; y: number };

  /** Size of self-view window */
  size: 'small' | 'medium' | 'large';
}

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

  /** User ID of the participant pinned by local user (local only, not synced) */
  pinnedParticipantId?: string | null;

  /** User ID of the participant currently shown as main speaker (for speaker view) */
  speakerParticipantId?: string | null;

  /** Self-view configuration (draggable window) */
  selfView?: SelfViewConfig;

  /** Whether immersive mode (fullscreen) is active */
  immersiveMode?: boolean;
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

  /** Self-view preferences (persisted) */
  selfView?: SelfViewConfig;
}

/**
 * Default self-view configuration
 * Uses static position that will be adjusted on client-side mount
 */
export const DEFAULT_SELF_VIEW_CONFIG: SelfViewConfig = {
  visible: true,
  position: { x: 0, y: 0 }, // Will be set to bottom-right on first mount (SSR-safe)
  size: 'small',
};

/**
 * Default layout configuration
 */
export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  mode: 'auto',
  maxTilesVisible: 25,
  hideNoVideo: false,
  spotlightParticipantId: null,
  pinnedParticipantId: null,
  speakerParticipantId: null,
  selfView: undefined, // Will use DEFAULT_SELF_VIEW_CONFIG when needed
  immersiveMode: false,
};

/**
 * Default layout preferences
 */
export const DEFAULT_LAYOUT_PREFERENCES: LayoutPreferences = {
  preferredMode: 'auto',
  maxTilesVisible: 25,
  hideNoVideo: false,
  selfView: undefined, // User can customize via UI
};

/**
 * localStorage key for layout preferences
 */
export const LAYOUT_PREFERENCES_STORAGE_KEY = 'meetsolis_layout_preferences';
