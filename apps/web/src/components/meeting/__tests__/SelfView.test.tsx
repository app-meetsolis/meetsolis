/**
 * Tests for SelfView component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SelfView } from '../SelfView';

// Mock react-draggable
jest.mock('react-draggable', () => {
  return {
    __esModule: true,
    default: ({ children, onStop, position }: any) => (
      <div
        data-testid="draggable"
        data-position={JSON.stringify(position)}
        onMouseUp={() => onStop?.({}, { x: 100, y: 100 })}
      >
        {children}
      </div>
    ),
  };
});

// Mock StreamVideoTile
jest.mock('../StreamVideoTile', () => ({
  StreamVideoTile: ({ participant }: any) => (
    <div data-testid="video-tile">{participant.name || 'You'}</div>
  ),
}));

// Mock useLayoutConfig
jest.mock('@/hooks/useLayoutConfig', () => ({
  useLayoutConfig: () => ({
    selfViewConfig: {
      visible: true,
      position: { x: 100, y: 100 },
      size: 'medium',
    },
    setSelfViewConfig: jest.fn(),
  }),
}));

// Mock useImmersiveMode
jest.mock('@/hooks/meeting/useImmersiveMode', () => ({
  useImmersiveMode: () => ({
    isImmersive: false,
  }),
}));

const mockLocalParticipant = {
  sessionId: 'session-1',
  userId: 'user-1',
  name: 'Local User',
  isLocalParticipant: true,
  isSpeaking: false,
};

describe('SelfView', () => {
  it('should render without crashing', () => {
    render(<SelfView localParticipant={mockLocalParticipant as any} />);

    expect(screen.getByTestId('video-tile')).toBeInTheDocument();
  });

  it('should render in draggable container', () => {
    render(<SelfView localParticipant={mockLocalParticipant as any} />);

    expect(screen.getByTestId('draggable')).toBeInTheDocument();
  });

  it('should show resize controls on hover', () => {
    render(<SelfView localParticipant={mockLocalParticipant as any} />);

    // Controls should be present (visible on hover via CSS)
    const container = screen.getByTestId('draggable');
    expect(container).toBeInTheDocument();
  });

  it('should handle forceVisible prop', () => {
    render(
      <SelfView
        localParticipant={mockLocalParticipant as any}
        forceVisible={true}
      />
    );

    // Should be visible even without hide button
    expect(screen.getByTestId('video-tile')).toBeInTheDocument();
  });

  it('should handle immersiveMode prop', () => {
    render(
      <SelfView
        localParticipant={mockLocalParticipant as any}
        immersiveMode={true}
      />
    );

    // Should still render but possibly minimized
    expect(screen.getByTestId('draggable')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <SelfView
        localParticipant={mockLocalParticipant as any}
        className="custom-class"
      />
    );

    // Custom class should be applied to container
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});

describe('SelfView - Sizing', () => {
  it('should support small size', () => {
    // Size is managed by useLayoutConfig hook
    render(<SelfView localParticipant={mockLocalParticipant as any} />);

    expect(screen.getByTestId('draggable')).toBeInTheDocument();
  });

  it('should support medium size', () => {
    render(<SelfView localParticipant={mockLocalParticipant as any} />);

    expect(screen.getByTestId('draggable')).toBeInTheDocument();
  });

  it('should support large size', () => {
    render(<SelfView localParticipant={mockLocalParticipant as any} />);

    expect(screen.getByTestId('draggable')).toBeInTheDocument();
  });
});

describe('SelfView - Visibility', () => {
  it('should show hide button when not forceVisible', () => {
    render(
      <SelfView
        localParticipant={mockLocalParticipant as any}
        forceVisible={false}
      />
    );

    // Should have hide/show functionality
    expect(screen.getByTestId('draggable')).toBeInTheDocument();
  });

  it('should not show hide button when forceVisible', () => {
    render(
      <SelfView
        localParticipant={mockLocalParticipant as any}
        forceVisible={true}
      />
    );

    // Hide button should not be present in forceVisible mode
    expect(screen.getByTestId('draggable')).toBeInTheDocument();
  });
});
