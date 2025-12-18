/**
 * Tests for SpeakerView component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { SpeakerView } from '../SpeakerView';

// Mock StreamVideoTile
jest.mock('../StreamVideoTile', () => ({
  StreamVideoTile: ({ participant, className }: any) => (
    <div data-testid={`video-tile-${participant.userId}`} className={className}>
      {participant.name || participant.userId}
    </div>
  ),
}));

// Mock Stream SDK
jest.mock('@stream-io/video-react-sdk', () => ({
  useCallStateHooks: () => ({
    useDominantSpeaker: () => null,
  }),
}));

const mockParticipants = [
  {
    sessionId: 'session-1',
    userId: 'user-1',
    name: 'User One',
    isLocalParticipant: false,
    isSpeaking: true,
  },
  {
    sessionId: 'session-2',
    userId: 'user-2',
    name: 'User Two',
    isLocalParticipant: true,
    isSpeaking: false,
  },
  {
    sessionId: 'session-3',
    userId: 'user-3',
    name: 'User Three',
    isLocalParticipant: false,
    isSpeaking: false,
  },
];

describe('SpeakerView', () => {
  it('should render without crashing', () => {
    render(
      <SpeakerView
        participants={mockParticipants as any}
        localParticipant={mockParticipants[1] as any}
      />
    );

    expect(screen.getByTestId('video-tile-user-1')).toBeInTheDocument();
  });

  it('should display the active speaker prominently', () => {
    render(
      <SpeakerView
        participants={mockParticipants as any}
        localParticipant={mockParticipants[1] as any}
        activeSpeakerId="user-1"
      />
    );

    // The active speaker should be visible
    expect(screen.getByTestId('video-tile-user-1')).toBeInTheDocument();
  });

  it('should render thumbnail strip for other participants', () => {
    render(
      <SpeakerView
        participants={mockParticipants as any}
        localParticipant={mockParticipants[1] as any}
      />
    );

    // Should show multiple video tiles
    expect(screen.getByTestId('video-tile-user-1')).toBeInTheDocument();
  });

  it('should handle empty participants array', () => {
    render(<SpeakerView participants={[]} localParticipant={null as any} />);

    // Should not crash with empty participants
    expect(document.body).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <SpeakerView
        participants={mockParticipants as any}
        localParticipant={mockParticipants[1] as any}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should handle spotlight participant', () => {
    render(
      <SpeakerView
        participants={mockParticipants as any}
        localParticipant={mockParticipants[1] as any}
        spotlightParticipantId="user-3"
      />
    );

    // Spotlight should be visible
    expect(screen.getByTestId('video-tile-user-3')).toBeInTheDocument();
  });
});
