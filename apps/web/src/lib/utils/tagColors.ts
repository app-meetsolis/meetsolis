/**
 * Tag Color Utilities
 * Story 2.5: Client Tags & Labels
 *
 * Provides consistent color assignment for client tags using hash-based distribution.
 */

/**
 * Tailwind color palette for tags (100-level colors for subtle backgrounds)
 */
export const TAG_COLORS = [
  '#DBEAFE', // Blue (Tailwind blue-100)
  '#D1FAE5', // Green (Tailwind green-100)
  '#FEF3C7', // Yellow (Tailwind yellow-100)
  '#FEE2E2', // Red (Tailwind red-100)
  '#EDE9FE', // Purple (Tailwind purple-100)
  '#FCE7F3', // Pink (Tailwind pink-100)
  '#FFEDD5', // Orange (Tailwind orange-100)
  '#F3F4F6', // Gray (Tailwind gray-100)
] as const;

/**
 * Predefined tags shown in autocomplete
 */
export const PREDEFINED_TAGS = [
  'VIP',
  'High Priority',
  'On Hold',
  'Active',
  'Inactive',
] as const;

/**
 * Get consistent color for a tag using hash function
 * Same tag always returns same color across renders
 *
 * @param tag - Tag string to get color for
 * @returns Hex color code from TAG_COLORS palette
 */
export function getTagColor(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}
