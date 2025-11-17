/**
 * ParticipantGrid Component Tests
 * Tests for participant grid layout
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ParticipantGrid, type Participant } from '../ParticipantGrid';

const mockStream = {
  getTracks: jest.fn(() => []),
  getVideoTracks: jest.fn(() => []),
} as unknown as MediaStream;

const createParticipant = (
  id: string,
  name: string,
  isLocal = false
): Participant => ({
  id,
  name,
  stream: mockStream,
  isLocal,
  isMuted: false,
  isVideoOff: false,
  connectionQuality: 'good',
});

describe('ParticipantGrid', () => {
  it('should show empty state with no participants', () => {
    render(<ParticipantGrid participants={[]} />);
    expect(screen.getByText('No Participants')).toBeInTheDocument();
    expect(
      screen.getByText('Waiting for others to join...')
    ).toBeInTheDocument();
  });

  it('should render single participant', () => {
    const participants = [createParticipant('1', 'Alice')];
    render(<ParticipantGrid participants={participants} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('1 participant in the call')).toBeInTheDocument();
  });

  it('should render two participants', () => {
    const participants = [
      createParticipant('1', 'Alice'),
      createParticipant('2', 'Bob'),
    ];
    render(<ParticipantGrid participants={participants} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('2 participants in the call')).toBeInTheDocument();
  });

  it('should render three participants', () => {
    const participants = [
      createParticipant('1', 'Alice'),
      createParticipant('2', 'Bob'),
      createParticipant('3', 'Charlie'),
    ];
    render(<ParticipantGrid participants={participants} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    expect(screen.getByText('3 participants in the call')).toBeInTheDocument();
  });

  it('should render four participants', () => {
    const participants = [
      createParticipant('1', 'Alice'),
      createParticipant('2', 'Bob'),
      createParticipant('3', 'Charlie'),
      createParticipant('4', 'David'),
    ];
    render(<ParticipantGrid participants={participants} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    expect(screen.getByText('David')).toBeInTheDocument();
    expect(screen.getByText('4 participants in the call')).toBeInTheDocument();
  });

  it('should sort local participant first', () => {
    const participants = [
      createParticipant('1', 'Alice'),
      createParticipant('2', 'Bob', true), // Local user
      createParticipant('3', 'Charlie'),
    ];

    const { container } = render(
      <ParticipantGrid participants={participants} />
    );
    const tiles = container.querySelectorAll('[role="button"]');

    // Local user should be first
    expect(tiles[0].textContent).toContain('Bob');
    expect(tiles[0].textContent).toContain('You');
  });

  it('should sort non-local participants alphabetically', () => {
    const participants = [
      createParticipant('1', 'Charlie'),
      createParticipant('2', 'Alice'),
      createParticipant('3', 'Bob'),
    ];

    render(<ParticipantGrid participants={participants} />);
    const names = screen.getAllByText(/Alice|Bob|Charlie/);

    // Should be in alphabetical order
    expect(names[0].textContent).toBe('Alice');
    expect(names[1].textContent).toBe('Bob');
    expect(names[2].textContent).toBe('Charlie');
  });

  it('should have proper ARIA region label', () => {
    const participants = [createParticipant('1', 'Alice')];
    render(<ParticipantGrid participants={participants} />);
    expect(
      screen.getByLabelText('Video call participants')
    ).toBeInTheDocument();
  });

  it('should announce participant count to screen readers', () => {
    const participants = [
      createParticipant('1', 'Alice'),
      createParticipant('2', 'Bob'),
    ];
    render(<ParticipantGrid participants={participants} />);
    expect(screen.getByText('2 participants in the call')).toBeInTheDocument();
  });
});
