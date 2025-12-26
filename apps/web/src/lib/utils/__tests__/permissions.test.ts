/**
 * Permission Utility Functions Tests
 * Story 2.5 - Role-Based Permissions
 */

import {
  isHost,
  isParticipant,
  canStartEndMeeting,
  canLockMeeting,
  canAdmitFromWaitingRoom,
  canMuteParticipants,
  canRemoveParticipants,
  canScreenShare,
  canSendChatMessages,
  canDeleteAnyMessage,
  canDeleteOwnMessage,
  canRegenerateInviteLink,
  canManageWhitelist,
} from '../permissions';

describe('Permission Utility Functions', () => {
  describe('Role Identification', () => {
    it('should correctly identify host role', () => {
      expect(isHost('host')).toBe(true);
      expect(isHost('participant')).toBe(false);
    });

    it('should correctly identify participant role', () => {
      expect(isParticipant('participant')).toBe(true);
      expect(isParticipant('host')).toBe(false);
    });
  });

  describe('Meeting Control Permissions', () => {
    it('should allow only host to start/end meeting', () => {
      expect(canStartEndMeeting('host')).toBe(true);
      expect(canStartEndMeeting('participant')).toBe(false);
    });

    it('should allow only host to lock meeting', () => {
      expect(canLockMeeting('host')).toBe(true);
      expect(canLockMeeting('participant')).toBe(false);
    });

    it('should allow only host to admit from waiting room', () => {
      expect(canAdmitFromWaitingRoom('host')).toBe(true);
      expect(canAdmitFromWaitingRoom('participant')).toBe(false);
    });

    it('should allow only host to mute participants', () => {
      expect(canMuteParticipants('host')).toBe(true);
      expect(canMuteParticipants('participant')).toBe(false);
    });

    it('should allow only host to remove participants', () => {
      expect(canRemoveParticipants('host')).toBe(true);
      expect(canRemoveParticipants('participant')).toBe(false);
    });
  });

  describe('Screen Sharing Permissions', () => {
    it('should always allow host to screen share', () => {
      expect(
        canScreenShare({
          role: 'host',
          meetingSettings: { allow_participant_screenshare: false },
        })
      ).toBe(true);

      expect(
        canScreenShare({
          role: 'host',
          meetingSettings: { allow_participant_screenshare: true },
        })
      ).toBe(true);
    });

    it('should allow participant to screen share when enabled', () => {
      expect(
        canScreenShare({
          role: 'participant',
          meetingSettings: { allow_participant_screenshare: true },
        })
      ).toBe(true);
    });

    it('should not allow participant to screen share when disabled', () => {
      expect(
        canScreenShare({
          role: 'participant',
          meetingSettings: { allow_participant_screenshare: false },
        })
      ).toBe(false);
    });

    it('should not allow participant to screen share when setting is undefined', () => {
      expect(
        canScreenShare({
          role: 'participant',
          meetingSettings: {},
        })
      ).toBe(false);
    });
  });

  describe('Chat Permissions', () => {
    it('should allow both host and participant to send messages', () => {
      expect(canSendChatMessages('host')).toBe(true);
      expect(canSendChatMessages('participant')).toBe(true);
    });

    it('should allow only host to delete any message', () => {
      expect(canDeleteAnyMessage('host')).toBe(true);
      expect(canDeleteAnyMessage('participant')).toBe(false);
    });

    it('should allow both host and participant to delete own messages', () => {
      expect(canDeleteOwnMessage('host')).toBe(true);
      expect(canDeleteOwnMessage('participant')).toBe(true);
    });
  });

  describe('Security Feature Permissions', () => {
    it('should allow only host to regenerate invite link', () => {
      expect(canRegenerateInviteLink('host')).toBe(true);
      expect(canRegenerateInviteLink('participant')).toBe(false);
    });

    it('should allow only host to manage whitelist', () => {
      expect(canManageWhitelist('host')).toBe(true);
      expect(canManageWhitelist('participant')).toBe(false);
    });
  });
});
