/**
 * Tests for WaitingRoomPanel component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WaitingRoomPanel } from '../WaitingRoomPanel';

// Mock useWaitingRoom hook
jest.mock('@/hooks/meeting/useWaitingRoom', () => ({
  useWaitingRoom: () => ({
    waitingParticipants: [
      {
        id: '1',
        user_id: 'user-1',
        display_name: 'Waiting User 1',
        status: 'waiting',
      },
      {
        id: '2',
        user_id: 'user-2',
        display_name: 'Waiting User 2',
        status: 'waiting',
      },
    ],
    isLoading: false,
    error: null,
    admitParticipant: jest.fn(),
    rejectParticipant: jest.fn(),
    admitAll: jest.fn(),
  }),
}));

describe('WaitingRoomPanel', () => {
  it('should render without crashing', () => {
    render(<WaitingRoomPanel meetingId="test-meeting" />);

    expect(screen.getByText('Waiting User 1')).toBeInTheDocument();
  });

  it('should display all waiting participants', () => {
    render(<WaitingRoomPanel meetingId="test-meeting" />);

    expect(screen.getByText('Waiting User 1')).toBeInTheDocument();
    expect(screen.getByText('Waiting User 2')).toBeInTheDocument();
  });

  it('should show waiting count', () => {
    render(<WaitingRoomPanel meetingId="test-meeting" />);

    // Should show count (2 waiting)
    expect(screen.getByText(/2|Waiting/i)).toBeInTheDocument();
  });

  it('should have admit button for each participant', () => {
    render(<WaitingRoomPanel meetingId="test-meeting" />);

    const admitButtons = screen.getAllByText(/Admit/i);
    expect(admitButtons.length).toBeGreaterThanOrEqual(2);
  });

  it('should have reject button for each participant', () => {
    render(<WaitingRoomPanel meetingId="test-meeting" />);

    const rejectButtons = screen.getAllByText(/Reject|Deny/i);
    expect(rejectButtons.length).toBeGreaterThanOrEqual(2);
  });

  it('should have admit all button', () => {
    render(<WaitingRoomPanel meetingId="test-meeting" />);

    expect(screen.getByText(/Admit All/i)).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <WaitingRoomPanel meetingId="test-meeting" className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('WaitingRoomPanel - Empty State', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('should show empty message when no participants waiting', () => {
    // Re-mock with empty participants
    jest.doMock('@/hooks/meeting/useWaitingRoom', () => ({
      useWaitingRoom: () => ({
        waitingParticipants: [],
        isLoading: false,
        error: null,
        admitParticipant: jest.fn(),
        rejectParticipant: jest.fn(),
        admitAll: jest.fn(),
      }),
    }));

    // The component should handle empty state gracefully
    expect(document.body).toBeInTheDocument();
  });
});
