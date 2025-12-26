/**
 * Permission Utility Functions
 * Story 2.5 - Role-Based Permissions (Simplified to 2 roles: host, participant)
 */

export type UserRole = 'host' | 'participant';

export interface PermissionContext {
  role: UserRole;
  meetingSettings?: {
    allow_participant_screenshare?: boolean;
  };
}

/**
 * Check if user is host
 */
export function isHost(role: UserRole): boolean {
  return role === 'host';
}

/**
 * Check if user is participant
 */
export function isParticipant(role: UserRole): boolean {
  return role === 'participant';
}

/**
 * Check if user can start/end meeting
 */
export function canStartEndMeeting(role: UserRole): boolean {
  return isHost(role);
}

/**
 * Check if user can lock meeting
 */
export function canLockMeeting(role: UserRole): boolean {
  return isHost(role);
}

/**
 * Check if user can admit from waiting room
 */
export function canAdmitFromWaitingRoom(role: UserRole): boolean {
  return isHost(role);
}

/**
 * Check if user can mute participants
 */
export function canMuteParticipants(role: UserRole): boolean {
  return isHost(role);
}

/**
 * Check if user can remove participants
 */
export function canRemoveParticipants(role: UserRole): boolean {
  return isHost(role);
}

/**
 * Check if user can screen share
 */
export function canScreenShare(context: PermissionContext): boolean {
  // Host can always screen share
  if (isHost(context.role)) {
    return true;
  }

  // Participants can screen share if meeting allows it
  return context.meetingSettings?.allow_participant_screenshare === true;
}

/**
 * Check if user can send chat messages
 */
export function canSendChatMessages(role: UserRole): boolean {
  return true; // Both host and participant can send messages
}

/**
 * Check if user can delete any message
 */
export function canDeleteAnyMessage(role: UserRole): boolean {
  return isHost(role);
}

/**
 * Check if user can delete own messages
 */
export function canDeleteOwnMessage(role: UserRole): boolean {
  return true; // Both host and participant can delete their own messages
}

/**
 * Check if user can regenerate invite link
 */
export function canRegenerateInviteLink(role: UserRole): boolean {
  return isHost(role);
}

/**
 * Check if user can manage whitelist
 */
export function canManageWhitelist(role: UserRole): boolean {
  return isHost(role);
}

/**
 * Permission matrix for reference
 *
 * | Action                    | Host | Participant |
 * |---------------------------|------|-------------|
 * | Start/End meeting         | ✅   | ❌          |
 * | Lock meeting              | ✅   | ❌          |
 * | Admit from waiting room   | ✅   | ❌          |
 * | Mute participants         | ✅   | ❌          |
 * | Remove participants       | ✅   | ❌          |
 * | Share screen              | ✅   | If enabled  |
 * | Send chat messages        | ✅   | ✅          |
 * | Delete any message        | ✅   | ❌          |
 * | Delete own message        | ✅   | ✅          |
 * | Regenerate invite link    | ✅   | ❌          |
 * | Manage whitelist          | ✅   | ❌          |
 */
