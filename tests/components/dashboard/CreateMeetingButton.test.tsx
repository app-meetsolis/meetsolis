/**
 * CreateMeetingButton Component Tests
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { CreateMeetingButton } from '@/components/dashboard/CreateMeetingButton';
import * as meetingsService from '@/services/meetings';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
jest.mock('@/services/meetings');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockPush = jest.fn();
const mockRouter = { push: mockPush };

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe('CreateMeetingButton Component', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders start meeting button', () => {
    renderWithQueryClient(<CreateMeetingButton />);

    expect(screen.getByText('Start Meeting')).toBeInTheDocument();
  });

  it('opens dialog when button is clicked', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<CreateMeetingButton />);

    const button = screen.getByText('Start Meeting');
    await user.click(button);

    expect(screen.getByText('Create New Meeting')).toBeInTheDocument();
    expect(screen.getByLabelText('Meeting Title')).toBeInTheDocument();
  });

  it('creates meeting with valid input', async () => {
    const user = userEvent.setup();
    const mockMeeting = {
      id: '1',
      title: 'Test Meeting',
      invite_link: 'https://meetsolis.com/meeting/test123',
    };
    (meetingsService.createMeeting as jest.Mock).mockResolvedValue(mockMeeting);

    renderWithQueryClient(<CreateMeetingButton />);

    // Open dialog
    await user.click(screen.getByText('Start Meeting'));

    // Fill form
    const titleInput = screen.getByLabelText('Meeting Title');
    await user.clear(titleInput);
    await user.type(titleInput, 'Test Meeting');

    // Submit
    const submitButton = screen.getByRole('button', { name: /start meeting/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(meetingsService.createMeeting).toHaveBeenCalledWith({
        title: 'Test Meeting',
        description: '',
      });
      expect(mockPush).toHaveBeenCalledWith('/meeting/test123');
    });
  });

  it('validates required title field', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<CreateMeetingButton />);

    await user.click(screen.getByText('Start Meeting'));

    const titleInput = screen.getByLabelText('Meeting Title');
    await user.clear(titleInput);

    const submitButton = screen.getByRole('button', { name: /start meeting/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });
  });

  it('shows loading state while creating meeting', async () => {
    const user = userEvent.setup();
    (meetingsService.createMeeting as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    renderWithQueryClient(<CreateMeetingButton />);

    await user.click(screen.getByText('Start Meeting'));

    const submitButton = screen.getByRole('button', { name: /start meeting/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Creating...')).toBeInTheDocument();
    });
  });

  it('displays error when meeting creation fails', async () => {
    const user = userEvent.setup();
    (meetingsService.createMeeting as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    renderWithQueryClient(<CreateMeetingButton />);

    await user.click(screen.getByText('Start Meeting'));

    const submitButton = screen.getByRole('button', { name: /start meeting/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(meetingsService.createMeeting).toHaveBeenCalled();
    });
  });
});
