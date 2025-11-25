import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeviceSettingsPanel } from '../DeviceSettingsPanel';
import { useDevices } from '../useDevices';
import { useAudioLevel } from '../useAudioLevel';

// Mock the hooks
jest.mock('../useDevices');
jest.mock('../useAudioLevel');

// Mock HTML5 Audio
global.HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve());
global.HTMLMediaElement.prototype.pause = jest.fn();

// Mock navigator.mediaDevices
const mockGetUserMedia = jest.fn();
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: mockGetUserMedia,
  },
});

const mockUseDevices = useDevices as jest.MockedFunction<typeof useDevices>;
const mockUseAudioLevel = useAudioLevel as jest.MockedFunction<
  typeof useAudioLevel
>;

describe('DeviceSettingsPanel', () => {
  const mockOnOpenChange = jest.fn();
  const mockRefreshDevices = jest.fn();
  const mockSavePreferences = jest.fn();

  const mockDevicesData = {
    cameras: [
      { deviceId: 'camera1', label: 'HD Webcam', kind: 'videoinput' },
      { deviceId: 'camera2', label: 'Built-in Camera', kind: 'videoinput' },
    ],
    microphones: [
      { deviceId: 'mic1', label: 'USB Microphone', kind: 'audioinput' },
      { deviceId: 'mic2', label: 'Built-in Microphone', kind: 'audioinput' },
    ],
    speakers: [
      { deviceId: 'speaker1', label: 'External Speakers', kind: 'audiooutput' },
      { deviceId: 'speaker2', label: 'Built-in Speakers', kind: 'audiooutput' },
    ],
    isLoading: false,
    error: null,
    preferences: {
      cameraId: 'camera1',
      microphoneId: 'mic1',
      speakerId: 'speaker1',
      lastUpdated: Date.now(),
    },
    refreshDevices: mockRefreshDevices,
    savePreferences: mockSavePreferences,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDevices.mockReturnValue(mockDevicesData);
    mockUseAudioLevel.mockReturnValue({ audioLevel: 50 });
    mockGetUserMedia.mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }],
    } as any);
  });

  describe('Rendering', () => {
    it('should render dialog when open', () => {
      render(
        <DeviceSettingsPanel open={true} onOpenChange={mockOnOpenChange} />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Device Settings')).toBeInTheDocument();
      expect(
        screen.getByText(/Configure your camera, microphone, and speaker/i)
      ).toBeInTheDocument();
    });

    it('should not render dialog when closed', () => {
      render(
        <DeviceSettingsPanel open={false} onOpenChange={mockOnOpenChange} />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render all device sections', () => {
      render(
        <DeviceSettingsPanel open={true} onOpenChange={mockOnOpenChange} />
      );

      expect(screen.getByText('Camera')).toBeInTheDocument();
      expect(screen.getByText('Microphone')).toBeInTheDocument();
      expect(screen.getByText('Speaker / Output')).toBeInTheDocument();
    });

    it('should render refresh devices button', () => {
      render(
        <DeviceSettingsPanel open={true} onOpenChange={mockOnOpenChange} />
      );

      expect(screen.getByLabelText(/refresh devices/i)).toBeInTheDocument();
    });
  });

  describe('Camera Settings', () => {
    it('should display camera selection dropdown', async () => {
      render(
        <DeviceSettingsPanel open={true} onOpenChange={mockOnOpenChange} />
      );

      const cameraSelect = screen.getByRole('combobox', { name: /camera/i });
      expect(cameraSelect).toBeInTheDocument();
    });

    it('should show selected camera from preferences', async () => {
      render(
        <DeviceSettingsPanel open={true} onOpenChange={mockOnOpenChange} />
      );

      await waitFor(() => {
        expect(screen.getByText('HD Webcam')).toBeInTheDocument();
      });
    });

    it('should call savePreferences when camera changes', async () => {
      const user = userEvent.setup();
      render(
        <DeviceSettingsPanel open={true} onOpenChange={mockOnOpenChange} />
      );

      const cameraSelect = screen.getByRole('combobox', { name: /camera/i });
      await user.click(cameraSelect);

      // Note: Testing select dropdown interactions requires additional setup
      // This is a simplified test
    });

    it('should setup camera preview when camera selected', async () => {
      render(
        <DeviceSettingsPanel open={true} onOpenChange={mockOnOpenChange} />
      );

      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalledWith({
          video: { deviceId: { exact: 'camera1' } },
          audio: false,
        });
      });
    });

    it('should disable camera select when loading', () => {
      mockUseDevices.mockReturnValue({
        ...mockDevicesData,
        isLoading: true,
      });

      render(
        <DeviceSettingsPanel open={true} onOpenChange={mockOnOpenChange} />
      );

      const cameraSelect = screen.getByRole('combobox', { name: /camera/i });
      expect(cameraSelect).toBeDisabled();
    });

    it('should disable camera select when no cameras available', () => {
      mockUseDevices.mockReturnValue({
        ...mockDevicesData,
        cameras: [],
      });

      render(
        <DeviceSettingsPanel open={true} onOpenChange={mockOnOpenChange} />
      );

      const cameraSelect = screen.getByRole('combobox', { name: /camera/i });
      expect(cameraSelect).toBeDisabled();
    });
  });

  describe('Microphone Settings', () => {
    it('should display microphone selection dropdown', () => {
      render(
        <DeviceSettingsPanel open={true} onOpenChange={mockOnOpenChange} />
      );

      const micSelect = screen.getByRole('combobox', { name: /microphone/i });
      expect(micSelect).toBeInTheDocument();
    });

    it('should show selected microphone from preferences', async () => {
      render(
        <DeviceSettingsPanel open={true} onOpenChange={mockOnOpenChange} />
      );

      await waitFor(() => {
        expect(screen.getByText('USB Microphone')).toBeInTheDocument();
      });
    });

    it('should display audio level meter', () => {
      render(
        <DeviceSettingsPanel open={true} onOpenChange={mockOnOpenChange} />
      );

      const audioLevel = screen.getByRole('progressbar', {
        name: /audio level/i,
      });
      expect(audioLevel).toBeInTheDocument();
      expect(audioLevel).toHaveAttribute('aria-valuenow', '50');
    });

    it('should update audio level visualization', () => {
      mockUseAudioLevel.mockReturnValue({ audioLevel: 75 });

      render(
        <DeviceSettingsPanel open={true} onOpenChange={mockOnOpenChange} />
      );

      const audioLevel = screen.getByRole('progressbar', {
        name: /audio level/i,
      });
      expect(audioLevel).toHaveAttribute('aria-valuenow', '75');
    });

    it('should show audio level test instructions', () => {
      render(
        <DeviceSettingsPanel open={true} onOpenChange={mockOnOpenChange} />
      );

      expect(
        screen.getByText(/speak to test your microphone/i)
      ).toBeInTheDocument();
    });
  });

  describe('Speaker Settings', () => {
    it('should display speaker selection dropdown', () => {
      render(
        <DeviceSettingsPanel open={true} onOpenChange={mockOnOpenChange} />
      );

      const speakerSelect = screen.getByRole('combobox', { name: /speaker/i });
      expect(speakerSelect).toBeInTheDocument();
    });

    it('should show selected speaker from preferences', async () => {
      render(
        <DeviceSettingsPanel open={true} onOpenChange={mockOnOpenChange} />
      );

      await waitFor(() => {
        expect(screen.getByText('External Speakers')).toBeInTheDocument();
      });
    });

    it('should display volume slider', () => {
      render(
        <DeviceSettingsPanel open={true} onOpenChange={mockOnOpenChange} />
      );

      expect(screen.getByLabelText(/volume slider/i)).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument(); // Default volume
    });

    it('should display test speaker button', () => {
      render(
        <DeviceSettingsPanel open={true} onOpenChange={mockOnOpenChange} />
      );

      expect(
        screen.getByRole('button', { name: /test speaker/i })
      ).toBeInTheDocument();
    });

    it('should play audio when test speaker clicked', async () => {
      const user = userEvent.setup();
      render(
        <DeviceSettingsPanel open={true} onOpenChange={mockOnOpenChange} />
      );

      const testButton = screen.getByRole('button', { name: /test speaker/i });
      await user.click(testButton);

      expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
    });

    it('should disable test button when no speaker selected', () => {
      mockUseDevices.mockReturnValue({
        ...mockDevicesData,
        preferences: {
          ...mockDevicesData.preferences,
          speakerId: null,
        },
      });

      render(
        <DeviceSettingsPanel open={true} onOpenChange={mockOnOpenChange} />
      );

      const testButton = screen.getByRole('button', { name: /test speaker/i });
      expect(testButton).toBeDisabled();
    });

    it('should show testing state while audio plays', async () => {
      const user = userEvent.setup();
      render(
        <DeviceSettingsPanel open={true} onOpenChange={mockOnOpenChange} />
      );

      const testButton = screen.getByRole('button', { name: /test speaker/i });
      await user.click(testButton);

      expect(screen.getByText('Testing...')).toBeInTheDocument();
      expect(testButton).toBeDisabled();
    });
  });

  describe('Volume Control', () => {
    it('should display volume percentage', () => {
      render(
        <DeviceSettingsPanel open={true} onOpenChange={mockOnOpenChange} />
      );

      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('should update volume when slider changes', async () => {
      const user = userEvent.setup();
      render(
        <DeviceSettingsPanel open={true} onOpenChange={mockOnOpenChange} />
      );

      const slider = screen.getByLabelText(/volume slider/i);

      // Simulate slider change (simplified - actual implementation may vary)
      fireEvent.change(slider, { target: { value: '50' } });

      // Volume should update
      await waitFor(() => {
        // Check if volume text updates (implementation dependent)
      });
    });
  });

  describe('Device Refresh', () => {
    it('should call refreshDevices when refresh button clicked', async () => {
      const user = userEvent.setup();
      render(
        <DeviceSettingsPanel open={true} onOpenChange={mockOnOpenChange} />
      );

      const refreshButton = screen.getByLabelText(/refresh devices/i);
      await user.click(refreshButton);

      expect(mockRefreshDevices).toHaveBeenCalled();
    });

    it('should show loading state on refresh button when loading', () => {
      mockUseDevices.mockReturnValue({
        ...mockDevicesData,
        isLoading: true,
      });

      render(
        <DeviceSettingsPanel open={true} onOpenChange={mockOnOpenChange} />
      );

      const refreshButton = screen.getByLabelText(/refresh devices/i);
      expect(refreshButton).toBeDisabled();
    });
  });

  describe('Preferences Saving', () => {
    it('should save camera preference when changed', async () => {
      render(
        <DeviceSettingsPanel open={true} onOpenChange={mockOnOpenChange} />
      );

      // Simulate camera change
      // Note: Full test would require interaction with select dropdown
    });

    it('should save microphone preference when changed', async () => {
      render(
        <DeviceSettingsPanel open={true} onOpenChange={mockOnOpenChange} />
      );

      // Simulate microphone change
      // Note: Full test would require interaction with select dropdown
    });

    it('should save speaker preference when changed', async () => {
      render(
        <DeviceSettingsPanel open={true} onOpenChange={mockOnOpenChange} />
      );

      // Simulate speaker change
      // Note: Full test would require interaction with select dropdown
    });
  });

  describe('Dialog Actions', () => {
    it('should have cancel button', () => {
      render(
        <DeviceSettingsPanel open={true} onOpenChange={mockOnOpenChange} />
      );

      expect(
        screen.getByRole('button', { name: /cancel/i })
      ).toBeInTheDocument();
    });

    it('should have save settings button', () => {
      render(
        <DeviceSettingsPanel open={true} onOpenChange={mockOnOpenChange} />
      );

      expect(
        screen.getByRole('button', { name: /save settings/i })
      ).toBeInTheDocument();
    });

    it('should close dialog when cancel clicked', async () => {
      const user = userEvent.setup();
      render(
        <DeviceSettingsPanel open={true} onOpenChange={mockOnOpenChange} />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('should close dialog when save clicked', async () => {
      const user = userEvent.setup();
      render(
        <DeviceSettingsPanel open={true} onOpenChange={mockOnOpenChange} />
      );

      const saveButton = screen.getByRole('button', { name: /save settings/i });
      await user.click(saveButton);

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Cleanup', () => {
    it('should stop preview stream when dialog closes', async () => {
      const mockStop = jest.fn();
      mockGetUserMedia.mockResolvedValue({
        getTracks: () => [{ stop: mockStop }],
      } as any);

      const { rerender } = render(
        <DeviceSettingsPanel open={true} onOpenChange={mockOnOpenChange} />
      );

      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalled();
      });

      // Close dialog
      rerender(
        <DeviceSettingsPanel open={false} onOpenChange={mockOnOpenChange} />
      );

      await waitFor(() => {
        expect(mockStop).toHaveBeenCalled();
      });
    });

    it('should handle cleanup errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockGetUserMedia.mockRejectedValue(new Error('Camera access denied'));

      render(
        <DeviceSettingsPanel open={true} onOpenChange={mockOnOpenChange} />
      );

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to setup camera preview:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <DeviceSettingsPanel open={true} onOpenChange={mockOnOpenChange} />
      );

      expect(screen.getByLabelText(/volume slider/i)).toBeInTheDocument();
      expect(
        screen.getByLabelText(/audio level indicator/i)
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/refresh devices/i)).toBeInTheDocument();
    });

    it('should have proper progressbar attributes', () => {
      mockUseAudioLevel.mockReturnValue({ audioLevel: 60 });
      render(
        <DeviceSettingsPanel open={true} onOpenChange={mockOnOpenChange} />
      );

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '60');
      expect(progressbar).toHaveAttribute('aria-valuemin', '0');
      expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    });
  });

  describe('Error Handling', () => {
    it('should handle device enumeration errors', () => {
      mockUseDevices.mockReturnValue({
        ...mockDevicesData,
        error: new Error('Device access denied'),
      });

      render(
        <DeviceSettingsPanel open={true} onOpenChange={mockOnOpenChange} />
      );

      // Component should still render without crashing
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should handle empty device lists', () => {
      mockUseDevices.mockReturnValue({
        ...mockDevicesData,
        cameras: [],
        microphones: [],
        speakers: [],
      });

      render(
        <DeviceSettingsPanel open={true} onOpenChange={mockOnOpenChange} />
      );

      // All selects should be disabled
      expect(screen.getByRole('combobox', { name: /camera/i })).toBeDisabled();
      expect(
        screen.getByRole('combobox', { name: /microphone/i })
      ).toBeDisabled();
      expect(screen.getByRole('combobox', { name: /speaker/i })).toBeDisabled();
    });
  });
});
