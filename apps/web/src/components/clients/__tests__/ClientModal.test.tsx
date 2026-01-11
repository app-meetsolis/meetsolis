/**
 * ClientModal Component Tests
 * Story 2.3: Add/Edit Client Modal - Task 9
 *
 * Tests for:
 * - Modal opens/closes correctly
 * - Create/Edit mode titles
 * - Unsaved changes confirmation
 */

import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClientModal } from '../ClientModal';
import { Client } from '@meetsolis/shared';

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  Toaster: () => null,
}));

// Create a test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

// Wrapper component for tests
const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Mock client data
const mockClient: Client = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  user_id: '123e4567-e89b-12d3-a456-426614174001',
  name: 'John Doe',
  company: 'Acme Corp',
  role: 'CEO',
  email: 'john@acme.com',
  phone: '+1234567890',
  website: 'https://acme.com',
  linkedin_url: 'https://linkedin.com/in/johndoe',
  tags: [],
  status: 'active',
  overview: null,
  research_data: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  last_meeting_at: null,
};

describe('ClientModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.confirm = jest.fn(() => true);
  });

  describe('Modal Display', () => {
    it('should not render when isOpen is false', () => {
      render(
        <ClientModal isOpen={false} onClose={mockOnClose} mode="create" />,
        { wrapper }
      );

      expect(screen.queryByText('Add Client')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(
        <ClientModal isOpen={true} onClose={mockOnClose} mode="create" />,
        { wrapper }
      );

      expect(screen.getByText('Add Client')).toBeInTheDocument();
    });

    it('should show "Add Client" title in create mode', () => {
      render(
        <ClientModal isOpen={true} onClose={mockOnClose} mode="create" />,
        { wrapper }
      );

      expect(screen.getByText('Add Client')).toBeInTheDocument();
    });

    it('should show "Edit Client" title in edit mode', () => {
      render(
        <ClientModal
          isOpen={true}
          onClose={mockOnClose}
          mode="edit"
          client={mockClient}
        />,
        { wrapper }
      );

      expect(screen.getByText('Edit Client')).toBeInTheDocument();
    });
  });

  describe('Modal Closing', () => {
    it('should call onClose when close button clicked with no changes', () => {
      render(
        <ClientModal isOpen={true} onClose={mockOnClose} mode="create" />,
        { wrapper }
      );

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should show confirmation when closing with unsaved changes', async () => {
      const confirmSpy = jest.spyOn(window, 'confirm');
      confirmSpy.mockReturnValue(true);

      render(
        <ClientModal isOpen={true} onClose={mockOnClose} mode="create" />,
        { wrapper }
      );

      // Make a change to the form
      const nameInput = screen.getByLabelText(/Name/i);

      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'Test Client' } });
        // Small delay to allow form state to propagate
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      // Try to close
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(confirmSpy).toHaveBeenCalledWith(
          'You have unsaved changes. Are you sure you want to close?'
        );
      });

      confirmSpy.mockRestore();
    });

    it('should not close when user cancels confirmation', async () => {
      const confirmSpy = jest.spyOn(window, 'confirm');
      confirmSpy.mockReturnValue(false);

      render(
        <ClientModal isOpen={true} onClose={mockOnClose} mode="create" />,
        { wrapper }
      );

      // Make a change
      const nameInput = screen.getByLabelText(/Name/i);

      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'Test Client' } });
        // Small delay to allow form state to propagate
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      // Try to close
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(confirmSpy).toHaveBeenCalled();
        expect(mockOnClose).not.toHaveBeenCalled();
      });

      confirmSpy.mockRestore();
    });
  });

  describe('Edit Mode', () => {
    it('should pre-fill form with client data in edit mode', () => {
      render(
        <ClientModal
          isOpen={true}
          onClose={mockOnClose}
          mode="edit"
          client={mockClient}
        />,
        { wrapper }
      );

      expect(screen.getByDisplayValue(mockClient.name)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockClient.company!)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockClient.role!)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockClient.email!)).toBeInTheDocument();
    });
  });
});
