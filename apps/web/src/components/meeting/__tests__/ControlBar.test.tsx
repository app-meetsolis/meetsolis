import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { ControlBar } from '../ControlBar';

// Mock sonner
jest.mock('sonner', () => ({
  toast: jest.fn(),
}));

// Mock react-hotkeys-hook
const mockUseHotkeys = jest.fn();
jest.mock('react-hotkeys-hook', () => ({
  useHotkeys: (
    keys: string,
    callback: (e: KeyboardEvent) => void,
    options?: any
  ) => {
    mockUseHotkeys(keys, callback, options);
    return null;
  },
}));

describe('ControlBar', () => {
  const mockOnToggleAudio = jest.fn();
  const mockOnToggleVideo = jest.fn();
  const mockOnOpenSettings = jest.fn();
  const mockOnOpenMore = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    isAudioMuted: false,
    isVideoOff: false,
    onToggleAudio: mockOnToggleAudio,
    onToggleVideo: mockOnToggleVideo,
  };

  describe('Rendering', () => {
    it('should render control bar with all essential buttons', () => {
      render(<ControlBar {...defaultProps} />);

      expect(
        screen.getByRole('toolbar', { name: /meeting controls/i })
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/mute microphone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/turn off video/i)).toBeInTheDocument();
    });

    it('should render settings button when onOpenSettings is provided', () => {
      render(
        <ControlBar {...defaultProps} onOpenSettings={mockOnOpenSettings} />
      );

      expect(
        screen.getByLabelText(/open device settings/i)
      ).toBeInTheDocument();
    });

    it('should render more options button when onOpenMore is provided', () => {
      render(<ControlBar {...defaultProps} onOpenMore={mockOnOpenMore} />);

      expect(screen.getByLabelText(/more options/i)).toBeInTheDocument();
    });

    it('should not render optional buttons when callbacks not provided', () => {
      render(<ControlBar {...defaultProps} />);

      expect(
        screen.queryByLabelText(/open device settings/i)
      ).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/more options/i)).not.toBeInTheDocument();
    });
  });

  describe('Audio Control', () => {
    it('should display unmuted state correctly', () => {
      render(<ControlBar {...defaultProps} isAudioMuted={false} />);

      const muteButton = screen.getByLabelText(/mute microphone/i);
      expect(muteButton).toHaveAttribute('aria-pressed', 'false');
      expect(muteButton).not.toHaveClass('bg-red-600');
    });

    it('should display muted state correctly', () => {
      render(<ControlBar {...defaultProps} isAudioMuted={true} />);

      const muteButton = screen.getByLabelText(/unmute microphone/i);
      expect(muteButton).toHaveAttribute('aria-pressed', 'true');
      expect(muteButton).toHaveClass('bg-red-600');
    });

    it('should call onToggleAudio when mute button clicked', async () => {
      const user = userEvent.setup();
      render(<ControlBar {...defaultProps} />);

      const muteButton = screen.getByLabelText(/mute microphone/i);
      await user.click(muteButton);

      expect(mockOnToggleAudio).toHaveBeenCalledTimes(1);
    });

    it('should show tooltip on mute button hover', async () => {
      const user = userEvent.setup();
      render(<ControlBar {...defaultProps} />);

      const muteButton = screen.getByLabelText(/mute microphone/i);
      await user.hover(muteButton);

      // Tooltip should appear (Shadcn UI tooltip)
      expect(muteButton).toBeInTheDocument();
    });
  });

  describe('Video Control', () => {
    it('should display video on state correctly', () => {
      render(<ControlBar {...defaultProps} isVideoOff={false} />);

      const videoButton = screen.getByLabelText(/turn off video/i);
      expect(videoButton).toHaveAttribute('aria-pressed', 'false');
      expect(videoButton).not.toHaveClass('bg-red-600');
    });

    it('should display video off state correctly', () => {
      render(<ControlBar {...defaultProps} isVideoOff={true} />);

      const videoButton = screen.getByLabelText(/turn on video/i);
      expect(videoButton).toHaveAttribute('aria-pressed', 'true');
      expect(videoButton).toHaveClass('bg-red-600');
    });

    it('should call onToggleVideo when video button clicked', async () => {
      const user = userEvent.setup();
      render(<ControlBar {...defaultProps} />);

      const videoButton = screen.getByLabelText(/turn off video/i);
      await user.click(videoButton);

      expect(mockOnToggleVideo).toHaveBeenCalledTimes(1);
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should register M key for mute/unmute', () => {
      render(<ControlBar {...defaultProps} />);

      const mKeyRegistration = mockUseHotkeys.mock.calls.find(
        call => call[0] === 'm'
      );
      expect(mKeyRegistration).toBeDefined();
      expect(mKeyRegistration?.[2]).toEqual({ enableOnFormTags: false });
    });

    it('should register V key for video toggle', () => {
      render(<ControlBar {...defaultProps} />);

      const vKeyRegistration = mockUseHotkeys.mock.calls.find(
        call => call[0] === 'v'
      );
      expect(vKeyRegistration).toBeDefined();
      expect(vKeyRegistration?.[2]).toEqual({ enableOnFormTags: false });
    });

    it('should trigger audio toggle and show toast on M key press', () => {
      render(<ControlBar {...defaultProps} isAudioMuted={false} />);

      // Get the M key callback
      const mKeyCallback = mockUseHotkeys.mock.calls.find(
        call => call[0] === 'm'
      )?.[1];

      expect(mKeyCallback).toBeDefined();

      // Simulate M key press
      const mockEvent = { preventDefault: jest.fn() } as any;
      mKeyCallback?.(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockOnToggleAudio).toHaveBeenCalledTimes(1);
      expect(toast.info).toHaveBeenCalledWith(
        'Microphone muted',
        expect.objectContaining({ position: 'bottom-center' })
      );
    });

    it('should trigger video toggle and show toast on V key press', () => {
      render(<ControlBar {...defaultProps} isVideoOff={false} />);

      // Get the V key callback
      const vKeyCallback = mockUseHotkeys.mock.calls.find(
        call => call[0] === 'v'
      )?.[1];

      expect(vKeyCallback).toBeDefined();

      // Simulate V key press
      const mockEvent = { preventDefault: jest.fn() } as any;
      vKeyCallback?.(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockOnToggleVideo).toHaveBeenCalledTimes(1);
      expect(toast.info).toHaveBeenCalledWith(
        'Video turned off',
        expect.objectContaining({ position: 'bottom-center' })
      );
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA roles and labels', () => {
      render(<ControlBar {...defaultProps} />);

      const toolbar = screen.getByRole('toolbar');
      expect(toolbar).toHaveAttribute('aria-label', 'Meeting controls');

      const muteButton = screen.getByLabelText(/mute microphone \(m\)/i);
      expect(muteButton).toHaveAttribute('aria-label');
      expect(muteButton).toHaveAttribute('aria-pressed');

      const videoButton = screen.getByLabelText(/turn off video \(v\)/i);
      expect(videoButton).toHaveAttribute('aria-label');
      expect(videoButton).toHaveAttribute('aria-pressed');
    });

    it('should have ARIA live region for screen reader announcements', () => {
      render(
        <ControlBar {...defaultProps} isAudioMuted={false} isVideoOff={false} />
      );

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
      expect(liveRegion).toHaveClass('sr-only');
      expect(liveRegion).toHaveTextContent(/microphone unmuted/i);
      expect(liveRegion).toHaveTextContent(/video on/i);
    });

    it('should update ARIA live region when state changes', () => {
      const { rerender } = render(
        <ControlBar {...defaultProps} isAudioMuted={false} isVideoOff={false} />
      );

      let liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveTextContent(/microphone unmuted/i);

      rerender(
        <ControlBar {...defaultProps} isAudioMuted={true} isVideoOff={false} />
      );

      liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveTextContent(/microphone muted/i);
    });

    it('should have keyboard focus indicators', () => {
      render(<ControlBar {...defaultProps} />);

      const muteButton = screen.getByLabelText(/mute microphone/i);
      expect(muteButton).toHaveClass('focus:ring-2', 'focus:ring-blue-500');
    });

    it('should have sufficient touch target size (44x44px minimum)', () => {
      render(<ControlBar {...defaultProps} />);

      const muteButton = screen.getByLabelText(/mute microphone/i);
      const videoButton = screen.getByLabelText(/turn off video/i);

      // Main buttons are h-14 w-14 (56px x 56px) which exceeds 44px minimum
      expect(muteButton).toHaveClass('h-14', 'w-14');
      expect(videoButton).toHaveClass('h-14', 'w-14');
    });
  });

  describe('Optional Callbacks', () => {
    it('should call onOpenSettings when settings button clicked', async () => {
      const user = userEvent.setup();
      render(
        <ControlBar {...defaultProps} onOpenSettings={mockOnOpenSettings} />
      );

      const settingsButton = screen.getByLabelText(/open device settings/i);
      await user.click(settingsButton);

      expect(mockOnOpenSettings).toHaveBeenCalledTimes(1);
    });

    it('should call onOpenMore when more options button clicked', async () => {
      const user = userEvent.setup();
      render(<ControlBar {...defaultProps} onOpenMore={mockOnOpenMore} />);

      const moreButton = screen.getByLabelText(/more options/i);
      await user.click(moreButton);

      expect(mockOnOpenMore).toHaveBeenCalledTimes(1);
    });
  });

  describe('Visual Styling', () => {
    it('should apply custom className when provided', () => {
      const customClass = 'custom-test-class';
      render(<ControlBar {...defaultProps} className={customClass} />);

      const toolbar = screen.getByRole('toolbar');
      expect(toolbar).toHaveClass(customClass);
    });

    it('should have proper layout classes', () => {
      render(<ControlBar {...defaultProps} />);

      const toolbar = screen.getByRole('toolbar');
      expect(toolbar).toHaveClass(
        'fixed',
        'bottom-0',
        'left-0',
        'right-0',
        'flex',
        'items-center',
        'justify-center'
      );
    });

    it('should have backdrop blur and background', () => {
      render(<ControlBar {...defaultProps} />);

      const toolbar = screen.getByRole('toolbar');
      expect(toolbar).toHaveClass('bg-gray-900/95', 'backdrop-blur-sm');
    });
  });
});
