/**
 * ClientForm Component Tests
 * Story 2.3: Add/Edit Client Modal - Task 9
 *
 * Tests for:
 * - Form validation (required fields, email format, URL format)
 * - Save button disabled when form invalid
 * - Save button enabled when form valid
 * - Create client success flow
 * - Edit client success flow
 * - Error handling
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClientForm } from '../ClientForm';
import { Client } from '@meetsolis/shared';
import { toast } from 'sonner';

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

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

describe('ClientForm', () => {
  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();
  const mockOnDirtyChange = jest.fn();
  const mockOnSubmittingChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Form Validation', () => {
    it('should show error when name is empty', async () => {
      render(
        <ClientForm
          mode="create"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
          onDirtyChange={mockOnDirtyChange}
          onSubmittingChange={mockOnSubmittingChange}
        />,
        { wrapper }
      );

      const nameInput = screen.getByLabelText(/Name/i);
      const saveButton = screen.getByText('Save');

      // Initially, save button should be disabled
      expect(saveButton).toBeDisabled();

      // Enter a value then remove it to trigger validation
      fireEvent.change(nameInput, { target: { value: 'A' } });
      fireEvent.change(nameInput, { target: { value: '' } });

      await waitFor(() => {
        expect(saveButton).toBeDisabled();
      });
    });

    it('should show error when name is too short', async () => {
      render(
        <ClientForm
          mode="create"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
          onDirtyChange={mockOnDirtyChange}
          onSubmittingChange={mockOnSubmittingChange}
        />,
        { wrapper }
      );

      const nameInput = screen.getByLabelText(/Name/i);

      fireEvent.change(nameInput, { target: { value: 'A' } });
      fireEvent.blur(nameInput);

      await waitFor(() => {
        expect(
          screen.getByText(/Name must be at least 2 characters/i)
        ).toBeInTheDocument();
      });
    });

    it('should show error when email format is invalid', async () => {
      render(
        <ClientForm
          mode="create"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
          onDirtyChange={mockOnDirtyChange}
          onSubmittingChange={mockOnSubmittingChange}
        />,
        { wrapper }
      );

      const emailInput = screen.getByLabelText(/Email/i);

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText(/Invalid email format/i)).toBeInTheDocument();
      });
    });

    it('should show error when website URL is invalid', async () => {
      render(
        <ClientForm
          mode="create"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
          onDirtyChange={mockOnDirtyChange}
          onSubmittingChange={mockOnSubmittingChange}
        />,
        { wrapper }
      );

      const websiteInput = screen.getByLabelText(/Website/i);

      fireEvent.change(websiteInput, { target: { value: 'not-a-url' } });
      fireEvent.blur(websiteInput);

      await waitFor(() => {
        expect(screen.getByText(/Invalid URL format/i)).toBeInTheDocument();
      });
    });

    it('should enable save button when form is valid', async () => {
      render(
        <ClientForm
          mode="create"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
          onDirtyChange={mockOnDirtyChange}
          onSubmittingChange={mockOnSubmittingChange}
        />,
        { wrapper }
      );

      const nameInput = screen.getByLabelText(/Name/i);
      const saveButton = screen.getByText('Save');

      // Initially disabled
      expect(saveButton).toBeDisabled();

      // Enter valid name
      fireEvent.change(nameInput, { target: { value: 'Test Client' } });

      await waitFor(() => {
        expect(saveButton).not.toBeDisabled();
      });
    });
  });

  describe('Create Client Flow', () => {
    it('should create client successfully', async () => {
      const mockResponse = {
        id: '123',
        name: 'Test Client',
        user_id: '456',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      render(
        <ClientForm
          mode="create"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
          onDirtyChange={mockOnDirtyChange}
          onSubmittingChange={mockOnSubmittingChange}
        />,
        { wrapper }
      );

      const nameInput = screen.getByLabelText(/Name/i);
      const saveButton = screen.getByText('Save');

      fireEvent.change(nameInput, { target: { value: 'Test Client' } });

      await waitFor(() => {
        expect(saveButton).not.toBeDisabled();
      });

      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('Test Client'),
        });
        expect(toast.success).toHaveBeenCalledWith('Client added successfully');
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('should handle create error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: { message: 'Client limit reached' },
        }),
      });

      render(
        <ClientForm
          mode="create"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
          onDirtyChange={mockOnDirtyChange}
          onSubmittingChange={mockOnSubmittingChange}
        />,
        { wrapper }
      );

      const nameInput = screen.getByLabelText(/Name/i);
      const saveButton = screen.getByText('Save');

      fireEvent.change(nameInput, { target: { value: 'Test Client' } });

      await waitFor(() => {
        expect(saveButton).not.toBeDisabled();
      });

      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Client limit reached');
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });
    });
  });

  describe('Edit Client Flow', () => {
    it('should pre-fill form with existing client data', () => {
      render(
        <ClientForm
          mode="edit"
          client={mockClient}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
          onDirtyChange={mockOnDirtyChange}
          onSubmittingChange={mockOnSubmittingChange}
        />,
        { wrapper }
      );

      expect(screen.getByDisplayValue(mockClient.name)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockClient.company!)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockClient.role!)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockClient.email!)).toBeInTheDocument();
    });

    it('should update client successfully', async () => {
      const mockResponse = { ...mockClient, name: 'Updated Name' };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      render(
        <ClientForm
          mode="edit"
          client={mockClient}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
          onDirtyChange={mockOnDirtyChange}
          onSubmittingChange={mockOnSubmittingChange}
        />,
        { wrapper }
      );

      const nameInput = screen.getByLabelText(/Name/i);
      const saveButton = screen.getByText('Save');

      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

      await waitFor(() => {
        expect(saveButton).not.toBeDisabled();
      });

      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `/api/clients/${mockClient.id}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: expect.stringContaining('Updated Name'),
          }
        );
        expect(toast.success).toHaveBeenCalledWith(
          'Client updated successfully'
        );
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('Cancel Button', () => {
    it('should call onCancel when cancel button clicked', () => {
      render(
        <ClientForm
          mode="create"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
          onDirtyChange={mockOnDirtyChange}
          onSubmittingChange={mockOnSubmittingChange}
        />,
        { wrapper }
      );

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });
});
