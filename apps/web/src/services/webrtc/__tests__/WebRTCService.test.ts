/**
 * WebRTC Service Tests
 * Tests for P2P connection management and media streaming
 */

import { WebRTCService } from '../WebRTCService';
import type {
  ConnectionState,
  ConnectionQuality,
} from '@meetsolis/shared/types/webrtc';

// Mock simple-peer
jest.mock('simple-peer');
jest.mock('webrtc-adapter');

// Mock MediaStream and navigator.mediaDevices
const mockMediaStream = {
  getTracks: jest.fn(() => []),
  getAudioTracks: jest.fn(() => [{ enabled: true }]),
  getVideoTracks: jest.fn(() => [{ enabled: true }]),
} as unknown as MediaStream;

const mockGetUserMedia = jest.fn();

Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia,
  },
  writable: true,
});

describe('WebRTCService', () => {
  let service: WebRTCService;

  beforeEach(() => {
    service = new WebRTCService();
    jest.clearAllMocks();
  });

  afterEach(() => {
    service.destroy();
  });

  describe('initializeLocalStream', () => {
    it('should initialize local stream with default constraints', async () => {
      mockGetUserMedia.mockResolvedValue(mockMediaStream);

      const stream = await service.initializeLocalStream();

      expect(stream).toBe(mockMediaStream);
      expect(mockGetUserMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          audio: expect.objectContaining({
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          }),
          video: expect.objectContaining({
            width: expect.any(Object),
            height: expect.any(Object),
            frameRate: expect.any(Object),
          }),
        })
      );
    });

    it('should throw PERMISSION_DENIED error when permission is denied', async () => {
      const error = new DOMException('Permission denied', 'NotAllowedError');
      mockGetUserMedia.mockRejectedValue(error);

      await expect(service.initializeLocalStream()).rejects.toThrow(
        'Camera/microphone permission denied'
      );
    });

    it('should throw DEVICE_NOT_FOUND error when no device is found', async () => {
      const error = new DOMException('Device not found', 'NotFoundError');
      mockGetUserMedia.mockRejectedValue(error);

      await expect(service.initializeLocalStream()).rejects.toThrow(
        'No camera/microphone found'
      );
    });

    it('should initialize with custom constraints', async () => {
      mockGetUserMedia.mockResolvedValue(mockMediaStream);

      const customConstraints = {
        audio: false,
        video: { width: 640, height: 480 },
      };

      await service.initializeLocalStream(customConstraints);

      expect(mockGetUserMedia).toHaveBeenCalledWith(
        expect.objectContaining(customConstraints)
      );
    });
  });

  describe('createPeerConnection', () => {
    it('should throw error if local stream not initialized', async () => {
      const signalCallback = jest.fn();

      await expect(
        service.createPeerConnection('user123', signalCallback)
      ).rejects.toThrow('Local stream not initialized');
    });

    it('should create peer connection as initiator', async () => {
      mockGetUserMedia.mockResolvedValue(mockMediaStream);
      await service.initializeLocalStream();

      const signalCallback = jest.fn();
      await service.createPeerConnection('user123', signalCallback);

      // Verify peer connection was created (implementation detail)
      expect(service.getConnectionState('user123')).toBe('connecting');
    });
  });

  describe('toggleAudio', () => {
    it('should toggle audio tracks', async () => {
      mockGetUserMedia.mockResolvedValue(mockMediaStream);
      await service.initializeLocalStream();

      const audioTrack = { enabled: true };
      mockMediaStream.getAudioTracks = jest.fn(() => [audioTrack as any]);

      service.toggleAudio(true);

      expect(audioTrack.enabled).toBe(false);
    });

    it('should handle missing local stream', () => {
      expect(() => service.toggleAudio(true)).not.toThrow();
    });
  });

  describe('toggleVideo', () => {
    it('should toggle video tracks', async () => {
      mockGetUserMedia.mockResolvedValue(mockMediaStream);
      await service.initializeLocalStream();

      const videoTrack = { enabled: true };
      mockMediaStream.getVideoTracks = jest.fn(() => [videoTrack as any]);

      service.toggleVideo(true);

      expect(videoTrack.enabled).toBe(false);
    });

    it('should handle missing local stream', () => {
      expect(() => service.toggleVideo(true)).not.toThrow();
    });
  });

  describe('Event handlers', () => {
    it('should register onStream callback', () => {
      const callback = jest.fn();
      service.onStream(callback);

      // Callback should be stored (implementation detail)
      expect(() => service.onStream(callback)).not.toThrow();
    });

    it('should register onConnectionState callback', () => {
      const callback = jest.fn();
      service.onConnectionState(callback);

      expect(() => service.onConnectionState(callback)).not.toThrow();
    });

    it('should register onConnectionQuality callback', () => {
      const callback = jest.fn();
      service.onConnectionQuality(callback);

      expect(() => service.onConnectionQuality(callback)).not.toThrow();
    });

    it('should register onError callback', () => {
      const callback = jest.fn();
      service.onError(callback);

      expect(() => service.onError(callback)).not.toThrow();
    });
  });

  describe('Getters', () => {
    it('should get local stream', async () => {
      mockGetUserMedia.mockResolvedValue(mockMediaStream);
      await service.initializeLocalStream();

      expect(service.getLocalStream()).toBe(mockMediaStream);
    });

    it('should return null for local stream if not initialized', () => {
      expect(service.getLocalStream()).toBeNull();
    });

    it('should get remote stream by userId', () => {
      const stream = service.getRemoteStream('user123');
      expect(stream).toBeNull();
    });

    it('should get connection state', async () => {
      mockGetUserMedia.mockResolvedValue(mockMediaStream);
      await service.initializeLocalStream();

      const signalCallback = jest.fn();
      await service.createPeerConnection('user123', signalCallback);

      expect(service.getConnectionState('user123')).toBe('connecting');
    });

    it('should get all remote streams', () => {
      const streams = service.getAllRemoteStreams();
      expect(streams).toBeInstanceOf(Map);
      expect(streams.size).toBe(0);
    });
  });

  describe('destroy', () => {
    it('should cleanup all resources', async () => {
      mockGetUserMedia.mockResolvedValue(mockMediaStream);
      const stopMock = jest.fn();
      mockMediaStream.getTracks = jest.fn(() => [{ stop: stopMock } as any]);

      await service.initializeLocalStream();
      service.destroy();

      expect(stopMock).toHaveBeenCalled();
      expect(service.getLocalStream()).toBeNull();
    });

    it('should handle destroy when no resources exist', () => {
      expect(() => service.destroy()).not.toThrow();
    });
  });

  describe('closePeerConnection', () => {
    it('should close specific peer connection', async () => {
      mockGetUserMedia.mockResolvedValue(mockMediaStream);
      await service.initializeLocalStream();

      const signalCallback = jest.fn();
      await service.createPeerConnection('user123', signalCallback);

      service.closePeerConnection('user123');

      expect(service.getConnectionState('user123')).toBeUndefined();
    });

    it('should handle closing non-existent peer connection', () => {
      expect(() => service.closePeerConnection('nonexistent')).not.toThrow();
    });
  });
});
