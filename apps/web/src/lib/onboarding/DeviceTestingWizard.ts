/**
 * Device Testing Wizard
 * Story 1.8: User Onboarding & Experience Risk Mitigation
 */

import { DeviceTestResult, TroubleshootingGuide } from '@/types/onboarding';

export class DeviceTestingWizard {
  /**
   * Test all devices (camera, microphone, speakers)
   */
  async testDevices(): Promise<DeviceTestResult> {
    const result: DeviceTestResult = {
      camera: await this.testCamera(),
      microphone: await this.testMicrophone(),
      speakers: await this.testSpeakers()
    };

    return result;
  }

  /**
   * Test camera availability and quality
   */
  async testCamera(): Promise<DeviceTestResult['camera']> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true
      });

      const videoTrack = stream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();

      // Clean up
      stream.getTracks().forEach(track => track.stop());

      return {
        available: true,
        resolution: `${settings.width}x${settings.height}`,
        frameRate: settings.frameRate || 30,
      };
    } catch (error) {
      return {
        available: false,
        resolution: 'N/A',
        frameRate: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test microphone availability and quality
   */
  async testMicrophone(): Promise<DeviceTestResult['microphone']> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });

      const audioTrack = stream.getAudioTracks()[0];

      // Test volume level
      const audioContext = new AudioContext();
      const mediaStreamSource = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      mediaStreamSource.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteTimeDomainData(dataArray);

      const volume = this.calculateVolume(dataArray);
      const quality = this.assessMicrophoneQuality(volume);

      // Clean up
      stream.getTracks().forEach(track => track.stop());
      audioContext.close();

      return {
        available: true,
        volume,
        quality
      };
    } catch (error) {
      return {
        available: false,
        volume: 0,
        quality: 'poor',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test speakers functionality
   */
  async testSpeakers(): Promise<DeviceTestResult['speakers']> {
    try {
      // Check if audio output is available
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioOutputs = devices.filter(device => device.kind === 'audiooutput');

      if (audioOutputs.length === 0) {
        return {
          available: false,
          testPassed: false,
          error: 'No audio output devices found'
        };
      }

      return {
        available: true,
        testPassed: true
      };
    } catch (error) {
      return {
        available: false,
        testPassed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Calculate volume level from audio data
   */
  private calculateVolume(dataArray: Uint8Array): number {
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const value = Math.abs(dataArray[i] - 128);
      sum += value;
    }
    return Math.round((sum / dataArray.length / 128) * 100);
  }

  /**
   * Assess microphone quality based on volume
   */
  private assessMicrophoneQuality(volume: number): 'excellent' | 'good' | 'poor' {
    if (volume >= 70) return 'excellent';
    if (volume >= 40) return 'good';
    return 'poor';
  }

  /**
   * Generate troubleshooting guide based on test results
   */
  generateTroubleshootingGuide(result: DeviceTestResult): TroubleshootingGuide[] {
    const guides: TroubleshootingGuide[] = [];

    if (!result.camera.available) {
      guides.push({
        issue: 'Camera not accessible',
        steps: [
          'Check if another application is using your camera',
          'Grant camera permissions in your browser settings',
          'Try a different browser or restart your current one',
          'Check if your camera drivers are up to date'
        ],
        commonCauses: [
          'Permission denied by user',
          'Camera in use by another application',
          'Browser security settings',
          'Hardware disconnected or disabled'
        ],
        supportLink: '/help/camera-issues'
      });
    }

    if (!result.microphone.available) {
      guides.push({
        issue: 'Microphone not accessible',
        steps: [
          'Check if another application is using your microphone',
          'Grant microphone permissions in your browser settings',
          'Verify your microphone is properly connected',
          'Adjust microphone volume in system settings'
        ],
        commonCauses: [
          'Permission denied by user',
          'Microphone in use by another application',
          'Browser security settings',
          'Hardware disconnected or muted'
        ],
        supportLink: '/help/microphone-issues'
      });
    }

    if (result.microphone.available && result.microphone.quality === 'poor') {
      guides.push({
        issue: 'Low microphone quality detected',
        steps: [
          'Move closer to your microphone',
          'Reduce background noise',
          'Increase microphone sensitivity in system settings',
          'Consider using an external microphone for better quality'
        ],
        commonCauses: [
          'Too much background noise',
          'Microphone too far from speaker',
          'Low microphone sensitivity',
          'Poor quality built-in microphone'
        ],
        supportLink: '/help/audio-quality'
      });
    }

    if (!result.speakers.available) {
      guides.push({
        issue: 'Speakers not detected',
        steps: [
          'Check if speakers or headphones are properly connected',
          'Verify audio output device in system settings',
          'Try a different audio output device',
          'Restart your browser'
        ],
        commonCauses: [
          'No audio output device connected',
          'Incorrect default audio device selected',
          'Audio drivers not installed',
          'Hardware malfunction'
        ],
        supportLink: '/help/speaker-issues'
      });
    }

    return guides;
  }

  /**
   * Get list of available devices
   */
  async getAvailableDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return {
        cameras: devices.filter(d => d.kind === 'videoinput'),
        microphones: devices.filter(d => d.kind === 'audioinput'),
        speakers: devices.filter(d => d.kind === 'audiooutput')
      };
    } catch (error) {
      console.error('Failed to enumerate devices:', error);
      return { cameras: [], microphones: [], speakers: [] };
    }
  }
}
