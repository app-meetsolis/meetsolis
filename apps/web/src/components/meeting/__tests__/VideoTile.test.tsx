/**
 * VideoTile Component Tests
 * Tests for individual participant video tile
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { VideoTile } from '../VideoTile';

// Mock MediaStream
const mockVideoTrack = {
  kind: 'video',
  enabled: true,
  stop: jest.fn(),
} as unknown as MediaStreamTrack;

const mockMediaStream = {
  getTracks: jest.fn(() => [mockVideoTrack]),
  getVideoTracks: jest.fn(() => [mockVideoTrack]),
} as unknown as MediaStream;

describe('VideoTile', () => {
  const defaultProps = {
    stream: mockMediaStream,
    participantName: 'John Doe',
    participantId: 'user-123',
  };

  it('should render participant name', () => {
    render(<VideoTile {...defaultProps} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should render local indicator for local user', () => {
    render(<VideoTile {...defaultProps} isLocal={true} />);
    expect(screen.getByText('You')).toBeInTheDocument();
    expect(screen.getByText('John Doe (You)')).toBeInTheDocument();
  });

  it('should show muted indicator when muted', () => {
    render(<VideoTile {...defaultProps} isMuted={true} />);
    expect(screen.getByLabelText('Microphone muted')).toBeInTheDocument();
  });

  it('should show video off indicator when video is off', () => {
    render(<VideoTile {...defaultProps} isVideoOff={true} />);
    expect(screen.getByLabelText('Camera off')).toBeInTheDocument();
  });

  it('should show avatar when video is off', () => {
    render(<VideoTile {...defaultProps} isVideoOff={true} />);
    expect(screen.getByLabelText('Avatar for John Doe')).toBeInTheDocument();
    expect(screen.getByText('JD')).toBeInTheDocument(); // Initials
  });

  it('should show connection quality indicator', () => {
    render(<VideoTile {...defaultProps} connectionQuality="excellent" />);
    expect(
      screen.getByLabelText('Connection quality: excellent')
    ).toBeInTheDocument();
  });

  it('should call onVideoClick when clicked', () => {
    const handleClick = jest.fn();
    render(<VideoTile {...defaultProps} onVideoClick={handleClick} />);

    const tile = screen.getByRole('button');
    fireEvent.click(tile);

    expect(handleClick).toHaveBeenCalledWith('user-123');
  });

  it('should handle keyboard navigation', () => {
    const handleClick = jest.fn();
    render(<VideoTile {...defaultProps} onVideoClick={handleClick} />);

    const tile = screen.getByRole('button');
    fireEvent.keyDown(tile, { key: 'Enter' });

    expect(handleClick).toHaveBeenCalledWith('user-123');
  });

  it('should not be clickable without onVideoClick', () => {
    render(<VideoTile {...defaultProps} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should show loading state when stream is provided but not loaded', () => {
    render(<VideoTile {...defaultProps} stream={mockMediaStream} />);
    // Loading state is shown initially
    expect(screen.getByLabelText('Loading video')).toBeInTheDocument();
  });

  it('should generate correct initials for single name', () => {
    render(
      <VideoTile {...defaultProps} participantName="Alice" isVideoOff={true} />
    );
    expect(screen.getByText('AL')).toBeInTheDocument();
  });

  it('should generate correct initials for two names', () => {
    render(
      <VideoTile
        {...defaultProps}
        participantName="Bob Smith"
        isVideoOff={true}
      />
    );
    expect(screen.getByText('BS')).toBeInTheDocument();
  });

  it('should have proper ARIA labels', () => {
    render(<VideoTile {...defaultProps} isLocal={true} />);
    expect(
      screen.getByLabelText('Video feed for John Doe (You)')
    ).toBeInTheDocument();
  });
});
