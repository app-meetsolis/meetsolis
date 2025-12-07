/**
 * Layout Preview Icons
 * Visual representations of different layout modes for the Adjust View dialog
 */

import React from 'react';

interface LayoutIconProps {
  className?: string;
}

/**
 * Auto (Dynamic) Layout Icon
 * Shows 4 equal-sized tiles in a grid pattern
 */
export function AutoLayoutIcon({ className = '' }: LayoutIconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="8"
        y="8"
        width="38"
        height="38"
        rx="4"
        fill="currentColor"
        opacity="0.3"
      />
      <rect
        x="54"
        y="8"
        width="38"
        height="38"
        rx="4"
        fill="currentColor"
        opacity="0.3"
      />
      <rect
        x="8"
        y="54"
        width="38"
        height="38"
        rx="4"
        fill="currentColor"
        opacity="0.3"
      />
      <rect
        x="54"
        y="54"
        width="38"
        height="38"
        rx="4"
        fill="currentColor"
        opacity="0.3"
      />
    </svg>
  );
}

/**
 * Tiled (Legacy) Layout Icon
 * Shows equal-sized grid tiles with equal emphasis
 */
export function TiledLayoutIcon({ className = '' }: LayoutIconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="5"
        y="5"
        width="26"
        height="26"
        rx="3"
        fill="currentColor"
        opacity="0.3"
      />
      <rect
        x="37"
        y="5"
        width="26"
        height="26"
        rx="3"
        fill="currentColor"
        opacity="0.3"
      />
      <rect
        x="69"
        y="5"
        width="26"
        height="26"
        rx="3"
        fill="currentColor"
        opacity="0.3"
      />
      <rect
        x="5"
        y="37"
        width="26"
        height="26"
        rx="3"
        fill="currentColor"
        opacity="0.3"
      />
      <rect
        x="37"
        y="37"
        width="26"
        height="26"
        rx="3"
        fill="currentColor"
        opacity="0.3"
      />
      <rect
        x="69"
        y="37"
        width="26"
        height="26"
        rx="3"
        fill="currentColor"
        opacity="0.3"
      />
      <rect
        x="5"
        y="69"
        width="26"
        height="26"
        rx="3"
        fill="currentColor"
        opacity="0.3"
      />
      <rect
        x="37"
        y="69"
        width="26"
        height="26"
        rx="3"
        fill="currentColor"
        opacity="0.3"
      />
      <rect
        x="69"
        y="69"
        width="26"
        height="26"
        rx="3"
        fill="currentColor"
        opacity="0.3"
      />
    </svg>
  );
}

/**
 * Spotlight Layout Icon
 * Shows 1 large rectangle (main video) + smaller strip below (thumbnails)
 */
export function SpotlightLayoutIcon({ className = '' }: LayoutIconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main spotlight video */}
      <rect
        x="8"
        y="8"
        width="84"
        height="60"
        rx="4"
        fill="currentColor"
        opacity="0.4"
      />

      {/* Thumbnail strip */}
      <rect
        x="8"
        y="75"
        width="22"
        height="17"
        rx="2"
        fill="currentColor"
        opacity="0.25"
      />
      <rect
        x="35"
        y="75"
        width="22"
        height="17"
        rx="2"
        fill="currentColor"
        opacity="0.25"
      />
      <rect
        x="62"
        y="75"
        width="22"
        height="17"
        rx="2"
        fill="currentColor"
        opacity="0.25"
      />
    </svg>
  );
}

/**
 * Sidebar Layout Icon
 * Shows large rectangle on left (main) + vertical stack on right (sidebar)
 */
export function SidebarLayoutIcon({ className = '' }: LayoutIconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main video area */}
      <rect
        x="8"
        y="8"
        width="56"
        height="84"
        rx="4"
        fill="currentColor"
        opacity="0.4"
      />

      {/* Sidebar tiles */}
      <rect
        x="70"
        y="8"
        width="22"
        height="25"
        rx="3"
        fill="currentColor"
        opacity="0.25"
      />
      <rect
        x="70"
        y="38"
        width="22"
        height="25"
        rx="3"
        fill="currentColor"
        opacity="0.25"
      />
      <rect
        x="70"
        y="68"
        width="22"
        height="25"
        rx="3"
        fill="currentColor"
        opacity="0.25"
      />
    </svg>
  );
}
