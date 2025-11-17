/**
 * Signaling Service Tests
 * Tests for Supabase Realtime signaling functionality
 */

import { SignalingService } from '../SignalingService';

// Mock Supabase
const mockChannel = {
  on: jest.fn(() => mockChannel),
  subscribe: jest.fn(callback => {
    callback('SUBSCRIBED', null);
    return mockChannel;
  }),
  unsubscribe: jest.fn(),
  send: jest.fn(),
  track: jest.fn(),
  untrack: jest.fn(),
  presenceState: jest.fn(() => Promise.resolve({})),
};

const mockSupabase = {
  channel: jest.fn(() => mockChannel),
  removeChannel: jest.fn(),
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase),
}));

// Mock env config
jest.mock('@/lib/config/env', () => ({
  config: {
    supabase: {
      url: 'https://test.supabase.co',
      anonKey: 'test-anon-key',
    },
  },
}));

describe('SignalingService', () => {
  let service: SignalingService;

  beforeEach(() => {
    service = new SignalingService();
    jest.clearAllMocks();

    // Reset subscribe mock to default implementation
    mockChannel.subscribe.mockImplementation(callback => {
      callback('SUBSCRIBED', null);
      return mockChannel;
    });
  });

  afterEach(async () => {
    await service.disconnect();
  });

  describe('connect', () => {
    it('should connect to signaling channel', async () => {
      const callbacks = {
        onOffer: jest.fn(),
        onAnswer: jest.fn(),
        onIceCandidate: jest.fn(),
      };

      await service.connect('meeting-123', 'user-456', callbacks);

      expect(mockSupabase.channel).toHaveBeenCalledWith(
        'meeting:meeting-123',
        expect.objectContaining({
          config: expect.objectContaining({
            presence: { key: 'user-456' },
            broadcast: { self: false },
          }),
        })
      );

      expect(mockChannel.subscribe).toHaveBeenCalled();
      expect(mockChannel.track).toHaveBeenCalledWith({
        userId: 'user-456',
        timestamp: expect.any(Number),
      });
    });

    it('should setup event handlers', async () => {
      const callbacks = {
        onOffer: jest.fn(),
        onAnswer: jest.fn(),
        onIceCandidate: jest.fn(),
        onParticipantJoined: jest.fn(),
        onParticipantLeft: jest.fn(),
      };

      await service.connect('meeting-123', 'user-456', callbacks);

      // Verify event handlers were registered
      expect(mockChannel.on).toHaveBeenCalledWith(
        'broadcast',
        { event: 'offer' },
        expect.any(Function)
      );

      expect(mockChannel.on).toHaveBeenCalledWith(
        'broadcast',
        { event: 'answer' },
        expect.any(Function)
      );

      expect(mockChannel.on).toHaveBeenCalledWith(
        'broadcast',
        { event: 'ice-candidate' },
        expect.any(Function)
      );

      expect(mockChannel.on).toHaveBeenCalledWith(
        'presence',
        { event: 'join' },
        expect.any(Function)
      );

      expect(mockChannel.on).toHaveBeenCalledWith(
        'presence',
        { event: 'leave' },
        expect.any(Function)
      );
    });

    it('should reject on connection timeout', async () => {
      mockChannel.subscribe.mockImplementation(callback => {
        callback('TIMED_OUT', null);
        return mockChannel;
      });

      const callbacks = {};

      await expect(
        service.connect('meeting-123', 'user-456', callbacks)
      ).rejects.toThrow('Channel subscription timed out');
    });

    it('should reject on channel error', async () => {
      const error = new Error('Channel error');
      mockChannel.subscribe.mockImplementation(callback => {
        callback('CHANNEL_ERROR', error);
        return mockChannel;
      });

      const callbacks = {};

      await expect(
        service.connect('meeting-123', 'user-456', callbacks)
      ).rejects.toThrow('Channel error');
    });

    it('should warn if already connected', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      await service.connect('meeting-123', 'user-456', {});
      await service.connect('meeting-456', 'user-789', {}); // Second connect

      expect(consoleSpy).toHaveBeenCalledWith(
        'Already connected to a signaling channel'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('sendOffer', () => {
    it('should send WebRTC offer', async () => {
      await service.connect('meeting-123', 'user-456', {});

      const sdp: RTCSessionDescriptionInit = {
        type: 'offer',
        sdp: 'test-sdp-content',
      };

      await service.sendOffer(sdp);

      expect(mockChannel.send).toHaveBeenCalledWith({
        type: 'broadcast',
        event: 'offer',
        payload: {
          sdp,
          userId: 'user-456',
          timestamp: expect.any(Number),
        },
      });
    });

    it('should throw error if not connected', async () => {
      const sdp: RTCSessionDescriptionInit = {
        type: 'offer',
        sdp: 'test-sdp',
      };

      await expect(service.sendOffer(sdp)).rejects.toThrow(
        'Not connected to signaling channel'
      );
    });
  });

  describe('sendAnswer', () => {
    it('should send WebRTC answer', async () => {
      await service.connect('meeting-123', 'user-456', {});

      const sdp: RTCSessionDescriptionInit = {
        type: 'answer',
        sdp: 'test-sdp-content',
      };

      await service.sendAnswer(sdp);

      expect(mockChannel.send).toHaveBeenCalledWith({
        type: 'broadcast',
        event: 'answer',
        payload: {
          sdp,
          userId: 'user-456',
          timestamp: expect.any(Number),
        },
      });
    });

    it('should throw error if not connected', async () => {
      const sdp: RTCSessionDescriptionInit = {
        type: 'answer',
        sdp: 'test-sdp',
      };

      await expect(service.sendAnswer(sdp)).rejects.toThrow(
        'Not connected to signaling channel'
      );
    });
  });

  describe('sendIceCandidate', () => {
    it('should send ICE candidate', async () => {
      await service.connect('meeting-123', 'user-456', {});

      const candidate = {
        candidate: 'test-candidate',
        sdpMLineIndex: 0,
        sdpMid: '0',
        toJSON: () => ({
          candidate: 'test-candidate',
          sdpMLineIndex: 0,
          sdpMid: '0',
        }),
      } as RTCIceCandidate;

      await service.sendIceCandidate(candidate);

      expect(mockChannel.send).toHaveBeenCalledWith({
        type: 'broadcast',
        event: 'ice-candidate',
        payload: {
          candidate: candidate.toJSON(),
          userId: 'user-456',
        },
      });
    });

    it('should throw error if not connected', async () => {
      const candidate = {
        toJSON: () => ({}),
      } as RTCIceCandidate;

      await expect(service.sendIceCandidate(candidate)).rejects.toThrow(
        'Not connected to signaling channel'
      );
    });
  });

  describe('getParticipants', () => {
    it('should return list of participants', async () => {
      mockChannel.presenceState.mockResolvedValue({
        'user-456': {},
        'user-789': {},
        'user-012': {},
      });

      await service.connect('meeting-123', 'user-456', {});

      const participants = await service.getParticipants();

      // Should exclude own userId
      expect(participants).toEqual(['user-789', 'user-012']);
    });

    it('should return empty array if not connected', async () => {
      const participants = await service.getParticipants();
      expect(participants).toEqual([]);
    });
  });

  describe('disconnect', () => {
    it('should disconnect from signaling channel', async () => {
      await service.connect('meeting-123', 'user-456', {});

      await service.disconnect();

      expect(mockChannel.untrack).toHaveBeenCalled();
      expect(mockChannel.unsubscribe).toHaveBeenCalled();
      expect(mockSupabase.removeChannel).toHaveBeenCalledWith(mockChannel);
      expect(service.isConnected()).toBe(false);
    });

    it('should handle disconnect when not connected', async () => {
      await expect(service.disconnect()).resolves.not.toThrow();
    });

    it('should handle errors during disconnect', async () => {
      await service.connect('meeting-123', 'user-456', {});

      mockChannel.untrack.mockRejectedValue(new Error('Untrack error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await service.disconnect();

      expect(consoleSpy).toHaveBeenCalled();
      expect(service.isConnected()).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  describe('Getters', () => {
    it('should return connection status', async () => {
      expect(service.isConnected()).toBe(false);

      await service.connect('meeting-123', 'user-456', {});
      expect(service.isConnected()).toBe(true);

      await service.disconnect();
      expect(service.isConnected()).toBe(false);
    });

    it('should return meeting ID', async () => {
      expect(service.getMeetingId()).toBeNull();

      await service.connect('meeting-123', 'user-456', {});
      expect(service.getMeetingId()).toBe('meeting-123');

      await service.disconnect();
      expect(service.getMeetingId()).toBeNull();
    });

    it('should return user ID', async () => {
      expect(service.getUserId()).toBeNull();

      await service.connect('meeting-123', 'user-456', {});
      expect(service.getUserId()).toBe('user-456');

      await service.disconnect();
      expect(service.getUserId()).toBeNull();
    });
  });
});
