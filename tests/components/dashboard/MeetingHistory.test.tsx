/**
 * MeetingHistory Component Tests
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MeetingHistory } from '@/components/dashboard/MeetingHistory';
import * as meetingsService from '@/services/meetings';
import type { Meeting } from '@meetsolis/shared';

// Mock the services
jest.mock('@/services/meetings');
jest.mock('@/hooks/useMeetingRealtime', () => ({
  useMeetingRealtime: () => ({ isConnected: true, error: null }),
}));

const mockMeetings: Meeting[] = [
  {
    id: '1',
    host_id: 'user1',
    title: 'Client Review Call',
    description: 'Q4 project review',
    status: 'scheduled',
    created_at: '2025-10-01T10:00:00Z',
    updated_at: '2025-10-01T10:00:00Z',
    invite_link: 'https://meetsolis.com/meeting/abc123',
    settings: {
      allow_screen_share: true,
      allow_whiteboard: true,
      allow_file_upload: true,
      auto_record: false,
      enable_reactions: true,
      enable_polls: true,
      background_blur_default: false,
    },
    waiting_room_enabled: false,
    locked: false,
    max_participants: 100,
  },
  {
    id: '2',
    host_id: 'user1',
    title: 'Team Standup',
    description: 'Daily sync',
    status: 'ended',
    created_at: '2025-09-30T09:00:00Z',
    updated_at: '2025-09-30T09:00:00Z',
    actual_start: '2025-09-30T09:00:00Z',
    actual_end: '2025-09-30T09:30:00Z',
    invite_link: 'https://meetsolis.com/meeting/xyz789',
    settings: {
      allow_screen_share: true,
      allow_whiteboard: true,
      allow_file_upload: true,
      auto_record: false,
      enable_reactions: true,
      enable_polls: true,
      background_blur_default: false,
    },
    waiting_room_enabled: false,
    locked: false,
    max_participants: 100,
  },
];

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe('MeetingHistory Component', () => {
  beforeEach(() => {
    (meetingsService.getMeetings as jest.Mock).mockResolvedValue(mockMeetings);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders meeting history with meetings', async () => {
    renderWithQueryClient(<MeetingHistory />);

    await waitFor(() => {
      expect(screen.getByText('Client Review Call')).toBeInTheDocument();
      expect(screen.getByText('Team Standup')).toBeInTheDocument();
    });
  });

  it('displays live connection indicator when connected', async () => {
    renderWithQueryClient(<MeetingHistory />);

    await waitFor(() => {
      expect(screen.getByText('Live')).toBeInTheDocument();
    });
  });

  it('filters meetings by search term', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<MeetingHistory />);

    await waitFor(() => {
      expect(screen.getByText('Client Review Call')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search meetings...');
    await user.type(searchInput, 'Client');

    // Wait for debounce and refetch
    await waitFor(
      () => {
        expect(meetingsService.getMeetings).toHaveBeenCalledWith(
          expect.objectContaining({ search: 'Client' })
        );
      },
      { timeout: 500 }
    );
  });

  it('filters meetings by status', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<MeetingHistory />);

    await waitFor(() => {
      expect(screen.getByText('Client Review Call')).toBeInTheDocument();
    });

    const statusFilter = screen.getByRole('combobox');
    await user.click(statusFilter);

    const endedOption = screen.getByRole('option', { name: /ended/i });
    await user.click(endedOption);

    await waitFor(() => {
      expect(meetingsService.getMeetings).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'ended' })
      );
    });
  });

  it('displays empty state when no meetings found', async () => {
    (meetingsService.getMeetings as jest.Mock).mockResolvedValue([]);

    renderWithQueryClient(<MeetingHistory />);

    await waitFor(() => {
      expect(screen.getByText('No meetings found')).toBeInTheDocument();
    });
  });

  it('displays error state when fetch fails', async () => {
    (meetingsService.getMeetings as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    renderWithQueryClient(<MeetingHistory />);

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load meetings. Please try again.')
      ).toBeInTheDocument();
    });
  });
});
