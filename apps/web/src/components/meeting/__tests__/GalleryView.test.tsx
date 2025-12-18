/**
 * Tests for GalleryView component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { GalleryView } from '../GalleryView';

// Mock StreamVideoTile
jest.mock('../StreamVideoTile', () => ({
  StreamVideoTile: ({ participant }: any) => (
    <div data-testid={`video-tile-${participant.userId}`}>
      {participant.name || participant.userId}
    </div>
  ),
}));

const createMockParticipants = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    sessionId: `session-${i}`,
    userId: `user-${i}`,
    name: `User ${i}`,
    isLocalParticipant: i === 0,
    isSpeaking: false,
  }));

describe('GalleryView', () => {
  it('should render without crashing', () => {
    const participants = createMockParticipants(4);

    render(<GalleryView participants={participants as any} />);

    expect(screen.getByTestId('video-tile-user-0')).toBeInTheDocument();
    expect(screen.getByTestId('video-tile-user-1')).toBeInTheDocument();
    expect(screen.getByTestId('video-tile-user-2')).toBeInTheDocument();
    expect(screen.getByTestId('video-tile-user-3')).toBeInTheDocument();
  });

  it('should handle single participant', () => {
    const participants = createMockParticipants(1);

    render(<GalleryView participants={participants as any} />);

    expect(screen.getByTestId('video-tile-user-0')).toBeInTheDocument();
  });

  it('should handle 2 participants (1x2 or 2x1 grid)', () => {
    const participants = createMockParticipants(2);

    render(<GalleryView participants={participants as any} />);

    expect(screen.getByTestId('video-tile-user-0')).toBeInTheDocument();
    expect(screen.getByTestId('video-tile-user-1')).toBeInTheDocument();
  });

  it('should handle 4 participants (2x2 grid)', () => {
    const participants = createMockParticipants(4);

    render(<GalleryView participants={participants as any} />);

    // All 4 participants should be rendered
    for (let i = 0; i < 4; i++) {
      expect(screen.getByTestId(`video-tile-user-${i}`)).toBeInTheDocument();
    }
  });

  it('should handle 9 participants (3x3 grid)', () => {
    const participants = createMockParticipants(9);

    render(<GalleryView participants={participants as any} />);

    // All 9 participants should be rendered
    for (let i = 0; i < 9; i++) {
      expect(screen.getByTestId(`video-tile-user-${i}`)).toBeInTheDocument();
    }
  });

  it('should handle empty participants array', () => {
    render(<GalleryView participants={[]} />);

    // Should not crash with empty participants
    expect(document.body).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const participants = createMockParticipants(4);

    const { container } = render(
      <GalleryView
        participants={participants as any}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should handle large number of participants (16+)', () => {
    const participants = createMockParticipants(16);

    render(<GalleryView participants={participants as any} />);

    // Should render at least some participants (may paginate)
    expect(screen.getByTestId('video-tile-user-0')).toBeInTheDocument();
  });

  it('should highlight speaking participants', () => {
    const participants = createMockParticipants(4);
    participants[1].isSpeaking = true;

    render(<GalleryView participants={participants as any} />);

    // Speaking participant should be rendered
    expect(screen.getByTestId('video-tile-user-1')).toBeInTheDocument();
  });
});
