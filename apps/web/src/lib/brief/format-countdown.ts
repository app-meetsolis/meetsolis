/**
 * Coach Brief countdown formatting (Story 6.4).
 * "in 47 minutes" / "in 1 hour" / "starts now" / "started 5 min ago".
 */

import { differenceInMinutes } from 'date-fns';

/**
 * Human-readable countdown to a session start.
 * @param startTime session start
 * @param now       reference time (injectable for tests)
 */
export function formatCountdown(
  startTime: Date,
  now: Date = new Date()
): string {
  const diffMin = differenceInMinutes(startTime, now);

  if (diffMin > 60) {
    const hours = Math.floor(diffMin / 60);
    return `in ${hours} hour${hours > 1 ? 's' : ''}`;
  }
  if (diffMin > 1) return `in ${diffMin} minutes`;
  if (diffMin >= -1) return 'starts now';
  if (diffMin >= -30) return `started ${Math.abs(diffMin)} min ago`;
  return 'session ended';
}

/**
 * Whether a brief should still surface in the dashboard.
 * True until 2 hours after the session start (recovery window).
 */
export function isBriefRecoverable(
  startTime: Date,
  now: Date = new Date()
): boolean {
  return differenceInMinutes(startTime, now) >= -120;
}
