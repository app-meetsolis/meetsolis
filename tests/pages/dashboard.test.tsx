/**
 * Dashboard Page Tests
 */

import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardPage from '@/app/(dashboard)/dashboard/page';
import * as useAuthHook from '@/hooks/useAuth';

// Mock dependencies
jest.mock('@/hooks/useAuth');
jest.mock('@/services/meetings', () => ({
  getMeetings: jest.fn().mockResolvedValue([]),
}));
jest.mock('@/hooks/useMeetingRealtime', () => ({
  useMeetingRealtime: () => ({ isConnected: true, error: null }),
}));
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const mockUseAuth = useAuthHook.useAuth as jest.MockedFunction<
  typeof useAuthHook.useAuth
>;

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

describe('Dashboard Page', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state while fetching user', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
      error: null,
    });

    renderWithQueryClient(<DashboardPage />);

    expect(screen.getAllByRole('status')).toHaveLength(3); // Skeleton loaders
  });

  it('displays dashboard with user data', async () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        clerk_id: 'clerk_123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
      isLoading: false,
      error: null,
    });

    renderWithQueryClient(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Welcome back, John!')).toBeInTheDocument();
      expect(
        screen.getByText('Manage your meetings and track your productivity')
      ).toBeInTheDocument();
    });
  });

  it('displays create meeting button', async () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        clerk_id: 'clerk_123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
      isLoading: false,
      error: null,
    });

    renderWithQueryClient(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Start Meeting')).toBeInTheDocument();
    });
  });

  it('displays metrics preview section', async () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        clerk_id: 'clerk_123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
      isLoading: false,
      error: null,
    });

    renderWithQueryClient(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Meeting Metrics')).toBeInTheDocument();
      expect(screen.getByText('Total Meetings')).toBeInTheDocument();
      expect(screen.getByText('Meeting Hours')).toBeInTheDocument();
      expect(screen.getByText('Avg. Duration')).toBeInTheDocument();
    });
  });

  it('displays meeting history section', async () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        clerk_id: 'clerk_123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
      isLoading: false,
      error: null,
    });

    renderWithQueryClient(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Meeting History')).toBeInTheDocument();
    });
  });
});
