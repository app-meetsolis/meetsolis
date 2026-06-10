/**
 * Story 7.7 — deterministic avatar monogram color picker.
 *
 * Given a client's name, returns one of 8 background hex codes from a curated
 * palette that work for white-text monograms on either light or dark cards.
 *
 * The mapping is stable: same name → same color across renders, devices, sessions.
 * Uses a simple string-hash of the trimmed lowercased name. Tiny + portable.
 */

const MONOGRAM_PALETTE = [
  '#0F766E', // teal-700
  '#0E7490', // cyan-700
  '#1D4ED8', // blue-700
  '#5B21B6', // violet-800
  '#9D174D', // pink-800
  '#B45309', // amber-700
  '#15803D', // green-700
  '#374151', // gray-700
] as const;

export type MonogramColor = (typeof MONOGRAM_PALETTE)[number];

export const MONOGRAM_COLORS: readonly MonogramColor[] = MONOGRAM_PALETTE;

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0; // convert to int32
  }
  return Math.abs(hash);
}

export function getMonogramColor(
  name: string | null | undefined
): MonogramColor {
  const normalized = (name ?? '').trim().toLowerCase();
  if (!normalized) return MONOGRAM_PALETTE[0];
  return MONOGRAM_PALETTE[hashString(normalized) % MONOGRAM_PALETTE.length];
}
