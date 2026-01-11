/**
 * TierLimitDialog Component Tests
 * Story 2.3: Add/Edit Client Modal - Task 9
 *
 * Tests for:
 * - Tier limit warning display
 * - Upgrade button navigation
 * - Cancel button
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TierLimitDialog } from '../TierLimitDialog';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('TierLimitDialog', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    render(
      <TierLimitDialog
        isOpen={false}
        onClose={mockOnClose}
        currentCount={3}
        maxClients={3}
      />
    );

    expect(screen.queryByText('Client Limit Reached')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(
      <TierLimitDialog
        isOpen={true}
        onClose={mockOnClose}
        currentCount={3}
        maxClients={3}
      />
    );

    expect(screen.getByText('Client Limit Reached')).toBeInTheDocument();
  });

  it('should display correct limit message', () => {
    render(
      <TierLimitDialog
        isOpen={true}
        onClose={mockOnClose}
        currentCount={3}
        maxClients={3}
      />
    );

    expect(
      screen.getByText(/You've reached your client limit \(3\/3\)/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Upgrade to Pro for 50 clients/i)
    ).toBeInTheDocument();
  });

  it('should call onClose when Cancel button clicked', () => {
    render(
      <TierLimitDialog
        isOpen={true}
        onClose={mockOnClose}
        currentCount={3}
        maxClients={3}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should navigate to /pricing when Upgrade button clicked', () => {
    render(
      <TierLimitDialog
        isOpen={true}
        onClose={mockOnClose}
        currentCount={3}
        maxClients={3}
      />
    );

    const upgradeButton = screen.getByText('Upgrade');
    fireEvent.click(upgradeButton);

    expect(mockPush).toHaveBeenCalledWith('/pricing');
    expect(mockOnClose).toHaveBeenCalled();
  });
});
