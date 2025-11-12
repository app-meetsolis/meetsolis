/**
 * Device Testing Wizard Unit Tests
 * Story 1.8: User Onboarding & Experience Risk Mitigation
 */

import { DeviceTestingWizard } from '@/lib/onboarding/DeviceTestingWizard';

// Mock AudioContext
global.AudioContext = jest.fn().mockImplementation(() => ({
  createMediaStreamSource: jest.fn(() => ({
    connect: jest.fn()
  })),
  createAnalyser: jest.fn(() => ({
    frequencyBinCount: 1024,
    getByteTimeDomainData: jest.fn((array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = 128 + Math.random() * 50;
      }
    })
  })),
  close: jest.fn()
})) as any;

describe('DeviceTestingWizard', () => {
  let wizard: DeviceTestingWizard;

  beforeEach(() => {
    wizard = new DeviceTestingWizard();
    jest.clearAllMocks();
  });

  describe('Camera Testing', () => {
    it('should detect available camera successfully', async () => {
      const mockTrack = {
        getSettings: () => ({
          width: 1920,
          height: 1080,
          frameRate: 30
        }),
        stop: jest.fn()
      };

      const mockStream = {
        getVideoTracks: () => [mockTrack],
        getTracks: () => [mockTrack]
      };

      (navigator.mediaDevices.getUserMedia as jest.Mock).mockResolvedValue(mockStream);

      const result = await wizard.testCamera();

      expect(result.available).toBe(true);
      expect(result.resolution).toBe('1920x1080');
      expect(result.frameRate).toBe(30);
      expect(result.error).toBeUndefined();
    });

    it('should handle camera permission denied', async () => {
      (navigator.mediaDevices.getUserMedia as jest.Mock).mockRejectedValue(
        new Error('Permission denied')
      );

      const result = await wizard.testCamera();

      expect(result.available).toBe(false);
      expect(result.resolution).toBe('N/A');
      expect(result.error).toBe('Permission denied');
    });
  });

  describe('Microphone Testing', () => {
    it('should detect available microphone successfully', async () => {
      const mockTrack = { stop: jest.fn() };
      const mockStream = {
        getAudioTracks: () => [mockTrack],
        getTracks: () => [mockTrack]
      };

      (navigator.mediaDevices.getUserMedia as jest.Mock).mockResolvedValue(mockStream);

      const result = await wizard.testMicrophone();

      expect(result.available).toBe(true);
      expect(result.volume).toBeGreaterThanOrEqual(0);
      expect(['excellent', 'good', 'poor']).toContain(result.quality);
    });

    it('should handle microphone permission denied', async () => {
      (navigator.mediaDevices.getUserMedia as jest.Mock).mockRejectedValue(
        new Error('Permission denied')
      );

      const result = await wizard.testMicrophone();

      expect(result.available).toBe(false);
      expect(result.volume).toBe(0);
      expect(result.quality).toBe('poor');
    });
  });

  describe('Speaker Testing', () => {
    it('should detect speakers when available', async () => {
      (navigator.mediaDevices.enumerateDevices as jest.Mock).mockResolvedValue([
        { kind: 'audiooutput', deviceId: '1', label: 'Speakers' }
      ]);

      const result = await wizard.testSpeakers();

      expect(result.available).toBe(true);
      expect(result.testPassed).toBe(true);
    });

    it('should handle no audio output devices', async () => {
      (navigator.mediaDevices.enumerateDevices as jest.Mock).mockResolvedValue([]);

      const result = await wizard.testSpeakers();

      expect(result.available).toBe(false);
      expect(result.testPassed).toBe(false);
      expect(result.error).toContain('No audio output devices found');
    });
  });

  describe('Troubleshooting Guide Generation', () => {
    it('should generate guides for failed devices', () => {
      const testResult = {
        camera: { available: false, resolution: 'N/A', frameRate: 0, error: 'Permission denied' },
        microphone: { available: true, volume: 50, quality: 'good' as const },
        speakers: { available: true, testPassed: true }
      };

      const guides = wizard.generateTroubleshootingGuide(testResult);

      expect(guides.length).toBeGreaterThan(0);
      expect(guides[0].issue).toContain('Camera');
      expect(guides[0].steps.length).toBeGreaterThan(0);
      expect(guides[0].commonCauses.length).toBeGreaterThan(0);
    });

    it('should return empty array when all devices work', () => {
      const testResult = {
        camera: { available: true, resolution: '1920x1080', frameRate: 30 },
        microphone: { available: true, volume: 70, quality: 'excellent' as const },
        speakers: { available: true, testPassed: true }
      };

      const guides = wizard.generateTroubleshootingGuide(testResult);

      expect(guides).toEqual([]);
    });

    it('should generate quality warning for poor microphone', () => {
      const testResult = {
        camera: { available: true, resolution: '1920x1080', frameRate: 30 },
        microphone: { available: true, volume: 20, quality: 'poor' as const },
        speakers: { available: true, testPassed: true }
      };

      const guides = wizard.generateTroubleshootingGuide(testResult);

      expect(guides.some(g => g.issue.toLowerCase().includes('quality'))).toBe(true);
    });
  });

  describe('Device Enumeration', () => {
    it('should list available devices', async () => {
      (navigator.mediaDevices.enumerateDevices as jest.Mock).mockResolvedValue([
        { kind: 'videoinput', deviceId: '1', label: 'Camera 1' },
        { kind: 'audioinput', deviceId: '2', label: 'Microphone 1' },
        { kind: 'audiooutput', deviceId: '3', label: 'Speakers 1' }
      ]);

      const devices = await wizard.getAvailableDevices();

      expect(devices.cameras.length).toBe(1);
      expect(devices.microphones.length).toBe(1);
      expect(devices.speakers.length).toBe(1);
    });

    it('should handle device enumeration errors gracefully', async () => {
      (navigator.mediaDevices.enumerateDevices as jest.Mock).mockRejectedValue(
        new Error('Permission denied')
      );

      const devices = await wizard.getAvailableDevices();

      expect(devices.cameras).toEqual([]);
      expect(devices.microphones).toEqual([]);
      expect(devices.speakers).toEqual([]);
    });
  });
});
