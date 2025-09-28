import { jest } from '@jest/globals';

// WebRTC testing scenarios
export const CONNECTION_SCENARIOS = [
  'direct-connection',
  'firewall-restricted',
  'low-bandwidth',
  'packet-loss',
  'mobile-network',
] as const;

export type ConnectionScenario = typeof CONNECTION_SCENARIOS[number];

// Cross-browser testing matrix
export const WEBRTC_TEST_BROWSERS = [
  'chrome',
  'firefox',
  'safari',
  'edge',
] as const;

export type WebRTCBrowser = typeof WEBRTC_TEST_BROWSERS[number];

// Mock MediaStream implementation
export interface MockMediaStream {
  getTracks(): MediaStreamTrack[];
  addTrack(track: MediaStreamTrack): void;
  removeTrack(track: MediaStreamTrack): void;
  getVideoTracks(): MediaStreamTrack[];
  getAudioTracks(): MediaStreamTrack[];
  id: string;
  active: boolean;
}

export interface MockMediaStreamTrack {
  kind: 'audio' | 'video';
  id: string;
  label: string;
  enabled: boolean;
  muted: boolean;
  readyState: 'live' | 'ended';
  stop(): void;
  clone(): MediaStreamTrack;
}

// WebRTC test utilities
export class WebRTCTestUtils {
  static createMockMediaStream(options: {
    audio?: boolean;
    video?: boolean;
    id?: string;
  } = {}): MockMediaStream {
    const { audio = true, video = true, id = 'test-stream' } = options;
    const tracks: MediaStreamTrack[] = [];

    if (audio) {
      tracks.push(this.createMockAudioTrack());
    }
    if (video) {
      tracks.push(this.createMockVideoTrack());
    }

    return {
      id,
      active: true,
      getTracks: jest.fn(() => tracks),
      getVideoTracks: jest.fn(() => tracks.filter(t => t.kind === 'video')),
      getAudioTracks: jest.fn(() => tracks.filter(t => t.kind === 'audio')),
      addTrack: jest.fn(),
      removeTrack: jest.fn(),
    } as MockMediaStream;
  }

  static createMockVideoTrack(options: {
    id?: string;
    label?: string;
    enabled?: boolean;
  } = {}): MockMediaStreamTrack {
    const { id = 'video-track', label = 'Mock Video', enabled = true } = options;

    return {
      kind: 'video',
      id,
      label,
      enabled,
      muted: false,
      readyState: 'live',
      stop: jest.fn(),
      clone: jest.fn(() => this.createMockVideoTrack(options)),
    } as MockMediaStreamTrack;
  }

  static createMockAudioTrack(options: {
    id?: string;
    label?: string;
    enabled?: boolean;
  } = {}): MockMediaStreamTrack {
    const { id = 'audio-track', label = 'Mock Audio', enabled = true } = options;

    return {
      kind: 'audio',
      id,
      label,
      enabled,
      muted: false,
      readyState: 'live',
      stop: jest.fn(),
      clone: jest.fn(() => this.createMockAudioTrack(options)),
    } as MockMediaStreamTrack;
  }

  static mockMediaDevices(scenario: ConnectionScenario = 'direct-connection') {
    const baseDevices = [
      { deviceId: 'camera1', kind: 'videoinput', label: 'Mock Camera 1' },
      { deviceId: 'camera2', kind: 'videoinput', label: 'Mock Camera 2' },
      { deviceId: 'mic1', kind: 'audioinput', label: 'Mock Microphone 1' },
      { deviceId: 'mic2', kind: 'audioinput', label: 'Mock Microphone 2' },
      { deviceId: 'speaker1', kind: 'audiooutput', label: 'Mock Speaker 1' },
    ];

    // Modify devices based on scenario
    const devices = scenario === 'mobile-network'
      ? baseDevices.filter(d => d.deviceId.includes('1')) // Fewer devices on mobile
      : baseDevices;

    const getUserMedia = jest.fn().mockImplementation((constraints) => {
      if (scenario === 'firewall-restricted') {
        return Promise.reject(new Error('Permission denied'));
      }

      return Promise.resolve(this.createMockMediaStream({
        audio: constraints?.audio,
        video: constraints?.video,
      }));
    });

    Object.defineProperty(global.navigator, 'mediaDevices', {
      writable: true,
      value: {
        getUserMedia,
        getDisplayMedia: jest.fn().mockResolvedValue(this.createMockMediaStream({ video: true })),
        enumerateDevices: jest.fn().mockResolvedValue(devices),
        getSupportedConstraints: jest.fn(() => ({
          width: true,
          height: true,
          frameRate: scenario !== 'low-bandwidth',
          facingMode: true,
          audio: true,
          video: true,
        })),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      },
    });

    return { getUserMedia, devices };
  }

