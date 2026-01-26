/**
 * Tier Limits
 * Story 2.5: Client Tags & Labels
 *
 * Constants for free/pro tier limits
 */

/**
 * Maximum tags per client for free tier
 */
export const MAX_TAGS_FREE = 3;

/**
 * Maximum tags per client for pro tier
 */
export const MAX_TAGS_PRO = 50;

/**
 * Get max tags allowed for a user tier
 *
 * @param tier - User tier ('free' or 'pro')
 * @returns Maximum number of tags allowed
 */
export function getMaxTags(tier: 'free' | 'pro'): number {
  return tier === 'free' ? MAX_TAGS_FREE : MAX_TAGS_PRO;
}
