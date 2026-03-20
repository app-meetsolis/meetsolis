/**
 * SessionCard Component Tests — Story 3.5
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SessionCard } from '@/components/sessions/SessionCard';
import { Session } from '@meetsolis/shared';

jest.mock('next/link', () => ({
  __esModule: true,
  default: function MockLink({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) {
    return React.createElement('a', { href, className }, children);
  },
}));

jest.mock('@/components/sessions/ActionItemList', function () {
  const React = require('react');
  return {
    ActionItemList: function ActionItemList() {
      return React.createElement('div', { 'data-testid': 'action-item-list' });
    },
  };
});

const CLIENT_ID = 'client-1';
const onRetry = jest.fn();

function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: 'session-1',
    user_id: 'user-1',
    client_id: CLIENT_ID,
    session_date: '2026-03-15T10:00:00Z',
    title: 'Discovery Session',
    summary: 'We discussed goals and challenges in detail.',
    key_topics: ['Goals', 'Challenges', 'Mindset', 'Extra'],
    status: 'complete',
    transcript_text: 'Full transcript text here.',
    transcript_file_url: null,
    transcript_audio_url: null,
    action_items: [],
    embedding: null,
    created_at: '2026-03-15T10:00:00Z',
    updated_at: '2026-03-15T10:00:00Z',
    ...overrides,
  } as Session;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SessionCard', () => {
  it('renders collapsed view with date, title, summary snippet and max 3 topic badges', () => {
    render(
      <SessionCard
        session={makeSession()}
        clientId={CLIENT_ID}
        onRetry={onRetry}
      />
    );

    expect(screen.getByText('Discovery Session')).toBeInTheDocument();
    expect(screen.getByText('Mar 15, 2026')).toBeInTheDocument();
    // Summary snippet (first 150 chars)
    expect(
      screen.getByText('We discussed goals and challenges in detail.')
    ).toBeInTheDocument();
    // Max 3 topics shown + "+1 more" badge
    expect(screen.getByText('Goals')).toBeInTheDocument();
    expect(screen.getByText('Challenges')).toBeInTheDocument();
    expect(screen.getByText('Mindset')).toBeInTheDocument();
    expect(screen.getByText('+1 more')).toBeInTheDocument();
  });

  it('expands to show full summary, all topics, ActionItemList, and transcript link', () => {
    render(
      <SessionCard
        session={makeSession()}
        clientId={CLIENT_ID}
        onRetry={onRetry}
      />
    );

    fireEvent.click(screen.getByRole('button'));

    expect(
      screen.getByText('We discussed goals and challenges in detail.')
    ).toBeInTheDocument();
    expect(screen.getByText('Extra')).toBeInTheDocument();
    expect(screen.getByTestId('action-item-list')).toBeInTheDocument();
    expect(screen.getByText('View Full Transcript →')).toBeInTheDocument();
  });

  it('collapses on second click', () => {
    render(
      <SessionCard
        session={makeSession()}
        clientId={CLIENT_ID}
        onRetry={onRetry}
      />
    );

    const btn = screen.getByRole('button');
    fireEvent.click(btn);
    expect(screen.getByTestId('action-item-list')).toBeInTheDocument();

    fireEvent.click(btn);
    expect(screen.queryByTestId('action-item-list')).not.toBeInTheDocument();
  });

  it('shows spinner and processing text when status is processing', () => {
    render(
      <SessionCard
        session={makeSession({
          status: 'processing',
          transcript_audio_url: null,
          transcript_text: null,
        })}
        clientId={CLIENT_ID}
        onRetry={onRetry}
      />
    );

    expect(
      screen.getByText('AI is processing your session…')
    ).toBeInTheDocument();
    // No expand button
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows "Transcribing audio…" when audio uploaded but not yet transcribed', () => {
    render(
      <SessionCard
        session={makeSession({
          status: 'processing',
          transcript_audio_url: 'https://example.com/audio.mp3',
          transcript_text: null,
        })}
        clientId={CLIENT_ID}
        onRetry={onRetry}
      />
    );

    expect(screen.getByText('Transcribing audio…')).toBeInTheDocument();
  });

  it('shows red border, error message, and Retry button when status is error', () => {
    render(
      <SessionCard
        session={makeSession({ status: 'error' })}
        clientId={CLIENT_ID}
        onRetry={onRetry}
      />
    );

    expect(
      screen.getByText('AI processing failed. Please retry.')
    ).toBeInTheDocument();
    const retryBtn = screen.getByRole('button', { name: /retry/i });
    expect(retryBtn).toBeInTheDocument();

    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalledWith('session-1');
  });

  it('action item badge is green when all completed, amber when any pending', () => {
    const allDone = makeSession({
      action_items: [
        { id: 'a1', status: 'completed' },
        { id: 'a2', status: 'completed' },
      ] as Session['action_items'],
    });
    const { rerender, container } = render(
      <SessionCard session={allDone} clientId={CLIENT_ID} onRetry={onRetry} />
    );
    const greenBadge = container.querySelector('.bg-green-100');
    expect(greenBadge).toBeInTheDocument();

    const somePending = makeSession({
      action_items: [
        { id: 'a1', status: 'completed' },
        { id: 'a2', status: 'pending' },
      ] as Session['action_items'],
    });
    rerender(
      <SessionCard
        session={somePending}
        clientId={CLIENT_ID}
        onRetry={onRetry}
      />
    );
    const amberBadge = container.querySelector('.bg-amber-100');
    expect(amberBadge).toBeInTheDocument();
  });
});
