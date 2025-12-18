/**
 * Tests for TwoPersonView component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { TwoPersonView } from '../TwoPersonView';

// Mock StreamVideoTile
jest.mock('../StreamVideoTile', () => ({
  StreamVideoTile: ({ participant, fillContainer }: any) => (
    <div
      data-testid={`video-tile-${participant.userId}`}
      data-fill-container={fillContainer}
    >
      {participant.name || participant.userId}
    </div>
  ),
}));

// Mock SelfView
jest.mock('../SelfView', () => ({
  SelfView: ({ localParticipant, forceVisible }: any) => (
    <div data-testid="self-view" data-force-visible={forceVisible}>
      {localParticipant.name} (Self)
    </div>
  ),
}));

const mockLocalParticipant = {
  sessionId: 'session-1',
  userId: 'user-1',
  name: 'Local User',
  isLocalParticipant: true,
  isSpeaking: false,
};

const mockRemoteParticipant = {
  sessionId: 'session-2',
  userId: 'user-2',
  name: 'Remote User',
  isLocalParticipant: false,
  isSpeaking: true,
};

describe('TwoPersonView', () => {
  it('should render without crashing', () => {
    render(
      <TwoPersonView
        localParticipant={mockLocalParticipant as any}
        remoteParticipant={mockRemoteParticipant as any}
      />
    );

    expect(screen.getByTestId('video-tile-user-2')).toBeInTheDocument();
  });

  it('should render remote participant as main view', () => {
    render(
      <TwoPersonView
        localParticipant={mockLocalParticipant as any}
        remoteParticipant={mockRemoteParticipant as any}
      />
    );

    expect(screen.getByText('Remote User')).toBeInTheDocument();
  });

  it('should render self view', () => {
    render(
      <TwoPersonView
        localParticipant={mockLocalParticipant as any}
        remoteParticipant={mockRemoteParticipant as any}
      />
    );

    expect(screen.getByTestId('self-view')).toBeInTheDocument();
  });

  it('should pass forceVisible=true to SelfView', () => {
    render(
      <TwoPersonView
        localParticipant={mockLocalParticipant as any}
        remoteParticipant={mockRemoteParticipant as any}
      />
    );

    const selfView = screen.getByTestId('self-view');
    expect(selfView).toHaveAttribute('data-force-visible', 'true');
  });

  it('should pass fillContainer=true to StreamVideoTile', () => {
    render(
      <TwoPersonView
        localParticipant={mockLocalParticipant as any}
        remoteParticipant={mockRemoteParticipant as any}
      />
    );

    const videoTile = screen.getByTestId('video-tile-user-2');
    expect(videoTile).toHaveAttribute('data-fill-container', 'true');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <TwoPersonView
        localParticipant={mockLocalParticipant as any}
        remoteParticipant={mockRemoteParticipant as any}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should handle immersiveMode prop', () => {
    render(
      <TwoPersonView
        localParticipant={mockLocalParticipant as any}
        remoteParticipant={mockRemoteParticipant as any}
        immersiveMode={true}
      />
    );

    // Should still render in immersive mode
    expect(screen.getByTestId('video-tile-user-2')).toBeInTheDocument();
  });

  it('should handle null localParticipant', () => {
    render(
      <TwoPersonView
        localParticipant={null as any}
        remoteParticipant={mockRemoteParticipant as any}
      />
    );

    // Remote should still render
    expect(screen.getByTestId('video-tile-user-2')).toBeInTheDocument();

    // Self view should not render
    expect(screen.queryByTestId('self-view')).not.toBeInTheDocument();
  });
});

describe('TwoPersonView - Layout', () => {
  it('should have full-screen background', () => {
    const { container } = render(
      <TwoPersonView
        localParticipant={mockLocalParticipant as any}
        remoteParticipant={mockRemoteParticipant as any}
      />
    );

    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass('bg-gray-900');
    expect(root).toHaveClass('h-full');
    expect(root).toHaveClass('w-full');
  });

  it('should have relative positioning', () => {
    const { container } = render(
      <TwoPersonView
        localParticipant={mockLocalParticipant as any}
        remoteParticipant={mockRemoteParticipant as any}
      />
    );

    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass('relative');
  });
});
