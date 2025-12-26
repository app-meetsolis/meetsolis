/**
 * Screen Share Helper Utilities
 * Detect and prioritize screen share participants from Stream SDK
 */

import type { StreamVideoParticipant } from '@stream-io/video-react-sdk';
import { hasScreenShare } from '@stream-io/video-client';

/**
 * Check if participant is sharing their screen
 * Uses Stream SDK's official hasScreenShare function
 */
export function isScreenShareParticipant(
  participant: StreamVideoParticipant
): boolean {
  const result = hasScreenShare(participant);
  console.log('[screenShareHelpers] Checking participant:', {
    userId: participant.userId,
    name: participant.name,
    publishedTracks: participant.publishedTracks?.length,
    hasScreenShare: result,
  });
  return result;
}

/**
 * Get screen share participant from list
 * Returns the first participant that is screen sharing
 */
export function getScreenShareParticipant(
  participants: StreamVideoParticipant[]
): StreamVideoParticipant | null {
  return participants.find(isScreenShareParticipant) || null;
}

/**
 * Filter out screen share participants from regular participants
 * Use this to get only camera/video participants
 */
export function filterRegularParticipants(
  participants: StreamVideoParticipant[]
): StreamVideoParticipant[] {
  return participants.filter(p => !isScreenShareParticipant(p));
}

/**
 * Get display name for participant
 * Screen share participants show as "User's Screen"
 */
export function getParticipantDisplayName(
  participant: StreamVideoParticipant
): string {
  if (isScreenShareParticipant(participant)) {
    // Extract user name from screen share participant
    // sessionId format: "userId:screen"
    const userName = participant.name || participant.userId;
    return `${userName}'s Screen`;
  }
  return participant.name || participant.userId;
}
