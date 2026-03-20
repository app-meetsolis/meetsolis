/**
 * SessionTimeline Component Tests — Story 3.5
 * Tests refetchInterval polling logic.
 */

import React from 'react';
import { render } from '@testing-library/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SessionTimeline } from '@/components/sessions/SessionTimeline';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock('@/components/sessions/SessionCard', function () {
  const React = require('react');
  return {
    SessionCard: function SessionCard() {
      return React.createElement('div', { 'data-testid': 'session-card' });
    },
  };
});

jest.mock('@/components/sessions/SessionUploadModal', function () {
  const React = require('react');
  return {
    SessionUploadModal: function SessionUploadModal() {
      return null;
    },
  };
});

jest.mock('@/components/ui/skeleton', function () {
  const React = require('react');
  return {
    Skeleton: function Skeleton() {
      return React.createElement('div', { className: 'animate-pulse' });
    },
  };
});

jest.mock('@/components/ui/button', function () {
  const React = require('react');
  return {
    Button: function Button({
      children,
      onClick,
    }: {
      children: React.ReactNode;
      onClick?: () => void;
    }) {
      return React.createElement('button', { onClick }, children);
    },
  };
});

const mockUseQuery = useQuery as jest.Mock;
const mockUseQueryClient = useQueryClient as jest.Mock;

beforeEach(() => {
  mockUseQueryClient.mockReturnValue({ invalidateQueries: jest.fn() });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('SessionTimeline — refetchInterval polling', () => {
  it('returns 5000 when any session has status processing', () => {
    let capturedOptions: Parameters<typeof useQuery>[0] | undefined;
    mockUseQuery.mockImplementation(
      (options: Parameters<typeof useQuery>[0]) => {
        capturedOptions = options;
        return { data: [{ id: 's1', status: 'processing' }], isLoading: false };
      }
    );

    render(<SessionTimeline clientId="client-1" />);

    expect(capturedOptions).toBeDefined();
    const refetchInterval = (
      capturedOptions as { refetchInterval: (query: unknown) => unknown }
    ).refetchInterval;
    const interval = refetchInterval({
      state: { data: [{ status: 'processing' }] },
    });
    expect(interval).toBe(5000);
  });

  it('returns false when no sessions are processing', () => {
    let capturedOptions: Parameters<typeof useQuery>[0] | undefined;
    mockUseQuery.mockImplementation(
      (options: Parameters<typeof useQuery>[0]) => {
        capturedOptions = options;
        return {
          data: [
            { id: 's1', status: 'complete' },
            { id: 's2', status: 'error' },
          ],
          isLoading: false,
        };
      }
    );

    render(<SessionTimeline clientId="client-1" />);

    expect(capturedOptions).toBeDefined();
    const refetchInterval = (
      capturedOptions as { refetchInterval: (query: unknown) => unknown }
    ).refetchInterval;
    const interval = refetchInterval({
      state: { data: [{ status: 'complete' }, { status: 'error' }] },
    });
    expect(interval).toBe(false);
  });
});
