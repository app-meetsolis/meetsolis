/**
 * ClientErrorState Component Tests
 * Story 2.2: Client Dashboard UI - Task 10: Component Tests
 */

import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ClientErrorState } from '../ClientErrorState';

describe('ClientErrorState', () => {
  const mockOnRetry = jest.fn();

  beforeEach(() => {
    mockOnRetry.mockClear();
  });

  it('displays error message', () => {
    render(
      <ClientErrorState error="Failed to load clients" onRetry={mockOnRetry} />
    );

    expect(screen.getByText(/Failed to load clients/)).toBeInTheDocument();
    expect(screen.getByText(/Please try again/)).toBeInTheDocument();
  });

  it('displays default error message when no error prop provided', () => {
    render(<ClientErrorState onRetry={mockOnRetry} />);

    expect(screen.getByText(/Failed to load clients/)).toBeInTheDocument();
  });

  it('displays custom error message', () => {
    render(
      <ClientErrorState error="Network error occurred" onRetry={mockOnRetry} />
    );

    expect(screen.getByText(/Network error occurred/)).toBeInTheDocument();
  });

  it('renders Retry button', () => {
    render(<ClientErrorState error="Test error" onRetry={mockOnRetry} />);

    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('calls onRetry when Retry button is clicked', async () => {
    const user = userEvent.setup();
    render(<ClientErrorState error="Test error" onRetry={mockOnRetry} />);

    const retryButton = screen.getByRole('button', { name: /retry/i });
    await user.click(retryButton);

    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('displays error icon', () => {
    const { container } = render(
      <ClientErrorState error="Test error" onRetry={mockOnRetry} />
    );

    // Check for SVG icon (AlertCircle icon from lucide-react)
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});
