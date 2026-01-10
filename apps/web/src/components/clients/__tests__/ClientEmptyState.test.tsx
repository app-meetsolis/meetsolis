/**
 * ClientEmptyState Component Tests
 * Story 2.2: Client Dashboard UI - Task 10: Component Tests
 */

import { render, screen } from '@testing-library/react';
import { ClientEmptyState } from '../ClientEmptyState';

describe('ClientEmptyState', () => {
  it('displays empty state message', () => {
    render(<ClientEmptyState />);

    expect(screen.getByText('No clients yet')).toBeInTheDocument();
    expect(
      screen.getByText(/Add your first client to get started/i)
    ).toBeInTheDocument();
  });

  it('renders Add Client button', () => {
    render(<ClientEmptyState />);

    const button = screen.getByRole('button', { name: /add client/i });
    expect(button).toBeInTheDocument();
  });

  it('displays icon', () => {
    const { container } = render(<ClientEmptyState />);

    // Check for SVG icon (Users icon from lucide-react)
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});
