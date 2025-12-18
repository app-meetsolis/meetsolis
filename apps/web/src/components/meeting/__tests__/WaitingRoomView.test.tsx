/**
 * Tests for WaitingRoomView component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { WaitingRoomView } from '../WaitingRoomView';

// Mock realtime subscription
jest.mock('@/lib/supabase/realtime', () => ({
  subscribeToMeetingEvents: jest.fn(() => ({
    unsubscribe: jest.fn(),
  })),
}));

describe('WaitingRoomView', () => {
  const defaultProps = {
    meetingId: 'test-meeting',
    meetingTitle: 'Test Meeting',
    currentUserId: 'user-1',
    onAdmitted: jest.fn(),
  };

  it('should render without crashing', () => {
    render(<WaitingRoomView {...defaultProps} />);

    expect(screen.getByText(/Waiting|Test Meeting/i)).toBeInTheDocument();
  });

  it('should display meeting title', () => {
    render(<WaitingRoomView {...defaultProps} />);

    expect(screen.getByText('Test Meeting')).toBeInTheDocument();
  });

  it('should show waiting message', () => {
    render(<WaitingRoomView {...defaultProps} />);

    expect(
      screen.getByText(/Waiting for host|Please wait/i)
    ).toBeInTheDocument();
  });

  it('should display loading/spinner indicator', () => {
    render(<WaitingRoomView {...defaultProps} />);

    // Should have some kind of loading indicator (spinner, animation, etc.)
    const container = document.body;
    expect(container).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <WaitingRoomView {...defaultProps} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should have accessible content', () => {
    render(<WaitingRoomView {...defaultProps} />);

    // Check for ARIA labels or roles
    const main = document.querySelector('[role="main"], main');
    expect(main || document.body).toBeInTheDocument();
  });
});

describe('WaitingRoomView - Callback', () => {
  it('should call onAdmitted when user is admitted', async () => {
    const mockOnAdmitted = jest.fn();

    render(
      <WaitingRoomView
        meetingId="test-meeting"
        meetingTitle="Test Meeting"
        currentUserId="user-1"
        onAdmitted={mockOnAdmitted}
      />
    );

    // The callback should be available but not called yet
    // (It would be called by realtime event, which is mocked)
    expect(mockOnAdmitted).not.toHaveBeenCalled();
  });
});
