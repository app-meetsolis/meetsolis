/**
 * DeviceTestWizard Component Tests
 * Tests for device testing wizard component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeviceTestWizard } from '../DeviceTestWizard';

// Mock hooks
jest.mock('../useDevices');
jest.mock('../useAudioLevel');
jest.mock('@/hooks/useMediaStream');

import { useDevices } from '../useDevices';
import { useAudioLevel } from '../useAudioLevel';
import { useMediaStream } from '@/hooks/useMediaStream';

// Mock MediaStream and tracks
const mockVideoTrack = {
  kind: 'video',
  enabled: true,
  stop: jest.fn(),
} as unknown as MediaStreamTrack;

const mockAudioTrack = {
  kind: 'audio',
  enabled: true,
  stop: jest.fn(),
} as unknown as MediaStreamTrack;

const mockMediaStream = {
  getTracks: jest.fn(() => [mockVideoTrack, mockAudioTrack]),
  getAudioTracks: jest.fn(() => [mockAudioTrack]),
  getVideoTracks: jest.fn(() => [mockVideoTrack]),
} as unknown as MediaStream;

// Mock devices
const mockCameras = [
  {
    deviceId: 'camera-1',
    label: 'Front Camera',
    kind: 'videoinput' as MediaDeviceKind,
  },
  {
    deviceId: 'camera-2',
    label: 'Back Camera',
    kind: 'videoinput' as MediaDeviceKind,
  },
];

const mockMicrophones = [
  {
    deviceId: 'mic-1',
    label: 'Built-in Microphone',
    kind: 'audioinput' as MediaDeviceKind,
  },
  {
    deviceId: 'mic-2',
    label: 'External Microphone',
    kind: 'audioinput' as MediaDeviceKind,
  },
];

const mockSpeakers = [
  {
    deviceId: 'speaker-1',
    label: 'Built-in Speakers',
    kind: 'audiooutput' as MediaDeviceKind,
  },
  {
    deviceId: 'speaker-2',
    label: 'External Speakers',
    kind: 'audiooutput' as MediaDeviceKind,
  },
];

const mockPreferences = {
  cameraId: 'camera-1',
  microphoneId: 'mic-1',
  speakerId: 'speaker-1',
  lastUpdated: Date.now(),
};

describe('DeviceTestWizard', () => {
  const mockOnComplete = jest.fn();
  const mockOnSkip = jest.fn();
  const mockSavePreferences = jest.fn();
  const mockRefreshDevices = jest.fn();
  const mockRestart = jest.fn();
  const mockStartMonitoring = jest.fn();
  const mockStopMonitoring = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup useDevices mock
    (useDevices as jest.Mock).mockReturnValue({
      cameras: mockCameras,
      microphones: mockMicrophones,
      speakers: mockSpeakers,
      isLoading: false,
      error: null,
      preferences: mockPreferences,
      refreshDevices: mockRefreshDevices,
      savePreferences: mockSavePreferences,
    });

    // Setup useMediaStream mock
    (useMediaStream as jest.Mock).mockReturnValue({
      stream: mockMediaStream,
      isLoading: false,
      error: null,
      isAudioEnabled: true,
      isVideoEnabled: true,
      toggleAudio: jest.fn(),
      toggleVideo: jest.fn(),
      replaceTrack: jest.fn(),
      stop: jest.fn(),
      restart: mockRestart,
    });

    // Setup useAudioLevel mock
    (useAudioLevel as jest.Mock).mockReturnValue({
      audioLevel: 50,
      isMonitoring: false,
      startMonitoring: mockStartMonitoring,
      stopMonitoring: mockStopMonitoring,
    });
  });

  describe('Rendering', () => {
    it('should render camera step initially', () => {
      render(<DeviceTestWizard onComplete={mockOnComplete} />);

      expect(screen.getByText('Test Your Camera')).toBeInTheDocument();
      expect(screen.getByLabelText('Camera preview')).toBeInTheDocument();
      expect(screen.getByLabelText('Select camera device')).toBeInTheDocument();
    });

    it('should render progress indicator', () => {
      render(<DeviceTestWizard onComplete={mockOnComplete} />);

      expect(screen.getByText('Camera')).toBeInTheDocument();
      expect(screen.getByText('Microphone')).toBeInTheDocument();
      expect(screen.getByText('Speaker')).toBeInTheDocument();
    });

    it('should render navigation buttons', () => {
      render(
        <DeviceTestWizard onComplete={mockOnComplete} onSkip={mockOnSkip} />
      );

      expect(
        screen.getByLabelText('Go back to previous step')
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Skip device testing')).toBeInTheDocument();
      expect(
        screen.getByLabelText('Continue to next step')
      ).toBeInTheDocument();
    });

    it('should disable back button on first step', () => {
      render(<DeviceTestWizard onComplete={mockOnComplete} />);

      const backButton = screen.getByLabelText('Go back to previous step');
      expect(backButton).toBeDisabled();
    });
  });

  describe('Camera Step', () => {
    it('should display camera devices in select', () => {
      render(<DeviceTestWizard onComplete={mockOnComplete} />);

      const select = screen.getByLabelText(
        'Select camera device'
      ) as HTMLSelectElement;
      expect(select.options).toHaveLength(2);
      expect(select.options[0].text).toBe('Front Camera');
      expect(select.options[1].text).toBe('Back Camera');
    });

    it('should handle camera selection change', async () => {
      render(<DeviceTestWizard onComplete={mockOnComplete} />);

      const select = screen.getByLabelText('Select camera device');
      fireEvent.change(select, { target: { value: 'camera-2' } });

      await waitFor(() => {
        expect(mockSavePreferences).toHaveBeenCalledWith({
          cameraId: 'camera-2',
        });
        expect(mockRestart).toHaveBeenCalled();
      });
    });

    it('should show error message when no cameras found', () => {
      (useDevices as jest.Mock).mockReturnValue({
        cameras: [],
        microphones: mockMicrophones,
        speakers: mockSpeakers,
        isLoading: false,
        error: null,
        preferences: mockPreferences,
        refreshDevices: mockRefreshDevices,
        savePreferences: mockSavePreferences,
      });

      render(<DeviceTestWizard onComplete={mockOnComplete} />);

      expect(screen.getByText('No cameras found')).toBeInTheDocument();
    });

    it('should display permission denied error', () => {
      const permissionError = new Error('Camera/microphone permission denied');
      (permissionError as any).code = 'PERMISSION_DENIED';

      (useMediaStream as jest.Mock).mockReturnValue({
        stream: null,
        isLoading: false,
        error: permissionError,
        isAudioEnabled: true,
        isVideoEnabled: true,
        toggleAudio: jest.fn(),
        toggleVideo: jest.fn(),
        replaceTrack: jest.fn(),
        stop: jest.fn(),
        restart: mockRestart,
      });

      render(<DeviceTestWizard onComplete={mockOnComplete} />);

      expect(screen.getByText('Permission Denied')).toBeInTheDocument();
      expect(
        screen.getByText(/Please allow camera and microphone access/)
      ).toBeInTheDocument();
    });
  });

  describe('Microphone Step', () => {
    it('should navigate to microphone step', () => {
      render(<DeviceTestWizard onComplete={mockOnComplete} />);

      const nextButton = screen.getByLabelText('Continue to next step');
      fireEvent.click(nextButton);

      expect(screen.getByText('Test Your Microphone')).toBeInTheDocument();
      expect(
        screen.getByLabelText('Select microphone device')
      ).toBeInTheDocument();
    });

    it('should display microphone devices in select', () => {
      render(<DeviceTestWizard onComplete={mockOnComplete} />);

      // Navigate to microphone step
      fireEvent.click(screen.getByLabelText('Continue to next step'));

      const select = screen.getByLabelText(
        'Select microphone device'
      ) as HTMLSelectElement;
      expect(select.options).toHaveLength(2);
      expect(select.options[0].text).toBe('Built-in Microphone');
      expect(select.options[1].text).toBe('External Microphone');
    });

    it('should handle microphone selection change', async () => {
      render(<DeviceTestWizard onComplete={mockOnComplete} />);

      // Navigate to microphone step
      fireEvent.click(screen.getByLabelText('Continue to next step'));

      const select = screen.getByLabelText('Select microphone device');
      fireEvent.change(select, { target: { value: 'mic-2' } });

      await waitFor(() => {
        expect(mockSavePreferences).toHaveBeenCalledWith({
          microphoneId: 'mic-2',
        });
        expect(mockRestart).toHaveBeenCalled();
      });
    });

    it('should display audio level indicator', () => {
      (useAudioLevel as jest.Mock).mockReturnValue({
        audioLevel: 75,
        isMonitoring: true,
        startMonitoring: mockStartMonitoring,
        stopMonitoring: mockStopMonitoring,
      });

      render(<DeviceTestWizard onComplete={mockOnComplete} />);

      // Navigate to microphone step
      fireEvent.click(screen.getByLabelText('Continue to next step'));

      const progressBar = screen.getByLabelText('Microphone audio level');
      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
    });

    it('should start audio monitoring on microphone step', () => {
      render(<DeviceTestWizard onComplete={mockOnComplete} />);

      // Navigate to microphone step
      fireEvent.click(screen.getByLabelText('Continue to next step'));

      // Audio monitoring should be started
      expect(mockStartMonitoring).toHaveBeenCalled();
    });

    it('should stop audio monitoring when leaving microphone step', () => {
      render(<DeviceTestWizard onComplete={mockOnComplete} />);

      // Navigate to microphone step
      fireEvent.click(screen.getByLabelText('Continue to next step'));

      // Navigate to speaker step
      fireEvent.click(screen.getByLabelText('Continue to next step'));

      expect(mockStopMonitoring).toHaveBeenCalled();
    });
  });

  describe('Speaker Step', () => {
    it('should navigate to speaker step', () => {
      render(<DeviceTestWizard onComplete={mockOnComplete} />);

      // Navigate through steps
      fireEvent.click(screen.getByLabelText('Continue to next step')); // Camera -> Microphone
      fireEvent.click(screen.getByLabelText('Continue to next step')); // Microphone -> Speaker

      expect(screen.getByText('Test Your Speakers')).toBeInTheDocument();
      expect(
        screen.getByLabelText('Select speaker device')
      ).toBeInTheDocument();
    });

    it('should display speaker devices in select', () => {
      render(<DeviceTestWizard onComplete={mockOnComplete} />);

      // Navigate to speaker step
      fireEvent.click(screen.getByLabelText('Continue to next step'));
      fireEvent.click(screen.getByLabelText('Continue to next step'));

      const select = screen.getByLabelText(
        'Select speaker device'
      ) as HTMLSelectElement;
      expect(select.options).toHaveLength(2);
      expect(select.options[0].text).toBe('Built-in Speakers');
      expect(select.options[1].text).toBe('External Speakers');
    });

    it('should handle speaker selection change', async () => {
      render(<DeviceTestWizard onComplete={mockOnComplete} />);

      // Navigate to speaker step
      fireEvent.click(screen.getByLabelText('Continue to next step'));
      fireEvent.click(screen.getByLabelText('Continue to next step'));

      const select = screen.getByLabelText('Select speaker device');
      fireEvent.change(select, { target: { value: 'speaker-2' } });

      await waitFor(() => {
        expect(mockSavePreferences).toHaveBeenCalledWith({
          speakerId: 'speaker-2',
        });
      });
    });

    it('should render play test sound button', () => {
      render(<DeviceTestWizard onComplete={mockOnComplete} />);

      // Navigate to speaker step
      fireEvent.click(screen.getByLabelText('Continue to next step'));
      fireEvent.click(screen.getByLabelText('Continue to next step'));

      expect(screen.getByLabelText('Play test sound')).toBeInTheDocument();
    });

    it('should change button text when playing', () => {
      render(<DeviceTestWizard onComplete={mockOnComplete} />);

      // Navigate to speaker step
      fireEvent.click(screen.getByLabelText('Continue to next step'));
      fireEvent.click(screen.getByLabelText('Continue to next step'));

      const playButton = screen.getByLabelText('Play test sound');
      fireEvent.click(playButton);

      expect(screen.getByText('Playing...')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate back from microphone to camera', () => {
      render(<DeviceTestWizard onComplete={mockOnComplete} />);

      // Go to microphone step
      fireEvent.click(screen.getByLabelText('Continue to next step'));
      expect(screen.getByText('Test Your Microphone')).toBeInTheDocument();

      // Go back to camera
      fireEvent.click(screen.getByLabelText('Go back to previous step'));
      expect(screen.getByText('Test Your Camera')).toBeInTheDocument();
    });

    it('should navigate back from speaker to microphone', () => {
      render(<DeviceTestWizard onComplete={mockOnComplete} />);

      // Navigate to speaker step
      fireEvent.click(screen.getByLabelText('Continue to next step'));
      fireEvent.click(screen.getByLabelText('Continue to next step'));
      expect(screen.getByText('Test Your Speakers')).toBeInTheDocument();

      // Go back to microphone
      fireEvent.click(screen.getByLabelText('Go back to previous step'));
      expect(screen.getByText('Test Your Microphone')).toBeInTheDocument();
    });

    it('should call onSkip when skip button is clicked', () => {
      render(
        <DeviceTestWizard onComplete={mockOnComplete} onSkip={mockOnSkip} />
      );

      fireEvent.click(screen.getByLabelText('Skip device testing'));

      expect(mockOnSkip).toHaveBeenCalled();
    });

    it('should not render skip button if onSkip not provided', () => {
      render(<DeviceTestWizard onComplete={mockOnComplete} />);

      expect(
        screen.queryByLabelText('Skip device testing')
      ).not.toBeInTheDocument();
    });
  });

  describe('Completion', () => {
    it('should call onComplete with preferences on final step', () => {
      render(<DeviceTestWizard onComplete={mockOnComplete} />);

      // Navigate through all steps
      fireEvent.click(screen.getByLabelText('Continue to next step')); // Camera -> Microphone
      fireEvent.click(screen.getByLabelText('Continue to next step')); // Microphone -> Speaker
      fireEvent.click(screen.getByLabelText('Complete device testing')); // Complete

      expect(mockOnComplete).toHaveBeenCalledWith({
        cameraId: 'camera-1',
        microphoneId: 'mic-1',
        speakerId: 'speaker-1',
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<DeviceTestWizard onComplete={mockOnComplete} />);

      expect(screen.getByLabelText('Camera preview')).toBeInTheDocument();
      expect(screen.getByLabelText('Select camera device')).toBeInTheDocument();
      expect(
        screen.getByLabelText('Go back to previous step')
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('Continue to next step')
      ).toBeInTheDocument();
    });

    it('should have progress indicator with ARIA attributes', () => {
      render(<DeviceTestWizard onComplete={mockOnComplete} />);

      const progressBar = screen.getAllByRole('progressbar')[0];
      expect(progressBar).toHaveAttribute('aria-valuenow', '33');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('should have error alerts with proper roles', () => {
      const permissionError = new Error('Camera/microphone permission denied');
      (permissionError as any).code = 'PERMISSION_DENIED';

      (useMediaStream as jest.Mock).mockReturnValue({
        stream: null,
        isLoading: false,
        error: permissionError,
        isAudioEnabled: true,
        isVideoEnabled: true,
        toggleAudio: jest.fn(),
        toggleVideo: jest.fn(),
        replaceTrack: jest.fn(),
        stop: jest.fn(),
        restart: mockRestart,
      });

      render(<DeviceTestWizard onComplete={mockOnComplete} />);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'polite');
    });
  });
});