  static mockRTCPeerConnection(scenario: ConnectionScenario = 'direct-connection') {
    const createOffer = jest.fn().mockImplementation(() => {
      if (scenario === 'packet-loss') {
        // Simulate intermittent failures
        return Math.random() > 0.3
          ? Promise.resolve({ type: 'offer', sdp: 'mock-offer' })
          : Promise.reject(new Error('Connection timeout'));
      }
      return Promise.resolve({ type: 'offer', sdp: 'mock-offer' });
    });

    const mockPeerConnection = {
      localDescription: null,
      remoteDescription: null,
      signalingState: 'stable',
      iceConnectionState: scenario === 'firewall-restricted' ? 'failed' : 'connected',
      connectionState: scenario === 'firewall-restricted' ? 'failed' : 'connected',
      iceGatheringState: 'complete',
      createOffer,
      createAnswer: jest.fn().mockResolvedValue({ type: 'answer', sdp: 'mock-answer' }),
      setLocalDescription: jest.fn().mockResolvedValue(undefined),
      setRemoteDescription: jest.fn().mockResolvedValue(undefined),
      addIceCandidate: jest.fn().mockResolvedValue(undefined),
      addTrack: jest.fn(),
      removeTrack: jest.fn(),
      getStats: jest.fn().mockResolvedValue(new Map()),
      close: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    };

    global.RTCPeerConnection = jest.fn(() => mockPeerConnection);
    return mockPeerConnection;
  }

  static simulateNetworkConditions(scenario: ConnectionScenario) {
    switch (scenario) {
      case 'low-bandwidth':
        // Simulate slower responses
        jest.setTimeout(10000);
        break;
      case 'packet-loss':
        // Some operations will randomly fail
        break;
      case 'mobile-network':
        // Limited device access
        break;
      case 'firewall-restricted':
        // Block most WebRTC operations
        break;
      default:
        // Direct connection - normal behavior
        break;
    }
  }

  static async waitForWebRTCConnection(peerConnection: any, timeout = 5000): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('WebRTC connection timeout'));
      }, timeout);

      const checkConnection = () => {
        if (peerConnection.connectionState === 'connected') {
          clearTimeout(timeoutId);
          resolve();
        }
      };

      // For low-bandwidth scenario, always timeout
      if (peerConnection.iceConnectionState === 'new' && timeout < 1000) {
        setTimeout(() => {
          reject(new Error('WebRTC connection timeout'));
        }, timeout);
        return;
      }

      peerConnection.addEventListener('connectionstatechange', checkConnection);
      checkConnection(); // Check immediately in case already connected
    });
  }
}

// Test helpers for different browser behaviors
export const browserBehaviors = {
  chrome: {
    supportedCodecs: ['VP8', 'VP9', 'H264', 'AV1'],
    iceServers: ['stun:stun.l.google.com:19302'],
  },
  firefox: {
    supportedCodecs: ['VP8', 'VP9', 'H264'],
    iceServers: ['stun:stun.services.mozilla.com'],
  },
  safari: {
    supportedCodecs: ['H264', 'VP8'],
    iceServers: ['stun:stun.apple.com'],
  },
  edge: {
    supportedCodecs: ['VP8', 'H264'],
    iceServers: ['stun:stun.l.google.com:19302'],
  },
};