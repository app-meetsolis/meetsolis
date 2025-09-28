import { WebRTCTestUtils, CONNECTION_SCENARIOS } from '../mocks/webrtc-utils';

describe('WebRTC Connection Testing', () => {
  beforeEach(() => {
    // Reset WebRTC mocks before each test
    jest.clearAllMocks();
  });

  describe('MediaStream Management', () => {
    it('should create mock media stream with video and audio', () => {
      const stream = WebRTCTestUtils.createMockMediaStream({
        audio: true,
        video: true,
      });

      expect(stream.getTracks()).toHaveLength(2);
      expect(stream.getVideoTracks()).toHaveLength(1);
      expect(stream.getAudioTracks()).toHaveLength(1);
      expect(stream.active).toBe(true);
    });

    it('should create video-only stream', () => {
      const stream = WebRTCTestUtils.createMockMediaStream({
        audio: false,
        video: true,
      });

      expect(stream.getTracks()).toHaveLength(1);
      expect(stream.getVideoTracks()).toHaveLength(1);
      expect(stream.getAudioTracks()).toHaveLength(0);
    });

    it('should handle track operations', () => {
      const videoTrack = WebRTCTestUtils.createMockVideoTrack();
      const audioTrack = WebRTCTestUtils.createMockAudioTrack();

      expect(videoTrack.kind).toBe('video');
      expect(audioTrack.kind).toBe('audio');
      expect(videoTrack.readyState).toBe('live');
      expect(audioTrack.readyState).toBe('live');

      videoTrack.stop();
      expect(videoTrack.stop).toHaveBeenCalled();
    });
  });

  describe('Connection Scenarios', () => {
    it.each(CONNECTION_SCENARIOS)('should handle %s scenario', async (scenario) => {
      WebRTCTestUtils.simulateNetworkConditions(scenario);
      const { getUserMedia } = WebRTCTestUtils.mockMediaDevices(scenario);
      const peerConnection = WebRTCTestUtils.mockRTCPeerConnection(scenario);

      if (scenario === 'firewall-restricted') {
        await expect(getUserMedia({ video: true, audio: true }))
          .rejects.toThrow('Permission denied');
        expect(peerConnection.iceConnectionState).toBe('failed');
      } else {
        const stream = await getUserMedia({ video: true, audio: true });
        expect(stream).toBeDefined();
        expect(stream.getTracks).toBeDefined();
      }
    });
  });

  describe('Device Enumeration', () => {
    it('should enumerate available devices', () => {
      const { devices } = WebRTCTestUtils.mockMediaDevices();

      expect(devices).toContainEqual(
        expect.objectContaining({
          kind: 'videoinput',
          label: expect.stringContaining('Camera'),
        })
      );

      expect(devices).toContainEqual(
        expect.objectContaining({
          kind: 'audioinput',
          label: expect.stringContaining('Microphone'),
        })
      );
    });

    it('should simulate mobile device limitations', () => {
      const { devices } = WebRTCTestUtils.mockMediaDevices('mobile-network');

      // Mobile devices typically have fewer available devices
      const videoInputs = devices.filter(d => d.kind === 'videoinput');
      const audioInputs = devices.filter(d => d.kind === 'audioinput');

      expect(videoInputs.length).toBeLessThanOrEqual(2);
      expect(audioInputs.length).toBeLessThanOrEqual(2);
    });
  });

  describe('RTCPeerConnection', () => {
    it('should create offer and answer', async () => {
      const peerConnection = WebRTCTestUtils.mockRTCPeerConnection();

      const offer = await peerConnection.createOffer();
      expect(offer).toEqual({
        type: 'offer',
        sdp: 'mock-offer',
      });

      const answer = await peerConnection.createAnswer();
      expect(answer).toEqual({
        type: 'answer',
        sdp: 'mock-answer',
      });
    });

    it('should handle connection state changes', async () => {
      const peerConnection = WebRTCTestUtils.mockRTCPeerConnection('direct-connection');

      expect(peerConnection.connectionState).toBe('connected');
      expect(peerConnection.iceConnectionState).toBe('connected');
    });

    it('should fail in restricted networks', () => {
      const peerConnection = WebRTCTestUtils.mockRTCPeerConnection('firewall-restricted');

      expect(peerConnection.connectionState).toBe('failed');
      expect(peerConnection.iceConnectionState).toBe('failed');
    });

    it('should handle packet loss scenarios', async () => {
      const peerConnection = WebRTCTestUtils.mockRTCPeerConnection('packet-loss');

      // Some createOffer calls should fail randomly
      const results = await Promise.allSettled([
        peerConnection.createOffer(),
        peerConnection.createOffer(),
        peerConnection.createOffer(),
        peerConnection.createOffer(),
        peerConnection.createOffer(),
      ]);

      const successes = results.filter(r => r.status === 'fulfilled');
      const failures = results.filter(r => r.status === 'rejected');

      // In packet loss scenario, we expect some failures
      expect(failures.length).toBeGreaterThan(0);
      expect(successes.length).toBeGreaterThan(0);
    });
  });

  describe('Cross-browser compatibility', () => {
    it('should provide browser-specific configurations', () => {
      const { browserBehaviors } = require('../mocks/webrtc-utils');

      expect(browserBehaviors.chrome.supportedCodecs).toContain('VP8');
      expect(browserBehaviors.firefox.supportedCodecs).toContain('VP9');
      expect(browserBehaviors.safari.supportedCodecs).toContain('H264');
      expect(browserBehaviors.edge.iceServers).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('should handle getUserMedia failures gracefully', async () => {
      WebRTCTestUtils.mockMediaDevices('firewall-restricted');

      const getUserMedia = global.navigator.mediaDevices.getUserMedia;
      await expect(getUserMedia({ video: true }))
        .rejects.toThrow('Permission denied');
    });

    it('should timeout on slow connections', async () => {
      // Create a peer connection that won't connect
      const peerConnection = {
        connectionState: 'connecting', // Never reaches 'connected'
        iceConnectionState: 'new',
        addEventListener: jest.fn(),
      };

      const timeoutPromise = WebRTCTestUtils.waitForWebRTCConnection(peerConnection, 100);
      await expect(timeoutPromise).rejects.toThrow('WebRTC connection timeout');
    }, 10000);
  });
});