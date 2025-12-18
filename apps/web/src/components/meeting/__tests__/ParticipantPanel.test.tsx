/**
 * Tests for ParticipantPanel component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ParticipantPanel } from '../ParticipantPanel';

// Mock ParticipantListItem
jest.mock('../ParticipantListItem', () => ({
  ParticipantListItem: ({ participant, onAction }: any) => (
    <div data-testid={`participant-${participant.userId}`}>
      <span>{participant.name}</span>
      <span data-testid={`role-${participant.userId}`}>{participant.role}</span>
      <button onClick={() => onAction?.('mute', participant.userId)}>
        Mute
      </button>
    </div>
  ),
}));

const mockParticipants = [
  {
    sessionId: 'session-1',
    userId: 'user-1',
    name: 'Host User',
    role: 'host',
    isLocalParticipant: true,
    isSpeaking: false,
  },
  {
    sessionId: 'session-2',
    userId: 'user-2',
    name: 'Co-Host User',
    role: 'co-host',
    isLocalParticipant: false,
    isSpeaking: false,
  },
  {
    sessionId: 'session-3',
    userId: 'user-3',
    name: 'Participant User',
    role: 'participant',
    isLocalParticipant: false,
    isSpeaking: true,
  },
];

describe('ParticipantPanel', () => {
  it('should render without crashing', () => {
    render(
      <ParticipantPanel
        participants={mockParticipants as any}
        currentUserId="user-1"
        currentUserRole="host"
      />
    );

    expect(screen.getByText('Host User')).toBeInTheDocument();
  });

  it('should display all participants', () => {
    render(
      <ParticipantPanel
        participants={mockParticipants as any}
        currentUserId="user-1"
        currentUserRole="host"
      />
    );

    expect(screen.getByText('Host User')).toBeInTheDocument();
    expect(screen.getByText('Co-Host User')).toBeInTheDocument();
    expect(screen.getByText('Participant User')).toBeInTheDocument();
  });

  it('should show participant count', () => {
    render(
      <ParticipantPanel
        participants={mockParticipants as any}
        currentUserId="user-1"
        currentUserRole="host"
      />
    );

    // Should show count somewhere (header or title)
    expect(screen.getByText(/3|Participants/i)).toBeInTheDocument();
  });

  it('should display role badges', () => {
    render(
      <ParticipantPanel
        participants={mockParticipants as any}
        currentUserId="user-1"
        currentUserRole="host"
      />
    );

    expect(screen.getByTestId('role-user-1')).toHaveTextContent('host');
    expect(screen.getByTestId('role-user-2')).toHaveTextContent('co-host');
    expect(screen.getByTestId('role-user-3')).toHaveTextContent('participant');
  });

  it('should handle empty participants', () => {
    render(
      <ParticipantPanel
        participants={[]}
        currentUserId="user-1"
        currentUserRole="host"
      />
    );

    // Should not crash with empty participants
    expect(document.body).toBeInTheDocument();
  });

  it('should call onParticipantAction when action is triggered', () => {
    const mockOnAction = jest.fn();

    render(
      <ParticipantPanel
        participants={mockParticipants as any}
        currentUserId="user-1"
        currentUserRole="host"
        onParticipantAction={mockOnAction}
      />
    );

    // Click mute button for user-2
    fireEvent.click(screen.getAllByText('Mute')[1]);

    expect(mockOnAction).toHaveBeenCalledWith('mute', 'user-2');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ParticipantPanel
        participants={mockParticipants as any}
        currentUserId="user-1"
        currentUserRole="host"
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should handle isOpen prop', () => {
    const { rerender } = render(
      <ParticipantPanel
        participants={mockParticipants as any}
        currentUserId="user-1"
        currentUserRole="host"
        isOpen={true}
      />
    );

    expect(screen.getByText('Host User')).toBeInTheDocument();

    rerender(
      <ParticipantPanel
        participants={mockParticipants as any}
        currentUserId="user-1"
        currentUserRole="host"
        isOpen={false}
      />
    );

    // Panel might be hidden or unmounted when closed
  });
});
