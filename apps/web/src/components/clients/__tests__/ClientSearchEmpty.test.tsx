/**
 * ClientSearchEmpty Component Tests
 * Story 2.4: Client Search & Filter - Task 9
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { ClientSearchEmpty } from '../ClientSearchEmpty';

describe('ClientSearchEmpty', () => {
  const mockOnClearSearch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with sanitized query', () => {
    render(
      <ClientSearchEmpty query="test query" onClearSearch={mockOnClearSearch} />
    );

    expect(screen.getByText('No clients found')).toBeInTheDocument();
    expect(
      screen.getByText(/No clients found matching 'test query'/)
    ).toBeInTheDocument();
  });

  it('sanitizes XSS attempts in query display', () => {
    const xssQuery = '<script>alert("xss")</script>malicious';

    render(
      <ClientSearchEmpty query={xssQuery} onClearSearch={mockOnClearSearch} />
    );

    // Should display sanitized query (script tags removed)
    expect(screen.queryByText(/script/i)).not.toBeInTheDocument();
    expect(screen.getByText(/malicious/i)).toBeInTheDocument();
  });

  it('calls onClearSearch when clear search button is clicked', () => {
    render(
      <ClientSearchEmpty query="test" onClearSearch={mockOnClearSearch} />
    );

    const clearButton = screen.getByRole('button', { name: /clear search/i });
    fireEvent.click(clearButton);

    expect(mockOnClearSearch).toHaveBeenCalledTimes(1);
  });

  it('renders clear search button', () => {
    render(
      <ClientSearchEmpty query="acme" onClearSearch={mockOnClearSearch} />
    );

    const clearButton = screen.getByRole('button', { name: /clear search/i });
    expect(clearButton).toBeInTheDocument();
  });
});
