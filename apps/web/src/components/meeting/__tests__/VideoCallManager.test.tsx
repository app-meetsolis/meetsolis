/**
 * VideoCallManager Component Tests
 * Tests for main video call orchestration component
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { VideoCallManager } from '../VideoCallManager';

// Mock dependencies
jest.mock('@/services/webrtc/WebRTCService');
jest.mock('@/services/webrtc/SignalingService');
jest.mock('@/hooks/useMediaStream');
jest.mock('../ParticipantGrid', () => ({
  ParticipantGrid: ({ participants }: any) => (
    <div data-testid="participant-grid">
      {participants.map((p: any) => (
        <div key={p.id}>{p.name}</div>
      ))}
    </div>
  ),
}));

import { useMediaStream } from '@/hooks/useMediaStream';

const mockStream = {
  getTracks: jest.fn(() => []),
  getVideoTracks: jest.fn(() => []),
} as unknown as MediaStream;

describe('VideoCallManager', () => {
  const defaultProps = {
    meetingId: 'meeting-123',
    userId: 'user-123',
    userName: 'John Doe',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useMediaStream hook
    (useMediaStream as jest.Mock).mockReturnValue({
      stream: mockStream,
      isLoading: false,
      error: null,
      isAudioEnabled: true,
      isVideoEnabled: true,
      toggleAudio: jest.fn(),
      toggleVideo: jest.fn(),
      replaceTrack: jest.fn(),
      stop: jest.fn(),
      restart: jest.fn(),
    });
  });

  it('should show connecting state initially', () => {
    (useMediaStream as jest.Mock).mockReturnValue({
      stream: null,
      isLoading: true,
      error: null,
      isAudioEnabled: true,
      isVideoEnabled: true,
      toggleAudio: jest.fn(),
      toggleVideo: jest.fn(),
      replaceTrack: jest.fn(),
      stop: jest.fn(),
      restart: jest.fn(),
    });

    render(<VideoCallManager {...defaultProps} />);
    expect(screen.getByText('Connecting to meeting...')).toBeInTheDocument();
  });

  it('should show error state when stream error occurs', () => {
    const error = new Error('Permission denied');
    (useMediaStream as jest.Mock).mockReturnValue({
      stream: null,
      isLoading: false,
      error,
      isAudioEnabled: true,
      isVideoEnabled: true,
      toggleAudio: jest.fn(),
      toggleVideo: jest.fn(),
      replaceTrack: jest.fn(),
      stop: jest.fn(),
      restart: jest.fn(),
    });

    render(<VideoCallManager {...defaultProps} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Connection Error')).toBeInTheDocument();
    expect(screen.getByText('Permission denied')).toBeInTheDocument();
  });

  it('should call onError when error occurs', () => {
    const handleError = jest.fn();
    const error = new Error('Test error');

    (useMediaStream as jest.Mock).mockReturnValue({
      stream: null,
      isLoading: false,
      error,
      isAudioEnabled: true,
      isVideoEnabled: true,
      toggleAudio: jest.fn(),
      toggleVideo: jest.fn(),
      replaceTrack: jest.fn(),
      stop: jest.fn(),
      restart: jest.fn(),
    });

    render(<VideoCallManager {...defaultProps} onError={handleError} />);

    expect(handleError).toHaveBeenCalledWith(error);
  });

  it('should render participant grid when connected', async () => {
    render(<VideoCallManager {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId('participant-grid')).toBeInTheDocument();
    });
  });

  it('should have accessibility attributes', () => {
    render(<VideoCallManager {...defaultProps} />);

    expect(
      screen.getByRole('main', { name: 'Video call' })
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should show reload button on error', () => {
    const error = new Error('Test error');
    (useMediaStream as jest.Mock).mockReturnValue({
      stream: null,
      isLoading: false,
      error,
      isAudioEnabled: true,
      isVideoEnabled: true,
      toggleAudio: jest.fn(),
      toggleVideo: jest.fn(),
      replaceTrack: jest.fn(),
      stop: jest.fn(),
      restart: jest.fn(),
    });

    render(<VideoCallManager {...defaultProps} />);

    expect(screen.getByText('Reload Page')).toBeInTheDocument();
  });
});
